import fs from 'fs/promises';
import readline from 'readline';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function listSessions() {
  const sessionsDir = path.join(__dirname, 'sessions');
  try {
    await fs.mkdir(sessionsDir, { recursive: true });
    const files = await fs.readdir(sessionsDir);
    const sessions = files.filter(f => !f.includes('.'));
    return sessions;
  } catch (e) {
    return [];
  }
}

async function convertToJID(phoneNumber) {
  // Remove all non-numeric characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Remove leading + if present
  if (cleanNumber.startsWith('+')) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  // Create JID format for WhatsApp
  const jid = `${cleanNumber}@s.whatsapp.net`;
  
  console.log(`\n📞 Konvertiere Nummer zu WhatsApp JID: ${jid}`);
  
  return jid;
}

async function initOwnerInDatabase(ownerJid, botName, dbPassword) {
  try {
    // Import database modules
    const EncryptedDatabase = (await import('./src/database/EncryptedDatabase.js')).default;
    
    // Get config to find database path
    const configPath = path.join(__dirname, 'config.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    const dbPath = path.resolve(__dirname, config.database.path);
    
    console.log('\n💾 Initialisiere Datenbank für Owner-Registrierung...');
    
    // Create database instance
    const database = new EncryptedDatabase(dbPath, dbPassword);
    await database.load();
    
    console.log('✅ Datenbank geladen');
    
    // Check if owner already exists
    let ownerUser = database.getUser(ownerJid);
    
    if (ownerUser) {
      console.log('⚠️ Owner existiert bereits in der Datenbank');
      console.log('   Aktualisiere Owner-Rechte...');
    } else {
      console.log('📝 Erstelle Owner-Account...');
      ownerUser = {
        name: 'Bot Owner',
        platformIds: [ownerJid],
        registered: true,
        registeredAt: Date.now(),
        dsgvoAccepted: true,
        teamm: 'ersteller',
        level: 0,
        exp: 0,
        money: 0,
        coins: 1000,
        items: {},
        cooldown: {},
        commandsUsed: 0,
        messagesCount: 0,
        lastSeen: Date.now()
      };
    }
    
    // Ensure owner has creator rank
    ownerUser.teamm = 'ersteller';
    ownerUser.registered = true;
    ownerUser.dsgvoAccepted = true;
    
    // Save owner to database
    await database.setUser(ownerJid, ownerUser);
    await database.save();
    
    console.log('✅ Owner erfolgreich registriert mit Rang "Ersteller"');
    console.log(`   JID: ${ownerJid}`);
    
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren des Owners:', error.message);
    console.log('⚠️ Owner wird beim ersten Bot-Start manuell registriert werden müssen');
  }
}

async function setup() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 WhatsApp Bot Setup-Assistent     ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log('Dieser Assistent hilft dir bei der Erstkonfiguration.\n');
  
  // Check if already setup
  try {
    const configContent = await fs.readFile('config.json', 'utf8');
    const config = JSON.parse(configContent);
    
    if (!config.bot.owner.includes('xxxxxx')) {
      console.log('✅ Bot scheint bereits konfiguriert zu sein!');
      const reconfigure = await question('\nMöchtest du trotzdem neu konfigurieren? (j/n): ');
      if (reconfigure.toLowerCase() !== 'j') {
        console.log('Setup abgebrochen.');
        rl.close();
        return;
      }
    }
  } catch (e) {
    console.log('⚠️ Keine config.json gefunden, erstelle neue Konfiguration...\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 BASIC SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Get bot basic settings
  const botName = await question('🤖 Wie soll dein Bot heißen? (z.B. "MeinBot"): ');
  const botDescription = await question('📝 Bot-Beschreibung (optional): ') || `${botName} - WhatsApp Bot`;
  const prefix = await question('⌨️ Bot-Prefix (z.B. ".", "!", "/"): ') || '.';
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 OWNER SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Tipp: WhatsApp-Nummer OHNE + eingeben');
  console.log('   Beispiel: 4915012345678\n');
  
  let ownerNumber = await question('📱 Deine WhatsApp-Nummer (z.B. 4915012345678): ');
  const ownerJid = await convertToJID(ownerNumber);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📂 SESSION SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // List existing sessions
  const existingSessions = await listSessions();
  
  if (existingSessions.length > 0) {
    console.log('Vorhandene Sessions:');
    existingSessions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`);
    });
    console.log();
  }
  
  const sessionId = await question('📱 Session-ID (z.B. "bot", "main", "business"): ') || 'bot';
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 SECURITY SETTINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Generate secrets
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  console.log('🔐 Generiere sichere Secrets...');
  console.log('✅ Secrets generiert\n');
  
  // Get database password
  console.log('💾 Datenbank-Passwort wird benötigt für:');
  console.log('   • Verschlüsselte Datenspeicherung');
  console.log('   • Owner-Account Initialisierung\n');
  
  const dbPassword = await question('🔑 Datenbank-Passwort erstellen: ');
  
  if (!dbPassword || dbPassword.length < 8) {
    console.log('⚠️ Passwort sollte mindestens 8 Zeichen haben!');
    const continueAnyway = await question('Trotzdem fortfahren? (j/n): ');
    if (continueAnyway.toLowerCase() !== 'j') {
      console.log('Setup abgebrochen.');
      rl.close();
      return;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💾 ERSTELLE KONFIGURATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Create .env
  console.log('📝 Erstelle .env Datei...');
  const envContent = `# WhatsApp Bot Environment Variables
# Generiert am ${new Date().toISOString()}

# Session Secret (nicht ändern!)
SESSION_SECRET=${sessionSecret}

# JWT Secret (nicht ändern!)
JWT_SECRET=${jwtSecret}

# Node Environment
NODE_ENV=development

# Datenbank-Passwort
DB_PASSWORD=${dbPassword}

# Session ID
SESSION_ID=${sessionId}
`;
  await fs.writeFile('.env', envContent);
  console.log('✅ .env erstellt');
  
  // Update config.json
  console.log('⚙️ Aktualisiere config.json...');
  const config = JSON.parse(await fs.readFile('config.json', 'utf8'));
  config.bot.owner = ownerJid;
  config.bot.name = botName;
  config.bot.description = botDescription;
  config.bot.prefix = prefix;
  config.bot.sessionId = sessionId;
  config.website.sessionSecret = 'USE_ENV_VARIABLE';
  config.website.jwtSecret = 'USE_ENV_VARIABLE';
  
  await fs.writeFile('config.json', JSON.stringify(config, null, 2));
  console.log('✅ config.json aktualisiert');
  
  // Create data directory
  console.log('📁 Erstelle Daten-Verzeichnisse...');
  await fs.mkdir('./data', { recursive: true });
  await fs.mkdir('./data/backups', { recursive: true });
  console.log('✅ Verzeichnisse erstellt');
  
  // Check .gitignore
  try {
    const gitignoreContent = await fs.readFile('.gitignore', 'utf8');
    if (!gitignoreContent.includes('.env')) {
      console.log('⚠️ .gitignore enthält kein .env - wird hinzugefügt');
      await fs.writeFile('.gitignore', gitignoreContent + '\n.env\ndata/\n');
    }
  } catch (e) {
    console.log('⚠️ Keine .gitignore gefunden');
  }
  
  console.log('\n✅ Setup abgeschlossen!\n');
  console.log('📝 Zusammenfassung:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Create data directory
  console.log('📁 Erstelle Daten-Verzeichnisse...');
  await fs.mkdir('./data', { recursive: true });
  await fs.mkdir('./data/backups', { recursive: true });
  await fs.mkdir('./sessions', { recursive: true });
  console.log('✅ Verzeichnisse erstellt');
  
  // Initialize owner in database
  console.log('\n👤 Registriere Owner in der Datenbank...');
  await initOwnerInDatabase(ownerJid, botName, dbPassword);
  
  // Check .gitignore
  try {
    const gitignoreContent = await fs.readFile('.gitignore', 'utf8');
    if (!gitignoreContent.includes('.env')) {
      console.log('⚙️ Aktualisiere .gitignore...');
      await fs.writeFile('.gitignore', gitignoreContent + '\n.env\ndata/\nsessions/\n');
      console.log('✅ .gitignore aktualisiert');
    }
  } catch (e) {
    console.log('📝 Erstelle .gitignore...');
    await fs.writeFile('.gitignore', 'node_modules/\n.env\ndata/\nsessions/\n*.log\n');
    console.log('✅ .gitignore erstellt');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SETUP ABGESCHLOSSEN!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Zusammenfassung:');
  console.log('┌────────────────────────────────────────┐');
  console.log(`│ 🤖 Bot-Name:     ${botName.padEnd(22)}│`);
  console.log(`│ 📝 Beschreibung: ${botDescription.substring(0, 22).padEnd(22)}│`);
  console.log(`│ ⌨️  Prefix:       ${prefix.padEnd(22)}│`);
  console.log(`│ 📱 Owner JID:    ${ownerJid.substring(0, 22).padEnd(22)}│`);
  console.log(`│ 📂 Session:      ${sessionId.padEnd(22)}│`);
  console.log('└────────────────────────────────────────┘\n');
  
  console.log('📚 Nächste Schritte:');
  console.log('  1. Starte den Bot: npm start');
  console.log(`  2. QR-Code mit WhatsApp scannen (Nummer: ${ownerNumber})`);
  console.log('  3. Du bist automatisch als Owner registriert!');
  console.log('  4. Web-Passwort setzen: .setwebpass <passwort>');
  console.log('  5. Dashboard öffnen: http://localhost:3001/dashboard\n');
  
  console.log('⚠️  WICHTIG:');
  console.log('  • Datenbank-Passwort: ' + '*'.repeat(dbPassword.length));
  console.log('  • Dieses Passwort wird beim Bot-Start benötigt!');
  console.log('  • Teile niemals deine .env Datei!');
  console.log('  • Mache regelmäßig Backups!\n');
  
  console.log('💡 TIPP: Nutze "node session-manager.js" um Sessions zu verwalten\n');
  
  const startNow = await question('Möchtest du den Bot jetzt starten? (j/n): ');
  rl.close();
  
  if (startNow.toLowerCase() === 'j') {
    console.log('\n🚀 Starte Bot...\n');
    const { spawn } = await import('child_process');
    const bot = spawn('npm', ['start'], { 
      stdio: 'inherit',
      shell: true 
    });
  } else {
    console.log('\n💡 Starte den Bot später mit: npm start');
    console.log('   Oder nutze: npm run start:watch (mit Auto-Restart)\n');
  }
}

setup().catch(error => {
  console.error('❌ Fehler beim Setup:', error);
  rl.close();
  process.exit(1);
});
