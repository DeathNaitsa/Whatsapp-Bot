const handler = async (m, { database, config, prefix }) => {
  const allUsers = database.getAllUsers();
  const users = Object.entries(allUsers).filter(([_, userData]) => !userData._temporary);
  
  if (users.length === 0) {
    return '📋 Keine registrierten User gefunden.';
  }
  
  let message = `📋 *Registrierte User (${users.length})*\n\n`;
  
  users.forEach(([userId, userData], index) => {
    const name = userData.name || 'Unbekannt';
    const level = userData.level || 0;
    const prestige = userData.prestige || 0;
    const team = userData.teamm || 'Kein Team';
    const registered = userData.registered ? '✅' : '❌';
    const dsgvo = userData.dsgvoAccepted ? '✅' : '❌';
    
    message += `━━━━━━━━━━━━━━━\n`;
    message += `[${index + 1}] ${name}\n`;
    message += `📱 ID: ${userId}\n`;
    message += `⭐ Level: ${level}`;
    if (prestige > 0) message += ` (P${prestige})`;
    message += `\n`;
    message += `👥 Team: ${team}\n`;
    message += `📝 Registriert: ${registered} | DSGVO: ${dsgvo}\n`;
    
    if (userData.platformIds && userData.platformIds.length > 1) {
      message += `🔗 Alt-IDs: ${userData.platformIds.length - 1}\n`;
    }
  });
  
  message += `━━━━━━━━━━━━━━━\n\n`;
  message += `💡 Tipp: Verwende ${prefix}deleteuser <index> zum Löschen`;
  
  return message;
};

handler.help = ['listusers'];
handler.tags = ['owner'];
handler.command = ['listusers', 'users', 'allusers', 'userlist'];
handler.team = true;

export default handler;
