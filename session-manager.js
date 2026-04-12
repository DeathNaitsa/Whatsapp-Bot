import fs from 'fs/promises';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

const SESSIONS_DIR = path.join(__dirname, 'sessions');

async function ensureSessionsDir() {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  } catch (e) {
    console.error('Fehler beim Erstellen des Sessions-Verzeichnisses:', e.message);
  }
}

async function listSessions() {
  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const sessions = [];
    
    for (const file of files) {
      const fullPath = path.join(SESSIONS_DIR, file);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        const sessionInfo = {
          name: file,
          path: fullPath,
          created: stats.birthtime,
          modified: stats.mtime,
          size: await getDirectorySize(fullPath)
        };
        sessions.push(sessionInfo);
      }
    }
    
    return sessions;
  } catch (e) {
    return [];
  }
}

async function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        size += await getDirectorySize(filePath);
      } else {
        const stats = await fs.stat(filePath);
        size += stats.size;
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(date) {
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function showSessions() {
  const sessions = await listSessions();
  
  if (sessions.length === 0) {
    console.log('\n⚠️  Keine Sessions gefunden.\n');
    return;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📂 VERFÜGBARE SESSIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. 📱 ${session.name}`);
    console.log(`   📅 Erstellt:     ${formatDate(session.created)}`);
    console.log(`   🔄 Geändert:     ${formatDate(session.modified)}`);
    console.log(`   💾 Größe:        ${formatBytes(session.size)}`);
    console.log(`   📁 Pfad:         ${session.path}`);
    console.log();
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function addSession() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('➕ NEUE SESSION HINZUFÜGEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const sessionName = await question('📱 Session-Name (z.B. "business", "personal"): ');
  
  if (!sessionName || sessionName.trim() === '') {
    console.log('❌ Ungültiger Name!\n');
    return;
  }
  
  const cleanName = sessionName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
  
  if (cleanName !== sessionName.trim()) {
    console.log(`💡 Session wird als "${cleanName}" gespeichert (nur Kleinbuchstaben, Zahlen, - und _)`);
  }
  
  const sessionPath = path.join(SESSIONS_DIR, cleanName);
  
  try {
    // Check if session already exists
    try {
      await fs.access(sessionPath);
      console.log(`\n❌ Session "${cleanName}" existiert bereits!\n`);
      return;
    } catch (e) {
      // Session doesn't exist, continue
    }
    
    // Create session directory
    await fs.mkdir(sessionPath, { recursive: true });
    console.log(`\n✅ Session "${cleanName}" erfolgreich erstellt!`);
    console.log(`📁 Pfad: ${sessionPath}\n`);
    
    // Ask to set as default
    const setDefault = await question('Als Standard-Session setzen? (j/n): ');
    if (setDefault.toLowerCase() === 'j') {
      await updateConfigSession(cleanName);
      console.log(`✅ "${cleanName}" als Standard-Session gesetzt!\n`);
    }
    
  } catch (error) {
    console.log(`\n❌ Fehler beim Erstellen der Session: ${error.message}\n`);
  }
}

async function deleteSession() {
  const sessions = await listSessions();
  
  if (sessions.length === 0) {
    console.log('\n⚠️  Keine Sessions zum Löschen vorhanden.\n');
    return;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  SESSION LÖSCHEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.name} (${formatBytes(session.size)})`);
  });
  
  console.log();
  const choice = await question('Welche Session löschen? (Nummer oder Name): ');
  
  let sessionToDelete = null;
  
  // Check if it's a number
  const choiceNum = parseInt(choice);
  if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= sessions.length) {
    sessionToDelete = sessions[choiceNum - 1];
  } else {
    // Find by name
    sessionToDelete = sessions.find(s => s.name === choice);
  }
  
  if (!sessionToDelete) {
    console.log('\n❌ Session nicht gefunden!\n');
    return;
  }
  
  console.log(`\n⚠️  Du bist dabei, die Session "${sessionToDelete.name}" zu löschen!`);
  console.log(`   Größe: ${formatBytes(sessionToDelete.size)}`);
  console.log(`   Pfad: ${sessionToDelete.path}\n`);
  
  const confirm = await question('Bist du sicher? Dies kann nicht rückgängig gemacht werden! (ja/nein): ');
  
  if (confirm.toLowerCase() === 'ja') {
    try {
      await fs.rm(sessionToDelete.path, { recursive: true, force: true });
      console.log(`\n✅ Session "${sessionToDelete.name}" erfolgreich gelöscht!\n`);
    } catch (error) {
      console.log(`\n❌ Fehler beim Löschen: ${error.message}\n`);
    }
  } else {
    console.log('\n❌ Löschvorgang abgebrochen.\n');
  }
}

async function updateConfigSession(sessionId) {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    config.bot.sessionId = sessionId;
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.log(`❌ Fehler beim Aktualisieren der config.json: ${error.message}`);
  }
}

async function setDefaultSession() {
  const sessions = await listSessions();
  
  if (sessions.length === 0) {
    console.log('\n⚠️  Keine Sessions verfügbar.\n');
    return;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⭐ STANDARD-SESSION SETZEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Show current default
  try {
    const configPath = path.join(__dirname, 'config.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    console.log(`📌 Aktuelle Standard-Session: ${config.bot.sessionId || 'Nicht gesetzt'}\n`);
  } catch (e) {
    // Ignore
  }
  
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.name}`);
  });
  
  console.log();
  const choice = await question('Welche Session als Standard setzen? (Nummer oder Name): ');
  
  let sessionToSet = null;
  
  const choiceNum = parseInt(choice);
  if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= sessions.length) {
    sessionToSet = sessions[choiceNum - 1];
  } else {
    sessionToSet = sessions.find(s => s.name === choice);
  }
  
  if (!sessionToSet) {
    console.log('\n❌ Session nicht gefunden!\n');
    return;
  }
  
  await updateConfigSession(sessionToSet.name);
  console.log(`\n✅ "${sessionToSet.name}" als Standard-Session gesetzt!\n`);
}

async function showMenu() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║      📱 WhatsApp Session Manager        ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  console.log('1. 📋 Sessions anzeigen');
  console.log('2. ➕ Neue Session hinzufügen');
  console.log('3. 🗑️  Session löschen');
  console.log('4. ⭐ Standard-Session setzen');
  console.log('5. ❌ Beenden\n');
  
  const choice = await question('Wähle eine Option (1-5): ');
  
  switch (choice) {
    case '1':
      await showSessions();
      break;
    case '2':
      await addSession();
      break;
    case '3':
      await deleteSession();
      break;
    case '4':
      await setDefaultSession();
      break;
    case '5':
      console.log('\n👋 Auf Wiedersehen!\n');
      rl.close();
      return true;
    default:
      console.log('\n❌ Ungültige Auswahl!\n');
  }
  
  return false;
}

async function main() {
  await ensureSessionsDir();
  
  let shouldExit = false;
  
  while (!shouldExit) {
    shouldExit = await showMenu();
  }
}

main().catch(error => {
  console.error('❌ Fehler:', error);
  rl.close();
  process.exit(1);
});
