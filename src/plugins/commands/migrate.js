import crypto from 'crypto';

const handler = async (m, { user, database, config, chatId, sender, messageData, prefix }) => {
  if (user.registered) {
    return `Bereits registriert.\n\nDein Account ist bereits aktiv.\n${prefix}profil`;
  }
  
  const userIds = [];
  
  const raw = messageData?.raw;
  
  if (raw?.key) {
    if (raw.key.remoteJidAlt && !userIds.includes(raw.key.remoteJidAlt)) {
      userIds.push(raw.key.remoteJidAlt);
      
      const numberOnly = raw.key.remoteJidAlt.split('@')[0];
      if (!userIds.includes(numberOnly)) {
        userIds.push(numberOnly);
      }
    }
    
    if (raw.key.remoteJid && !userIds.includes(raw.key.remoteJid)) {
      userIds.push(raw.key.remoteJid);
      
      const numberOnly = raw.key.remoteJid.split('@')[0];
      if (!userIds.includes(numberOnly)) {
        userIds.push(numberOnly);
      }
    }
    
    if (raw.key.participant && !userIds.includes(raw.key.participant)) {
      userIds.push(raw.key.participant);
    }
    
    if (raw.key.participantAlt && !userIds.includes(raw.key.participantAlt)) {
      userIds.push(raw.key.participantAlt);
    }
  }
  
  if (sender && !userIds.includes(sender)) {
    userIds.push(sender);
  }
  
  if (messageData?.senderAlt && !userIds.includes(messageData.senderAlt)) {
    userIds.push(messageData.senderAlt);
  }
  
  if (messageData?.participant && !userIds.includes(messageData.participant)) {
    userIds.push(messageData.participant);
  }
  
  const hashedIds = userIds.map(id => crypto.createHash('md5').update(id).digest('hex'));
  
  console.log('🔍 Migration Suche (JID + LID aus RAW):', {
    originalIds: userIds,
    hashedIds: hashedIds,
    rawKey: raw?.key,
    sender: sender,
    senderAlt: messageData?.senderAlt,
    participant: messageData?.participant
  });
  
  const oldDbPath = './database.json';
  let oldDb = null;
  
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(oldDbPath, 'utf8');
    const parsed = JSON.parse(content);
    
    oldDb = parsed.users || parsed;
  } catch (error) {
    return `⚠️ Alte Datenbank nicht gefunden.\n\nBitte registriere dich neu:\n${prefix}register <username>`;
  }
  
  let foundData = null;
  let foundMasterSn = null;
  
  for (const hashedId of hashedIds) {
    if (oldDb[hashedId]) {
      foundData = oldDb[hashedId];
      
      if (foundData.master && foundData.master.sn) {
        foundMasterSn = foundData.master.sn;
        
        if (oldDb[foundMasterSn]) {
          console.log(`🔗 Linked Account gefunden! Master SN: ${foundMasterSn}`);
          
          const ownerNumber = config.owner[0];
          return `🔗 *Linked Account erkannt*\n\nDein Account ist mit einem Master-Account verknüpft.\n\n⚠️ Bitte kontaktiere den Owner:\nwa.me/${ownerNumber}\n\nEr wird deine Accounts manuell zusammenführen.`;
        }
      }
      
      break;
    }
  }
  
  if (!foundData) {
    return `❌ Kein alter Account gefunden.\n\nDu kannst dich neu registrieren:\n${prefix}register <username>`;
  }
  
  console.log('✅ Alte Daten gefunden, migriere...');
  
  user.displayName = foundData.name || foundData.supname || 'Migriert';
  user.username = (foundData.name || foundData.supname || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  user.name = user.displayName;
  user.registered = true;
  user.registeredAt = foundData.regTime || Date.now();
  user.platformIds = userIds;
  user.oldHash = hashedIds[0];
  
  user.level = foundData.level || 0;
  user.exp = foundData.exp || 0;
  user.prestige = foundData.prestige || 0;
  
  user.money = foundData.money || 0;
  user.dolares = foundData.dolares || 0;
  user.bank = foundData.bank || 0;
  user.coins = foundData.coins || 0;
  
  user.items = {
    pickaxe: foundData.pickaxe || 0,
    pickaxedurability: foundData.pickaxedurability || 0,
    sword: foundData.sword || 0,
    sworddurability: foundData.sworddurability || 0,
    armor: foundData.armor || 0,
    armordurability: foundData.armordurability || 0
  };
  
  if (foundData.age) user.age = foundData.age;
  if (foundData.region) user.region = foundData.region;
  if (foundData.gender) user.gender = foundData.gender;
  
  if (foundData.teamm) user.teamm = foundData.teamm;
  if (foundData.label) user.label = foundData.label;
  
  if (foundData.premium) user.premium = foundData.premium;
  if (foundData.premiumDate) user.premiumDate = foundData.premiumDate;
  
  user.dsgvoAccepted = false;
  user._migrated = true;
  user._migratedAt = Date.now();
  
  await database.setUser(sender, user);
  
  let response = `✅ *Account migriert!*\n\n`;
  response += `👤 ${user.displayName}\n`;
  response += `📊 Level ${user.level} • ${user.exp} XP\n`;
  response += `💰 ${user.money.toLocaleString('de-DE')} Geld\n`;
  response += `🪙 ${user.coins} Coins\n\n`;
  
  response += `⚠️ *WICHTIG:*\n`;
  response += `Daten migriert, aber DSGVO muss akzeptiert werden!\n\n`;
  response += `📄 ${prefix}dsgvo - Lesen\n`;
  response += `✅ ${prefix}acceptdsgvo - Zustimmen\n\n`;
  response += `Willkommen zurück! 🎉`;
  
  return response;
};

handler.help = ['migrate'];
handler.tags = ['user'];
handler.command = ['migrate', 'migrieren', 'import'];
handler.description = 'Migriert Account aus alter Datenbank';

export default handler;
