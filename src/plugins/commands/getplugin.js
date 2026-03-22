import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { user, permissionManager, args, send, chatId, prefix }) => {
  if (!permissionManager.isOwner(user)) {
    return 'Owner-Berechtigung erforderlich.';
  }
  
  if (!args[0]) {
    return `${prefix}getplugin <name>\n\nBeispiel: ${prefix}getplugin menu`;
  }
  
  const pluginName = args[0].toLowerCase();
  const pluginPath = path.join(process.cwd(), 'src', 'plugins', 'commands', `${pluginName}.js`);
  
  try {
    const code = await fs.readFile(pluginPath, 'utf8');
    
    if (code.length > 60000) {
      return `❌ Plugin zu groß (${code.length} Zeichen)\n\nWhatsApp-Limit: 60.000`;
    }
    
    let response = `📦 Plugin: ${pluginName}\n`;
    response += `📏 Größe: ${code.length} Zeichen\n\n`;
    response += '```javascript\n';
    response += code;
    response += '\n```';
    
    return response;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return `❌ Plugin nicht gefunden: ${pluginName}`;
    }
    return `❌ Fehler: ${error.message}`;
  }
};

handler.help = ['getplugin'];
handler.tags = ['owner'];
handler.command = ['getplugin', 'showplugin'];
handler.owner = true;

export default handler;
