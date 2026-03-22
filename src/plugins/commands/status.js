import os from 'os';

const handler = async (m, { user, database, config, permissionManager }) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  let response = '📊 *Bot Status*\n\n';
  
  response += `🤖 *Bot-Information*\n`;
  response += `├ Name: ${config.bot.name}\n`;
  response += `├ Version: ${config.bot.version}\n`;
  response += `├ Status: 🟢 Online\n`;
  response += `└ Uptime: ${hours}h ${minutes}m\n\n`;
  
  response += `🖥️ *System*\n`;
  response += `├ Platform: ${os.platform()}\n`;
  response += `├ CPU: ${os.cpus().length} Cores\n`;
  response += `├ RAM: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\n`;
  response += `└ Node: ${process.version}\n\n`;
  
  const users = database.getAllUsers();
  const registeredUsers = Object.values(users).filter(u => u.registered).length;
  const premiumUsers = Object.values(users).filter(u => u.premium).length;
  
  response += `📈 *Statistiken*\n`;
  response += `├ Benutzer: ${Object.keys(users).length}\n`;
  response += `├ Registriert: ${registeredUsers}\n`;
  response += `├ Premium: ${premiumUsers}\n`;
  response += `└ Gruppen: ${Object.keys(database.data.groups || {}).length}\n\n`;
  
  response += `🌐 *Website*\n`;
  response += `├ Status: 🟢 Online\n`;
  response += `└ Port: ${config.website.port}\n\n`;
  
  if (permissionManager.isTeam(user)) {
    response += `👤 *Dein Account*\n`;
    response += `├ Rang: ${user.teamm || 'User'}\n`;
    response += `├ Level: ${user.level || 0}\n`;
    response += `└ Premium: ${user.premium ? '⭐ Ja' : '❌ Nein'}\n`;
  }
  
  return response;
};

handler.help = ['status', 'info'];
handler.tags = ['info'];
handler.command = ['status', 'info', 'botstatus'];

export default handler;
