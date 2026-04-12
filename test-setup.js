import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔════════════════════════════════════════╗');
console.log('║   🧪 Setup & System Test              ║');
console.log('╚════════════════════════════════════════╝\n');

let allTestsPassed = true;

// Test 1: Config File
console.log('📋 Test 1: Config-Datei prüfen...');
try {
  const configPath = path.join(__dirname, 'config.json');
  const configContent = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(configContent);
  
  console.log('  ✅ config.json existiert und ist gültig');
  
  // Check required fields
  const requiredFields = ['bot.name', 'bot.owner', 'bot.prefix', 'bot.sessionId'];
  for (const field of requiredFields) {
    const keys = field.split('.');
    let value = config;
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (!value) {
      console.log(`  ❌ Fehlendes Feld: ${field}`);
      allTestsPassed = false;
    } else {
      console.log(`  ✅ ${field}: ${value}`);
    }
  }
  
  // Check if owner looks valid
  if (config.bot.owner.includes('xxxxxx')) {
    console.log('  ⚠️ Owner noch nicht konfiguriert (enthält xxxxxx)');
    console.log('  💡 Führe "npm run setup" aus!');
    allTestsPassed = false;
  }
  
} catch (error) {
  console.log('  ❌ Fehler beim Lesen der Config:', error.message);
  allTestsPassed = false;
}

// Test 2: Environment File
console.log('\n🔐 Test 2: Environment-Datei prüfen...');
try {
  const envPath = path.join(__dirname, '.env');
  await fs.access(envPath);
  console.log('  ✅ .env Datei existiert');
  
  const envContent = await fs.readFile(envPath, 'utf8');
  const requiredVars = ['SESSION_SECRET', 'JWT_SECRET', 'DB_PASSWORD', 'SESSION_ID'];
  
  for (const varName of requiredVars) {
    if (envContent.includes(`${varName}=`)) {
      // Check if variable has a value
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (match && match[1].trim() !== '') {
        console.log(`  ✅ ${varName} ist gesetzt`);
      } else {
        console.log(`  ⚠️ ${varName} ist leer`);
      }
    } else {
      console.log(`  ❌ ${varName} fehlt`);
      allTestsPassed = false;
    }
  }
} catch (error) {
  console.log('  ❌ .env Datei nicht gefunden');
  console.log('  💡 Führe "npm run setup" aus!');
  allTestsPassed = false;
}

// Test 3: Verzeichnisse
console.log('\n📁 Test 3: Verzeichnisstruktur prüfen...');
const requiredDirs = ['data', 'data/backups', 'sessions', 'src/database', 'src/plugins'];

for (const dir of requiredDirs) {
  try {
    const dirPath = path.join(__dirname, dir);
    await fs.access(dirPath);
    console.log(`  ✅ ${dir}/ existiert`);
  } catch (error) {
    console.log(`  ❌ ${dir}/ fehlt`);
    allTestsPassed = false;
  }
}

// Test 4: Session Manager
console.log('\n📱 Test 4: Session Manager prüfen...');
try {
  const sessionManagerPath = path.join(__dirname, 'session-manager.js');
  await fs.access(sessionManagerPath);
  console.log('  ✅ session-manager.js existiert');
  
  // Check sessions directory
  const sessionsDir = path.join(__dirname, 'sessions');
  const files = await fs.readdir(sessionsDir);
  const sessions = files.filter(f => {
    try {
      const stats = fs.statSync(path.join(sessionsDir, f));
      return stats.isDirectory();
    } catch {
      return false;
    }
  });
  
  if (sessions.length > 0) {
    console.log(`  ✅ ${sessions.length} Session(s) gefunden: ${sessions.join(', ')}`);
  } else {
    console.log('  ⚠️ Keine Sessions vorhanden');
    console.log('  💡 Nutze "npm run session-manager" um Sessions zu erstellen');
  }
} catch (error) {
  console.log('  ❌ Fehler:', error.message);
  allTestsPassed = false;
}

// Test 5: Datenbank-Module
console.log('\n💾 Test 5: Datenbank-Module prüfen...');
try {
  const dbModulePath = path.join(__dirname, 'src/database/EncryptedDatabase.js');
  await fs.access(dbModulePath);
  console.log('  ✅ EncryptedDatabase.js existiert');
  
  // Try to import (without initializing)
  const EncryptedDatabase = (await import('./src/database/EncryptedDatabase.js')).default;
  if (EncryptedDatabase) {
    console.log('  ✅ EncryptedDatabase kann importiert werden');
  }
} catch (error) {
  console.log('  ❌ Fehler beim Laden der Datenbank-Module:', error.message);
  allTestsPassed = false;
}

// Test 6: Main File
console.log('\n🤖 Test 6: Haupt-Datei prüfen...');
try {
  const indexPath = path.join(__dirname, 'index.js');
  await fs.access(indexPath);
  console.log('  ✅ index.js existiert');
  
  const indexContent = await fs.readFile(indexPath, 'utf8');
  
  // Check for important functions
  const requiredImports = ['startSession', 'onMessage', 'sendText'];
  for (const imp of requiredImports) {
    if (indexContent.includes(imp)) {
      console.log(`  ✅ ${imp} wird importiert`);
    } else {
      console.log(`  ❌ ${imp} fehlt`);
      allTestsPassed = false;
    }
  }
  
  // Check for owner detection
  if (indexContent.includes('config.bot.owner')) {
    console.log('  ✅ Owner-Erkennung implementiert');
  } else {
    console.log('  ⚠️ Owner-Erkennung nicht gefunden');
  }
  
} catch (error) {
  console.log('  ❌ index.js nicht gefunden:', error.message);
  allTestsPassed = false;
}

// Test 7: Package.json
console.log('\n📦 Test 7: Package.json prüfen...');
try {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkgContent = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);
  
  console.log('  ✅ package.json ist gültig');
  
  // Check main field
  if (pkg.main === 'index.js') {
    console.log('  ✅ main: "index.js" ist korrekt');
  } else {
    console.log(`  ⚠️ main: "${pkg.main}" (sollte "index.js" sein)`);
  }
  
  // Check scripts
  const requiredScripts = ['start', 'setup', 'session-manager'];
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  ✅ Script "${script}" verfügbar`);
    } else {
      console.log(`  ❌ Script "${script}" fehlt`);
      allTestsPassed = false;
    }
  }
  
  // Check dependencies
  const requiredDeps = ['@deathnaitsa/wa-api', 'bcryptjs', 'express'];
  for (const dep of requiredDeps) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`  ✅ Abhängigkeit "${dep}" vorhanden`);
    } else {
      console.log(`  ❌ Abhängigkeit "${dep}" fehlt`);
      allTestsPassed = false;
    }
  }
  
} catch (error) {
  console.log('  ❌ Fehler:', error.message);
  allTestsPassed = false;
}

// Final Result
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (allTestsPassed) {
  console.log('✅ ALLE TESTS BESTANDEN!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 Dein Bot ist bereit zum Starten!');
  console.log('\n📚 Nächste Schritte:');
  console.log('  1. npm start          - Bot starten');
  console.log('  2. QR-Code scannen    - Mit WhatsApp verbinden');
  console.log('  3. Befehle nutzen     - z.B. .help\n');
} else {
  console.log('⚠️ EINIGE TESTS FEHLGESCHLAGEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔧 Behebe die Fehler:');
  console.log('  1. npm run setup      - Konfiguration erstellen');
  console.log('  2. npm install        - Abhängigkeiten installieren');
  console.log('  3. node test-setup.js - Erneut testen\n');
}
