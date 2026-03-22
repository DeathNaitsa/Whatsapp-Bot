import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

class PluginManager {
  constructor(pluginDir) {
    this.pluginDir = pluginDir;
    this.plugins = new Map();
    this.commands = new Map();
    this.categories = new Map();
  }

  async loadPlugins() {
    console.log('🔌 Lade Plugins...');
    
    try {
      const files = await this.getPluginFiles(this.pluginDir);
      let loadedCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          await this.loadPlugin(file);
          loadedCount++;
        } catch (error) {
          console.error(`❌ Fehler beim Laden von ${path.basename(file)}:`, error.message);
          errorCount++;
        }
      }

      console.log(`✅ ${loadedCount} Plugins geladen`);
      if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} Plugins konnten nicht geladen werden`);
      }
      
      this.printPluginStats();
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der Plugins:', error);
    }
  }

  async getPluginFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getPluginFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.log(`ℹ️ Plugin-Verzeichnis wird erstellt: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
    }
    
    return files;
  }

  async loadPlugin(filePath) {
    const fileUrl = pathToFileURL(filePath).href;
    
    const plugin = await import(`${fileUrl}?update=${Date.now()}`);
    const handler = plugin.default;
    
    if (!handler || typeof handler !== 'function') {
      throw new Error('Plugin muss eine Funktion als default export haben');
    }

    const pluginName = path.basename(filePath, '.js');
    const commands = handler.command || [];
    const tags = handler.tags || ['uncategorized'];
    const help = handler.help || commands;

    this.plugins.set(pluginName, {
      name: pluginName,
      handler,
      commands,
      tags,
      help,
      filePath,
      owner: handler.owner || false,
      team: handler.team || false,
      premium: handler.premium || false,
      group: handler.group || false,
      private: handler.private || false,
      admin: handler.admin || false,
      botAdmin: handler.botAdmin || false,
      disabled: handler.disabled || false
    });

    for (const cmd of commands) {
      this.commands.set(cmd.toLowerCase(), pluginName);
    }

    for (const tag of tags) {
      if (!this.categories.has(tag)) {
        this.categories.set(tag, []);
      }
      this.categories.get(tag).push(pluginName);
    }
  }

  getPlugin(command) {
    const pluginName = this.commands.get(command.toLowerCase());
    if (!pluginName) return null;
    return this.plugins.get(pluginName);
  }

  getPluginsByCategory(category) {
    const pluginNames = this.categories.get(category) || [];
    return pluginNames.map(name => this.plugins.get(name));
  }

  async executePlugin(command, m, extra = {}) {
    const plugin = this.getPlugin(command);
    
    if (!plugin) {
      return null;
    }

    if (plugin.disabled) {
      return { error: 'Plugin ist deaktiviert' };
    }

    try {
      const result = await plugin.handler(m, {
        command: command,
        usedPrefix: extra.prefix || '.',
        ...extra
      });
      
      return result;
    } catch (error) {
      console.error(`❌ Fehler beim Ausführen von ${plugin.name}:`, error);
      return { error: error.message };
    }
  }

  generateMenu(userPermissions = {}) {
    const menu = {
      categories: {},
      totalPlugins: this.plugins.size,
      totalCommands: this.commands.size
    };

    for (const [category, pluginNames] of this.categories) {
      const plugins = [];
      
      for (const name of pluginNames) {
        const plugin = this.plugins.get(name);
        
        if (plugin.owner && !userPermissions.owner) continue;
        if (plugin.team && !userPermissions.team) continue;
        if (plugin.premium && !userPermissions.premium) continue;
        if (plugin.disabled) continue;

        plugins.push({
          name: plugin.name,
          commands: plugin.commands,
          help: plugin.help,
          owner: plugin.owner,
          team: plugin.team,
          premium: plugin.premium
        });
      }

      if (plugins.length > 0) {
        menu.categories[category] = plugins;
      }
    }

    return menu;
  }

  generateMenuText(userPermissions = {}, prefix = '.') {
    const menu = this.generateMenu(userPermissions);
    let text = '╭━━━━━━━━━━━━━━━━━╮\n';
    text += '│  📋 *BOT MENÜ*  │\n';
    text += '╰━━━━━━━━━━━━━━━━━╯\n\n';
    
    for (const [category, plugins] of Object.entries(menu.categories)) {
      text += `┌─⟢ *${category.toUpperCase()}*\n`;
      
      for (const plugin of plugins) {
        const commands = plugin.commands.map(cmd => `${prefix}${cmd}`).join(' / ');
        let badges = '';
        if (plugin.owner) badges += ' 👑';
        if (plugin.team) badges += ' 👥';
        if (plugin.premium) badges += ' ⭐';
        
        text += `│ • ${commands}${badges}\n`;
      }
      
      text += '└────────────\n\n';
    }
    
    text += `📊 *Statistik*\n`;
    text += `├ Kategorien: ${Object.keys(menu.categories).length}\n`;
    text += `├ Plugins: ${menu.totalPlugins}\n`;
    text += `└ Commands: ${menu.totalCommands}\n`;
    
    return text;
  }

  printPluginStats() {
    console.log('\n📊 Plugin-Statistiken:');
    console.log(`├─ Plugins: ${this.plugins.size}`);
    console.log(`├─ Commands: ${this.commands.size}`);
    console.log(`└─ Kategorien: ${this.categories.size}`);
    
    console.log('\n📁 Kategorien:');
    for (const [category, plugins] of this.categories) {
      console.log(`├─ ${category}: ${plugins.length} Plugin(s)`);
    }
  }

  async reloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} nicht gefunden`);
    }

    for (const cmd of plugin.commands) {
      this.commands.delete(cmd.toLowerCase());
    }

    for (const tag of plugin.tags) {
      const categoryPlugins = this.categories.get(tag);
      if (categoryPlugins) {
        const index = categoryPlugins.indexOf(pluginName);
        if (index > -1) {
          categoryPlugins.splice(index, 1);
        }
      }
    }

    this.plugins.delete(pluginName);

    await this.loadPlugin(plugin.filePath);
    
    console.log(`✅ Plugin ${pluginName} neu geladen`);
  }

  getPluginList() {
    const list = [];
    for (const [name, plugin] of this.plugins) {
      list.push({
        id: name,
        name,
        description: plugin.help?.[0] || 'Keine Beschreibung',
        commands: plugin.commands,
        loaded: true,
        tags: plugin.tags
      });
    }
    return list;
  }

  getCommandList() {
    const list = [];
    let id = 1;
    
    for (const [cmdName, pluginName] of this.commands) {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) continue;
      
      list.push({
        id: `cmd_${id++}`,
        name: cmdName,
        description: plugin.help?.[0] || 'Keine Beschreibung',
        owner: plugin.owner || false,
        team: plugin.team || false,
        premium: plugin.premium || false,
        tags: plugin.tags || [],
        pluginName: plugin.name
      });
    }
    
    return list;
  }

  commandExists(name) {
    return this.commands.has(name.toLowerCase());
  }

  getCommandInfo(cmdId) {
    const commands = this.getCommandList();
    return commands.find(c => c.id === cmdId);
  }

  async saveCommand(data) {
    const { id, name, description, code, permission, author } = data;
    const fileName = `${name.toLowerCase()}.js`;
    const filePath = path.join(this.pluginDir, fileName);

    const pluginCode = `${code}

${code.includes('handler.') ? '' : `
handler.help = ['${name}'];
handler.tags = ['custom'];
handler.command = ['${name}'];
${permission ? `handler.${permission} = true;` : ''}
`}

export default handler;
`;

    await fs.writeFile(filePath, pluginCode, 'utf8');

    await this.loadPlugin(filePath);

    return { id: `cmd_${this.commands.size}`, name };
  }

  async deleteCommand(cmdId) {
    const cmdInfo = this.getCommandInfo(cmdId);
    if (!cmdInfo) {
      throw new Error('Command nicht gefunden');
    }

    const fileName = `${cmdInfo.name.toLowerCase()}.js`;
    const filePath = path.join(this.pluginDir, fileName);

    await fs.unlink(filePath);

    this.commands.delete(cmdInfo.name);
    this.plugins.delete(cmdInfo.pluginName);

    console.log(`✅ Command ${cmdInfo.name} gelöscht`);
  }
}

export default PluginManager;
