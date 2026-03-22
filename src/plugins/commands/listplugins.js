import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { user, permissionManager, pluginManager, prefix }) => {
  if (!permissionManager.isOwner(user)) {
    return 'Owner-Berechtigung erforderlich.';
  }
  
  const pluginDir = path.join(process.cwd(), 'src', 'plugins', 'commands');
  
  try {
    const files = await fs.readdir(pluginDir);
    const plugins = files.filter(f => f.endsWith('.js'));
    
    let response = `📦 Plugins (${plugins.length})\n\n`;
    
    const categories = new Map();
    
    for (const file of plugins) {
      const name = file.replace('.js', '');
      const plugin = pluginManager?.plugins?.get(name);
      const tag = plugin?.tags?.[0] || 'other';
      
      if (!categories.has(tag)) {
        categories.set(tag, []);
      }
      categories.get(tag).push(name);
    }
    
    for (const [category, items] of categories) {
      response += `*${category}*\n`;
      for (const item of items.sort()) {
        response += `├ ${item}\n`;
      }
      response += `\n`;
    }
    
response += `💡 Code anzeigen: ${prefix}getplugin <name>`;
    
    return response;
    
  } catch (error) {
    return `❌ Fehler: ${error.message}`;
  }
};

handler.help = ['listplugins'];
handler.tags = ['owner'];
handler.command = ['listplugins', 'plugins'];
handler.owner = true;

export default handler;
