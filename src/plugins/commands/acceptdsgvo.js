const handler = async (m, { user, database, dsgvoManager, chatId, sender, isGroup, isAdmin, prefix }) => {
  if (!isGroup) {
    if (user.dsgvoAccepted) {
      return 'DSGVO bereits akzeptiert.';
    }
    
    if (!user.registered) {
      return `Zuerst registrieren!\n\n${prefix}register <username>`;
    }
    
    await dsgvoManager.userAcceptDsgvo(sender);
    
    let message = `✅ DSGVO akzeptiert\n\nDu kannst jetzt alle Funktionen nutzen.\n\n${prefix}menu`;
    
    return message;
  }
  
  if (!isAdmin) {
    return 'Nur Gruppen-Admins können DSGVO akzeptieren.';
  }
  
  const group = database.getGroup(chatId);
  
  if (group && group.dsgvoAccepted) {
    return 'DSGVO für Gruppe bereits akzeptiert.';
  }
  
  await dsgvoManager.groupAcceptDsgvo(chatId, sender);
  
  return `✅ Gruppen-DSGVO akzeptiert\n\nBot kann nun in Gruppe genutzt werden.\n\n${prefix}menu`;
};

handler.help = ['acceptdsgvo'];
handler.tags = ['user'];
handler.command = ['acceptdsgvo', 'akzeptieren', 'accept'];

export default handler;
