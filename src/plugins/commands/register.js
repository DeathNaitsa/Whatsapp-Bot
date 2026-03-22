const handler = async (m, { user, database, config, dsgvoManager, chatId, sender, args, messageData, isGroup, prefix }) => {
  if (isGroup) {
    return `Registrierung nur im Privatchat möglich.\n\nSchreib mir privat: ${prefix}register <username>`;
  }
  
  if (user.registered) {
    return `Bereits registriert.\n\n${prefix}profil`;
  }
  
  if (!args[0]) {
    return `Willkommen! 🎉

Ich brauche nur noch einen coolen Namen von dir!

💬 So geht's: ${prefix}register <dein_name>

Zum Beispiel:
${prefix}register MaxMustermann

📝 Ein paar kleine Regeln:
• 3-20 Zeichen
• Buchstaben, Zahlen, _ und -
• Keine Leerzeichen

Was soll's sein? 😊`;
  }
  
  const username = args[0];
  
  if (username.length < 3 || username.length > 20) {
    return '3-20 Zeichen erforderlich.';
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Nur a-z, 0-9, _ und - erlaubt.';
  }
  
  const allUsers = database.getAllUsers();
  const alreadyRegistered = Object.values(allUsers).some(u => {
    if (!u.platformIds || !u.registered) return false;
    return u.platformIds.some(id => id === sender || (messageData?.senderAlt && id === messageData.senderAlt));
  });
  
  if (alreadyRegistered) {
    return `Nummer bereits registriert.\n\n${prefix}profil`;
  }
  
  let displayName = username;
  let uniqueUsername = username;
  
  const existingWithSameName = Object.values(allUsers).filter(u => 
    u.displayName?.toLowerCase() === username.toLowerCase() || 
    u.username?.toLowerCase().startsWith(username.toLowerCase())
  );
  
  if (existingWithSameName.length > 0) {
    let discriminator = 1;
    while (Object.values(allUsers).some(u => u.username?.toLowerCase() === `${username.toLowerCase()}${discriminator}`)) {
      discriminator++;
    }
    uniqueUsername = `${username}${discriminator}`;
  }
  
  const userIds = [sender];
  if (messageData?.senderAlt && !userIds.includes(messageData.senderAlt)) {
    userIds.push(messageData.senderAlt);
  }
  
  console.log('🔍 Register Debug:', {
    sender,
    senderAlt: messageData?.senderAlt,
    userIds,
    displayName: displayName,
    uniqueUsername: uniqueUsername
  });
  
  user.displayName = displayName;
  user.username = uniqueUsername;
  user.name = displayName;
  user.registered = true;
  user.registeredAt = Date.now();
  user.dsgvoAccepted = false;
  user.platformIds = userIds;
  user.level = 1;
  user.exp = 0;
  user.money = 1000;
  user.coins = 100;
  user.items = {
    pickaxe: 1,
    pickaxedurability: 40,
    sword: 1,
    sworddurability: 40
  };
  user._temporary = false;
  
  await database.setUser(sender, user);
  
  let message = `✅ Registriert: ${displayName}\n\n`;
  
  if (uniqueUsername !== displayName) {
    message += `🔑 Login: ${uniqueUsername}\n`;
    message += `(Name vergeben, für Website)\n\n`;
  }
  
  message += `🎁 Startbonus:\n`;
  message += `• 1.000 💵\n`;
  message += `• 100 🪙\n`;
  message += `• ⛏️ Spitzhacke\n`;
  message += `• ⚔️ Schwert\n\n`;
  
  message += `⚠️ Noch nicht fertig!\n\n`;
  message += `Du musst noch die DSGVO akzeptieren:\n`;
  message += `📄 ${prefix}dsgvo (lesen)\n`;
  message += `✅ ${prefix}acceptdsgvo (zustimmen)`;
  
  return message;
};

handler.help = ['register'];
handler.tags = ['user'];
handler.command = ['register', 'registrieren', 'reg'];

export default handler;
