import EncryptedDatabase from '../../database/EncryptedDatabase.js';
import WebServer from './WebServer.js';
import PermissionManager from '../../utils/PermissionManager.js';
import DSGVOManager from '../../utils/DsgvoManager.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getPassword() {
  const args = process.argv.slice(2);
  const pIndex = args.indexOf('-p');
  
  if (pIndex !== -1 && args[pIndex + 1]) {
    return args[pIndex + 1];
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('🔐 Datenbank-Passwort: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

const configPath = join(__dirname, '..', '..', '..', 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

console.log('🚀 Starte Website Server...\n');

const dbPassword = await getPassword();

const dbPath = join(__dirname, '..', '..', '..', config.database.path);
const db = new EncryptedDatabase(dbPath, dbPassword);

try {
  await db.load();
  console.log('✅ Datenbank geladen');
} catch (error) {
  console.error('❌ Fehler beim Laden der Datenbank:', error.message);
  process.exit(1);
}

const permissionManager = new PermissionManager(config);
const dsgvoManager = new DSGVOManager(db, config);

console.log('✅ Manager initialisiert');

const webServer = new WebServer(db, config, permissionManager, dsgvoManager, null);
webServer.start();

process.on('SIGINT', async () => {
  console.log('\n\n🛑 Server wird heruntergefahren...');
  await db.save();
  console.log('✅ Datenbank gespeichert');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Server wird heruntergefahren...');
  await db.save();
  console.log('✅ Datenbank gespeichert');
  process.exit(0);
});
