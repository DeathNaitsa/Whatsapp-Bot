const handler = async (m, { args, pluginManager, prefix }) => {
  if (args[0]) {
    const cmdName = args[0].toLowerCase();
    const plugin = pluginManager.getPlugin(cmdName);
    
    if (!plugin) {
      return `❌ Command "${cmdName}" nicht gefunden.\n\nVerfügbare Commands: ${prefix}help`;
    }
    
    let helpText = `📖 *Hilfe: ${prefix}${cmdName}*\n\n`;
    
    if (plugin.description) {
      helpText += `📝 ${plugin.description}\n\n`;
    }
    
    if (plugin.usage) {
      helpText += `💡 *Verwendung:*\n${prefix}${plugin.usage}\n\n`;
    }
    
    if (plugin.example) {
      helpText += `📌 *Beispiel:*\n${prefix}${plugin.example}\n\n`;
    }
    
    if (plugin.aliases && plugin.aliases.length > 0) {
      helpText += `🔄 *Aliases:* ${plugin.aliases.map(a => prefix + a).join(', ')}\n\n`;
    }
    
    if (plugin.category) {
      helpText += `📂 *Kategorie:* ${plugin.category}\n`;
    }
    
    if (plugin.owner) {
      helpText += `👑 *Nur für Owner*\n`;
    } else if (plugin.team) {
      helpText += `👥 *Nur für Team*\n`;
    } else if (plugin.premium) {
      helpText += `⭐ *Nur für Premium*\n`;
    }
    
    return helpText;
  }
  
  let text = `📚 *Bot Hilfe*\n\n`;
  text += `🔹 *Prefix:* ${prefix}\n`;
  text += `🔹 *Commands:* ${pluginManager.plugins.size}\n`;
  text += `🔹 *Kategorien:* ${pluginManager.categories.size}\n\n`;
  
  text += `💡 *Verwendung:*\n`;
  text += `• ${prefix}help <command> - Hilfe zu einem Command\n`;
  text += `• ${prefix}menu - Alle Commands anzeigen\n\n`;
  
  text += `📋 *Wichtige Commands:*\n`;
  text += `• ${prefix}dsgvo - Datenschutz\n`;
  text += `• ${prefix}acceptdsgvo - DSGVO akzeptieren\n`;
  text += `• ${prefix}profil - Dein Profil\n`;
  text += `• ${prefix}ping - Bot-Status\n`;
  text += `• ${prefix}status - System-Info\n\n`;
  
  text += `📖 Vollständige Liste: ${prefix}menu`;
  
  return text;
};

handler.help = ['help', 'hilfe'];
handler.tags = ['info'];
handler.command = ['help', 'hilfe', 'h'];
handler.description = 'Zeigt Hilfe zu Commands';
handler.usage = 'help [command]';
handler.example = 'help menu';

export default handler;
