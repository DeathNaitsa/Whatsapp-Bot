import { 
    sendMessage,
    startSession, 
    onMessage, 
    sendText,
    sendImage,
    sendVideo,
    sendAudio,
    sendDocument,
    sendSticker,
    sendContact,
    sendLocation,
    sendReaction,
    client,
    getAllSessionsInfo,
    getGroupMetadata
} from '@deathnaitsa/wa-api';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

import EncryptedDatabase from './src/database/EncryptedDatabase.js';
import DatabaseMigration from './src/database/DatabaseMigration.js';
import PluginManager from './src/plugins/PluginManager.js';
import PermissionManager from './src/utils/PermissionManager.js';
import DsgvoManager from './src/utils/DsgvoManager.js';
import WebServer from './src/website/backend/WebServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config = null;
let database = null;
let pluginManager = null;
let permissionManager = null;
let dsgvoManager = null;
let webServer = null;

async function getPassword() {
    const args = process.argv.slice(2);
    const pIndex = args.indexOf('-p');
    
    if (pIndex !== -1 && args[pIndex + 1]) {
        return args[pIndex + 1];
    }
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('🔐 Datenbank-Passwort: ', (password) => {
            rl.close();
            resolve(password);
        });
    });
}

async function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configContent = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(configContent);
        console.log('✅ Konfiguration geladen');
        return config;
    } catch (error) {
        console.error('❌ Fehler beim Laden der Konfiguration:', error);
        process.exit(1);
    }
}

async function initDatabase(password) {
    try {
        const dbPath = path.resolve(__dirname, config.database.path);
        database = new EncryptedDatabase(dbPath, password);
        await database.load();
        
        if (config.database.autoBackup) {
            const backupPath = path.resolve(__dirname, config.database.backupPath);
            await database.backup(backupPath);
        }
        
        return database;
    } catch (error) {
        console.error('❌ Datenbank-Fehler:', error.message);
        process.exit(1);
    }
}

async function initManagers() {
    permissionManager = new PermissionManager(config);
    console.log('✅ Permission Manager initialisiert');
    
    dsgvoManager = new DsgvoManager(database, config);
    console.log('✅ DSGVO Manager initialisiert');
    
    const pluginDir = path.join(__dirname, 'src', 'plugins', 'commands');
    pluginManager = new PluginManager(pluginDir);
    await pluginManager.loadPlugins();
}

function extractCommand(text, prefix, mentions = []) {
    if (!text.startsWith(prefix)) return null;
    
    const mentionsArray = Array.isArray(mentions) ? mentions : (mentions ? [mentions] : []);
    
    let cleanText = text;
    if (mentionsArray.length > 0) {
        cleanText = text.replace(/@\d+/g, '').trim();
    }
    
    const [command, ...args] = cleanText.slice(prefix.length).trim().split(/\s+/);
    
    return {
        command: command.toLowerCase(),
        args: args,
        fullText: text,
        mentions: mentionsArray
    };
}

function extractUserIds(message) {
    const ids = [];
    
    const primary = message.participant || message.from;
    if (primary) ids.push(primary);
    
    const alt = message.participantAlt;
    if (alt && !ids.includes(alt)) {
        ids.push(alt);
    }
    
    const rawAlt = message.raw?.key?.remoteJidAlt;
    if (rawAlt && !ids.includes(rawAlt)) {
        ids.push(rawAlt);
    }
    
    return ids.length > 0 ? ids : [message.from];
}

