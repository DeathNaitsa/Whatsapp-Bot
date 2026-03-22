const handler = async (m, { user, database, config, args, sender, prefix }) => {
  if (!args[0]) {
    return `🔑 *Account-Verknüpfung bestätigen*

📋 Verwendung: ${prefix}confirmlink <code>
📌 Beispiel: ${prefix}confirmlink 123456

💡 Du erhältst den Code vom anderen Account!`;
  }
  
  const code = args[0];
  
  if (!global.linkRequests || !global.linkRequests[code]) {
    return '❌ Ungültiger oder abgelaufener Code!\n\n⏱️ Codes sind nur 5 Minuten gültig.';
  }
  
  const request = global.linkRequests[code];
  
  if (Date.now() > request.expiresAt) {
    delete global.linkRequests[code];
    return '❌ Dieser Code ist abgelaufen!\n\n⏱️ Codes sind nur 5 Minuten gültig.\n💡 Lass dir einen neuen Code senden.';
  }
  
  if (sender !== request.toNumber) {
    return '❌ Dieser Code ist nicht für dich!\n\n⚠️ Nur die getaggte Person kann den Code verwenden.';
  }
  
  const fromUser = request.fromUser;
  const toUser = request.toUser;
  
  console.log('🔗 Verknüpfe Accounts:', {
    from: request.fromNumber,
    to: request.toNumber,
    fromUser: fromUser.name,
    toUser: toUser.name
  });
  
  let masterUser, secondaryUser, masterNumber, secondaryNumber;
  
  if ((fromUser.level || 0) >= (toUser.level || 0)) {
    masterUser = fromUser;
    secondaryUser = toUser;
    masterNumber = request.fromNumber;
    secondaryNumber = request.toNumber;
  } else {
    masterUser = toUser;
    secondaryUser = fromUser;
    masterNumber = request.toNumber;
    secondaryNumber = request.fromNumber;
  }
  
  const mergedUser = {
    ...masterUser,
    money: (masterUser.money || 0) + (secondaryUser.money || 0),
    coins: (masterUser.coins || 0) + (secondaryUser.coins || 0),
    exp: Math.max(masterUser.exp || 0, secondaryUser.exp || 0),
    
    items: {
      ...(masterUser.items || {}),
      ...(secondaryUser.items || {})
    },
    
    platformIds: [
      ...(masterUser.platformIds || [masterNumber]),
      ...(secondaryUser.platformIds || [secondaryNumber])
    ].filter((v, i, a) => a.indexOf(v) === i),
    
    commandsUsed: (masterUser.commandsUsed || 0) + (secondaryUser.commandsUsed || 0),
    messagesCount: (masterUser.messagesCount || 0) + (secondaryUser.messagesCount || 0),
    
    lastLinked: Date.now()
  };
  
  await database.setUser(masterNumber, mergedUser);
  await database.setUser(secondaryNumber, mergedUser);
  
  delete global.linkRequests[code];
  
  return `✅ *Accounts erfolgreich verknüpft!*

🔗 Verknüpfte Nummern: 2

👤 *Master-Account:*
├ Name: ${masterUser.displayName || masterUser.name}
├ Level: ${mergedUser.level || 1}
├ Coins: ${mergedUser.coins} 🪙
└ Money: ${mergedUser.money} 💵

📊 *Zusammengeführt:*
├ Coins: ${(masterUser.coins || 0)} + ${(secondaryUser.coins || 0)} = ${mergedUser.coins}
├ Money: ${(masterUser.money || 0)} + ${(secondaryUser.money || 0)} = ${mergedUser.money}
├ Commands: ${mergedUser.commandsUsed}
└ Messages: ${mergedUser.messagesCount}

✨ Beide Nummern können jetzt denselben Account nutzen!
📱 Verwende .profil um deinen Account zu sehen.`;
};

handler.help = ['confirmlink'];
handler.tags = ['user'];
handler.command = ['confirmlink', 'bestätigen'];

export default handler;
