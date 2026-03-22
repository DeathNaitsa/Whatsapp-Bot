import fs from 'fs/promises';
import readline from 'readline';
import crypto from 'crypto';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function setup() {
  console.log('🚀 Nishi-Bot Setup-Assistent\n');
  console.log('Dieser Assistent hilft dir bei der Erstkonfiguration.\n');
  
  // Check if already setup
  try {
    const configContent = await fs.readFile('config.json', 'utf8');
    const config = JSON.parse(configContent);
    
    if (!config.bot.owner.includes('xxxxxx')) {
      console.log('✅ Bot scheint bereits konfiguriert zu sein!');
      const reconfigure = await question('\nMöchtest du trotzdem neu konfigurieren? (j/n): ');
      if (reconfigure.toLowerCase() !== 'j') {
        console.log('Setup abgebrochen.');
        rl.close();
        return;
      }
    }
  } catch (e) {
    console.log('⚠️ Keine config.json gefunden, erstelle neue Konfiguration...\n');
  }
  
  console.log('📋 Bitte beantworte folgende Fragen:\n');
  
  // Get user input
  const botName = await question('🤖 Wie soll dein Bot heißen? (z.B. "MeinBot"): ');
  const ownerNumber = await question('📱 Deine WhatsApp-Nummer (Format: 49xxxxxxxxxx@s.whatsapp.net): ');
  const prefix = await question('⌨️ Bot-Prefix (z.B. ".", "!", "/"): ') || '.';
  
  console.log('\n🔐 Generiere sichere Secrets...');
  
  // Generate secrets
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  // Create .env
  console.log('📝 Erstelle .env Datei...');
  const envContent = `# Nishi-Bot Environment Variables
# Generiert am ${new Date().toISOString()}

# Session Secret (nicht ändern!)
SESSION_SECRET=${sessionSecret}

# JWT Secret (nicht ändern!)
JWT_SECRET=${jwtSecret}

# Node Environment
NODE_ENV=development

# Optional: Datenbank-Passwort (leer lassen für manuelle Eingabe beim Start)
DB_PASSWORD=
`;
  await fs.writeFile('.env', envContent);
  console.log('✅ .env erstellt');
  
  // Update config.json
  console.log('⚙️ Aktualisiere config.json...');
  const config = JSON.parse(await fs.readFile('config.json', 'utf8'));
  config.bot.owner = ownerNumber;
  config.bot.name = botName;
  config.bot.prefix = prefix;
  config.website.sessionSecret = 'USE_ENV_VARIABLE';
  config.website.jwtSecret = 'USE_ENV_VARIABLE';
  
  await fs.writeFile('config.json', JSON.stringify(config, null, 2));
  console.log('✅ config.json aktualisiert');
  
  // Create data directory
  console.log('📁 Erstelle Daten-Verzeichnisse...');
  await fs.mkdir('./data', { recursive: true });
  await fs.mkdir('./data/backups', { recursive: true });
  console.log('✅ Verzeichnisse erstellt');
  
  // Check .gitignore
  try {
    const gitignoreContent = await fs.readFile('.gitignore', 'utf8');
    if (!gitignoreContent.includes('.env')) {
      console.log('⚠️ .gitignore enthält kein .env - wird hinzugefügt');
      await fs.writeFile('.gitignore', gitignoreContent + '\n.env\ndata/\n');
    }
  } catch (e) {
    console.log('⚠️ Keine .gitignore gefunden');
  }
  
  console.log('\n✅ Setup abgeschlossen!\n');
  console.log('📝 Zusammenfassung:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🤖 Bot-Name: ${botName}`);
  console.log(`📱 Owner: ${ownerNumber}`);
  console.log(`⌨️ Prefix: ${prefix}`);
  console.log('🔐 Secrets: Generiert und in .env gespeichert');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📚 Nächste Schritte:');
  console.log('1. Starte den Bot: npm start');
  console.log('2. Master-Passwort eingeben (wird für Verschlüsselung verwendet)');
  console.log('3. QR-Code mit WhatsApp scannen');
  console.log('4. Im Bot registrieren: .register <username>');
  console.log('5. Web-Passwort setzen: .setwebpass <passwort>');
  console.log('6. Dashboard öffnen: http://localhost:3001/dashboard\n');
  
  console.log('⚠️ WICHTIG:');
  console.log('- Speichere dein Master-Passwort sicher!');
  console.log('- Teile niemals deine .env Datei!');
  console.log('- Mache regelmäßig Backups!\n');
  
  const startNow = await question('Möchtest du den Bot jetzt starten? (j/n): ');
  rl.close();
  
  if (startNow.toLowerCase() === 'j') {
    console.log('\n🚀 Starte Bot...\n');
    const { spawn } = await import('child_process');
    const bot = spawn('npm', ['start'], { 
      stdio: 'inherit',
      shell: true 
    });
  } else {
    console.log('\nStarte den Bot später mit: npm start\n');
  }
}

setup().catch(error => {
  console.error('❌ Fehler beim Setup:', error);
  rl.close();
  process.exit(1);
});
