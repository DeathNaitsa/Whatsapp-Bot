import fs from 'fs/promises';
import path from 'path';
import vm from 'vm';

const handler = async (m, { user, permissionManager, args, pluginManager, prefix }) => {
  if (!permissionManager.isOwner(user)) {
    return 'Owner-Berechtigung erforderlich.';
  }
  
  if (args.length < 2) {
    return `${prefix}addplugin <name> <code>\n\nBeispiel:\n${prefix}addplugin test const handler = async (m) => { return 'Test'; }; export default handler;`;
  }
  
  const pluginName = args[0].toLowerCase();
  const code = args.slice(1).join(' ');
  
  if (!/^[a-z0-9_-]+$/.test(pluginName)) {
    return '❌ Name: nur a-z, 0-9, _ und -';
  }
  
  const validation = validatePluginCode(code);
  if (!validation.valid) {
    return `❌ Code-Fehler:\n\n${validation.errors.join('\n')}`;
  }
  
  const pluginPath = path.join(process.cwd(), 'src', 'plugins', 'commands', `${pluginName}.js`);
  
  try {
    let exists = false;
    try {
      await fs.access(pluginPath);
      exists = true;
    } catch {}
    
    await fs.writeFile(pluginPath, code, 'utf8');
    
    if (pluginManager) {
      await pluginManager.loadPlugins();
    }
    
    const action = exists ? 'überschrieben' : 'erstellt';
    return `✅ Plugin ${action}: ${pluginName}\n\n${prefix}getplugin ${pluginName}`;
    
  } catch (error) {
    return `❌ Fehler beim Speichern: ${error.message}`;
  }
};

function validatePluginCode(code) {
  const errors = [];
  
  try {
    new vm.Script(code);
  } catch (error) {
    errors.push(`Syntax: ${error.message}`);
  }
  
  if (!code.includes('const handler') && !code.includes('function handler')) {
    errors.push('Kein handler definiert');
  }
  
  if (!code.includes('export default handler')) {
    errors.push('Kein export default handler');
  }
  
  const dangerous = [
    'eval(',
    'Function(',
    'require(',
    'process.exit',
    '__dirname',
    'child_process'
  ];
  
  for (const pattern of dangerous) {
    if (code.includes(pattern)) {
      errors.push(`Unsicher: ${pattern} nicht erlaubt`);
    }
  }
  
  if (!code.match(/handler\s*=\s*async/)) {
    errors.push('handler sollte async sein');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

handler.help = ['addplugin'];
handler.tags = ['owner'];
handler.command = ['addplugin', 'saveplugin'];
handler.owner = true;

export default handler;
