const handler = async (m, { user, database, config, chatId, prefix }) => {
  if (!user.registered && !user.teamm && !user.name) {
    return `Nicht registriert.\n\n${prefix}register <username>`;
  }
  
  let response = `Hier ist dein Profil, ${user.name}! 👤\n\n`;
  
  // Basis-Info
  response += `Seit: ${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('de-DE') : '-'}\n\n`;
  
  // Stats
  response += `*Stats*\n`;
  response += `Level: ${user.level || 0}\n`;
  response += `XP: ${(user.exp || 0).toLocaleString('de-DE')}\n`;
  response += `Prestige: ${user.prestige || 0}\n`;
  response += `Rolle: ${user.role || 'Neuling'}\n\n`;
  
  // Währungen
  response += `💰 *Währungen*\n`;
  response += `├ Geld: ${(user.money || 0).toLocaleString('de-DE')} 💵\n`;
  response += `├ Dolares: ${(user.dolares || 0).toLocaleString('de-DE')} 💲\n`;
  response += `├ Bank: ${(user.bank || 0).toLocaleString('de-DE')} 🏦\n`;
  response += `└ Coins: ${(user.coins || 0).toLocaleString('de-DE')} 🪙\n\n`;
  
  // Team
  if (user.teamm) {
    response += `👥 *Team*\n`;
    response += `├ Rang: ${user.teamm}\n`;
    response += `└ Label: ${user.label || 'Team-Mitglied'}\n\n`;
  }
  
  // Premium
  if (user.premium) {
    response += `⭐ *Premium*\n`;
    response += `└ Aktiv bis: ${user.premiumDate ? new Date(user.premiumDate).toLocaleDateString('de-DE') : 'Unbegrenzt'}\n\n`;
  }
  
  // Persönliche Info
  if (user.age || user.region || user.gender) {
    response += `ℹ️ *Persönlich*\n`;
    if (user.age) response += `├ Alter: ${user.age}\n`;
    if (user.region) response += `├ Region: ${user.region}\n`;
    if (user.gender) response += `├ Geschlecht: ${user.gender}\n`;
    if (user.pronouns) response += `└ Pronomen: ${user.pronouns}\n`;
    response += `\n`;
  }
  
  // DSGVO Status
  response += `🔒 *Datenschutz*\n`;
  response += `└ DSGVO: ${user.dsgvoAccepted ? '✅ Akzeptiert' : '❌ Nicht akzeptiert'}\n`;
  
  return response;
};

handler.help = ['profil', 'profile'];
handler.tags = ['user'];
handler.command = ['profil', 'profile', 'me', 'ich'];

export default handler;
