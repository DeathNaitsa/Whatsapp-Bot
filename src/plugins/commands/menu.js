const handler = async (m, { user, database, config, permissionManager, dsgvoManager, chatId, pluginManager, prefix }) => {
  if (!pluginManager) {
    return '❌ Plugin-System nicht verfügbar';
  }
  
  const userPermissions = {
    owner: permissionManager.isOwner(user),
    team: permissionManager.isTeam(user),
    premium: user.premium || false
  };
  
  const menuText = pluginManager.generateMenuText(userPermissions, prefix);
  
  let response = `${user.name}\n\n`;
  response += menuText;
  
  if (user.teamm) {
    response += `\n\nTeam: ${user.teamm}`;
  }
  
  if (user.premium) {
    response += `\n⭐ Premium`;
  }
  
  return response;
};

handler.help = ['menu', 'commands'];
handler.tags = ['main'];
handler.command = ['menu', 'commands'];
handler.description = 'Zeigt alle verfügbaren Commands';
handler.usage = 'menu';
handler.example = 'menu';

export default handler;