async function getOrCreateUser(message, senderName) {
    const userIds = extractUserIds(message);
    const primaryId = userIds[0];
    
    let user = null;
    let existingUserId = null;
    
    for (const id of userIds) {
        user = database.getUser(id);
        if (user) {
            existingUserId = id;
            break;
        }
    }
    
    if (!user) {
        for (const id of userIds) {
            const hash = database.createHash(id);
            const migrated = database.findUserByHash(hash);
            
            if (migrated) {
                user = migrated.userData;
                existingUserId = migrated.userId;
                break;
            }
        }
    }
    
    if (user) {
        if (!user.platformIds) user.platformIds = [];
        
        let needsUpdate = false;
        for (const id of userIds) {
            if (!user.platformIds.includes(id)) {
                user.platformIds.push(id);
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            await database.setUser(existingUserId, user);
        }
    } else {
        user = {
            name: senderName || 'Unbekannt',
            platformIds: userIds,
            registered: false,
            registeredAt: null,
            dsgvoAccepted: false,
            level: 0,
            exp: 0,
            money: 0,
            coins: 0,
            items: {},
            cooldown: {},
            commandsUsed: 0,
            messagesCount: 0,
            lastSeen: Date.now(),
            _temporary: true
        };
    }
    
    return user;
}

async function handleMessage(message) {
    try {
        if (message.from?.includes('@newsletter') || 
            message.from?.includes('status@broadcast')) {
            return;
        }
        
        const sessionId = message.sessionId;
        const chatId = message.from;
        const isGroup = message.isGroup || chatId.endsWith('@g.us');
        const sender = message.participant || message.sender || chatId;
        const senderAlt = message.participantAlt || null;
        const senderName = message.name || 'Unbekannt';
        const messageContent = message.message || '';
        const messageType = message.type || 'Unknown';
        const messageTimestamp = message.timestamp;
        
        const timeStr = new Date(messageTimestamp * 1000).toLocaleTimeString();
        const contentPreview = messageContent.length > 50 
            ? messageContent.substring(0, 50) + '...' 
            : messageContent;
        const groupTag = isGroup ? '👥' : '💬';
        
        console.log(`${groupTag} [${timeStr}] ${senderName}: ${contentPreview} (${messageType})`);
        
        const text = messageContent;
        
        let prefix = config.bot.prefix;
        if (isGroup) {
            const group = database.getGroup(chatId);
            if (group && group.prefix) {
                prefix = group.prefix;
            }
        }
        
        const cmd = extractCommand(text, prefix, message.mentions || []);
        if (!cmd) return;
        
        const user = await getOrCreateUser(message, senderName);
        
        if (user.registered && !user._temporary) {
            const xpGain = Math.floor(Math.random() * 3) + 1;
            user.exp = (user.exp || 0) + xpGain;
            
            let leveledUp = false;
            let oldLevel = user.level || 0;
            let newLevel = oldLevel;
            
            while (user.exp >= Math.pow(newLevel + 1, 2) * 100) {
                newLevel++;
                leveledUp = true;
            }
            
            if (leveledUp) {
                user.level = newLevel;
                
                if (newLevel >= 100 && (user.prestige || 0) < 10) {
                    await sendText(sessionId, chatId, 
                        `🌟 *PRESTIGE VERFÜGBAR!* 🌟\n\n` +
                        `Du hast Level 100 erreicht!\n` +
                        `Nutze .prestige um dein Level zurückzusetzen und Boni zu erhalten!\n\n` +
                        `Prestige-Boni:\n` +
                        `• +50% XP Multiplikator\n` +
                        `• +1000 Coins\n` +
                        `• Exklusiver Prestige-Rang`
                    );
                } else {
                    const coinReward = newLevel * 10;
                    user.coins = (user.coins || 0) + coinReward;
                    
                    await sendText(sessionId, chatId, 
                        `🎉 *LEVEL UP!* 🎉\n\n` +
                        `Level ${oldLevel} → ${newLevel}\n` +
                        `Belohnung: ${coinReward} Coins 💰\n` +
                        `XP: ${user.exp}/${Math.pow(newLevel + 1, 2) * 100}`
                    );
                }
            }
            
            user.messagesCount = (user.messagesCount || 0) + 1;
            user.lastSeen = Date.now();
            
            const primaryId = extractUserIds(message)[0];
            await database.setUser(primaryId, user);
        }
        
        const plugin = pluginManager.getPlugin(cmd.command);
        
        if (!plugin) {
            return;
        }
        
        if (plugin.disabled) {
            await sendText(sessionId, chatId, '❌ Dieser Command ist deaktiviert.');
            return;
        }
        
        if (!isGroup) {
            if (!user.registered && !dsgvoManager.canUseCommand(sender, cmd.command)) {
                const dsgvoText = dsgvoManager.getShortDsgvoText();
                await sendText(sessionId, chatId, dsgvoText);
                return;
            }
        } else {
            if (!dsgvoManager.canUseCommandInGroup(chatId, cmd.command)) {
                const groupDsgvoText = dsgvoManager.getGroupDsgvoText();
                await sendText(sessionId, chatId, groupDsgvoText);
                return;
            }
        }
        
        let isAdmin = false;
        if (isGroup) {
            try {
                const groupMetadata = await getGroupMetadata(sessionId, chatId);
                if (groupMetadata?.participants) {
                    const participant = groupMetadata.participants.find(p => 
                        p.id === sender || 
                        p.jid === sender ||
                        (senderAlt && (p.id === senderAlt || p.jid === senderAlt))
                    );
                    isAdmin = participant && participant.admin;
                }
            } catch (e) {
                console.error('❌ Fehler beim Admin-Check:', e.message);
                isAdmin = permissionManager.isOwner(user);
            }
        }
        
        if (plugin.owner && !permissionManager.isOwner(user)) {
            await sendText(sessionId, chatId, '❌ Dieser Command ist nur für Owner verfügbar.');
            return;
        }
        
        if (plugin.team && !permissionManager.isTeam(user)) {
            await sendText(sessionId, chatId, '❌ Dieser Command ist nur für Team-Mitglieder verfügbar.');
            return;
        }
        
        if (plugin.premium && !user.premium) {
            await sendText(sessionId, chatId, '❌ Dieser Command ist nur für Premium-User verfügbar.');
            return;
        }
      
        const result = await pluginManager.executePlugin(cmd.command, message, {
            user,
            database,
            config,
            permissionManager,
            dsgvoManager,
            pluginManager,
            args: cmd.args,
            prefix: prefix,
            isGroup,
            isAdmin,
            sender,
            chatId,
            sessionId,
            
            sendMessage: (to, message, options) => sendMessage(sessionId, to, message, options),

            send: {
                text: (to, text, options) => sendText(sessionId, to, text, options),
                image: (to, image, caption, options) => sendImage(sessionId, to, image, caption, options),
                video: (to, video, caption, options) => sendVideo(sessionId, to, video, caption, options),
                audio: (to, audio, options) => sendAudio(sessionId, to, audio, options),
                document: (to, document, options) => sendDocument(sessionId, to, document, options),
                sticker: (to, sticker, options) => sendSticker(sessionId, to, sticker, options),
                contact: (to, contact, options) => sendContact(sessionId, to, contact, options),
                location: (to, lat, long, options) => sendLocation(sessionId, to, lat, long, options),
                reaction: (to, messageId, emoji) => sendReaction(sessionId, to, messageId, emoji)
            },
            messageData: {
                raw: message.raw,
                text: messageContent,
                type: messageType,
                timestamp: messageTimestamp,
                name: senderName,
                mentions: message.mentions,
                isGroup: isGroup,
                chatId: chatId,
                sender: sender,
                senderAlt: senderAlt,
                id: message.id,
                fromMe: message.fromMe
            }
        });
        
        if (result && typeof result === 'string') {
            await sendText(sessionId, chatId, result);
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Verarbeiten der Nachricht:', error);
    }
}

async function main() {
    console.log('🤖 Bot startet...\n');
    
    await loadConfig();
    
    const password = await getPassword();
    
    await initDatabase(password);
    
    await initManagers();
    
    console.log('\n✅ Alle Systeme bereit!\n');
    
    const sessions = ['bot'];
    
    for (const sessionId of sessions) {
        const sessionPath = path.join(__dirname, 'sessions', sessionId);
        
        try {
            await startSession(sessionId, sessionPath);
            console.log(`✅ Session gestartet: ${sessionId}`);
            
            onMessage(handleMessage);
            
        } catch (error) {
            console.error(`❌ Fehler bei Session ${sessionId}:`, error);
        }
    }
    
    try {
        webServer = new WebServer(database, config, permissionManager, dsgvoManager, { 
            client, 
            pluginManager 
        });
        await webServer.start();
        console.log(`✅ WebServer läuft auf Port ${config.website.port}`);
    } catch (error) {
        console.error('❌ Fehler beim Starten des WebServers:', error);
    }
    
    console.log('\n🎉 Bot läuft!\n');
    console.log(`📋 Prefix: ${config.bot.prefix}`);
    console.log(`🔌 Plugins: ${pluginManager.plugins.size}`);
    console.log(`👥 Kategorien: ${pluginManager.categories.size}`);
    console.log(`🌐 Website: http://localhost:${config.website.port}\n`);
    
    setInterval(async () => {
        try {
            const statsPath = path.join(__dirname, 'sessions', 'stats.json');
            const statsContent = await fs.readFile(statsPath, 'utf-8');
            const stats = JSON.parse(statsContent);
            stats.lastUpdated = Date.now();
            await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
        } catch (e) {
        }
    }, 60000);
}

if (process.argv.includes('--migrate')) {
    (async () => {
        console.log('🔄 Migration-Modus\n');
        
        await loadConfig();
        const password = await getPassword();
        await initDatabase(password);
        
        const oldDbPath = process.argv[process.argv.indexOf('--migrate') + 1];
        
        if (!oldDbPath) {
            console.error('❌ Bitte gib den Pfad zur alten Datenbank an:');
            console.log('node index.js --migrate ./alte-datenbank.json');
            process.exit(1);
        }
        
        const migration = new DatabaseMigration(oldDbPath, database);
        await migration.migrate();
        
        console.log('\n✅ Migration abgeschlossen!');
        process.exit(0);
    })();
} else {
    main().catch(error => {
        console.error('❌ Kritischer Fehler:', error);
        process.exit(1);
    });
}
