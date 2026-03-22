# 🤖 WhatsApp Bot - Verschlüsselt & Modular

Modernes WhatsApp Bot-System mit AES-256 verschlüsselter Datenbank, Plugin-System und Web-Dashboard.

```
✅ Level-System & XP        ✅ Web-Dashboard          ✅ DSGVO-konform
✅ Multi-Währung            ✅ Plugin-System          ✅ 30+ Commands
✅ Support-Tickets          ✅ Team-Rollen            ✅ Verschlüsselt
```

---

## 📋 Schnell-Navigation

**Installation:**
- [💻 PC/Mac/Linux](#1-installation-pcmaclinux) - Einfachste Option
- [📱 Android Termux](#2-installation-android-termux) - Mobile 24/7
- [🐧 Android UserLAnd](#3-installation-android-userland) - Linux-Umgebung
- [☁️ VPS/Server](#4-installation-vpsserver) - Professionell

**Los geht's:**
- [🚀 Erste Schritte](#erste-schritte) - Nach der Installation
- [📚 Commands](#commands-übersicht) - Alle Befehle
- [🔧 Eigene Commands](#eigene-commands-erstellen) - Plugin erstellen
- [🐛 Probleme?](#troubleshooting) - Häufige Fehler

---

## 1. Installation PC/Mac/Linux

### Voraussetzungen
- Node.js >= 18 ([Download hier](https://nodejs.org))
- Git installiert

### Installation

```bash
# Repository klonen
git clone https://github.com/DEIN-USERNAME/whatsapp-bot.git
cd whatsapp-bot

# Dependencies installieren (dauert 2-3 Minuten)
npm install

# Setup starten
npm run setup
```

Der Setup fragt dich:
- **Bot-Name**: z.B. "MeinBot"
- **WhatsApp-Nummer**: Format `491234567890@s.whatsapp.net`
  (Deine Nummer mit Ländercode in WhatsApp-Format)
- **Prefix**: z.B. `.` oder `!` oder `/`

```bash
# Bot starten
npm start
```

**Master-Passwort eingeben** wenn gefragt (merken - wird für Verschlüsselung genutzt!)

**QR-Code scannen:**
1. WhatsApp auf Handy öffnen
2. Einstellungen → Verknüpfte Geräte → Gerät hinzufügen
3. QR-Code im Terminal scannen

✅ **Fertig!** Bot ist verbunden und läuft.

### Bot im Hintergrund laufen lassen

#### Windows:
```powershell
# start.bat erstellen mit:
@echo off
node index.new.js
pause
```
Doppelklick auf start.bat

#### Mac/Linux:
```bash
# Screen verwenden
screen -S botscreen
npm start
# Ctrl+A dann D zum Detachen

# Wieder verbinden:
screen -r botscreen
```

---

## 2. Installation Android (Termux)

### Schritt 1: Termux installieren

**⚠️ WICHTIG:** Termux NUR von F-Droid, NICHT vom Play Store!

1. [F-Droid App installieren](https://f-droid.org)
2. In F-Droid nach "Termux" suchen
3. Termux & Termux:API installieren

### Schritt 2: Termux einrichten

Termux öffnen und folgende Commands eingeben:

```bash
# System aktualisieren (mit Y bestätigen)
pkg update && pkg upgrade -y

# Speicher-Zugriff erlauben
termux-setup-storage

# Dependencies installieren
pkg install -y git nodejs

# Prüfen ob Node.js läuft
node --version
```

Sollte mindestens v18.0.0 zeigen.

### Schritt 3: Bot installieren

```bash
# Bot klonen
git clone https://github.com/DEIN-USERNAME/whatsapp-bot.git
cd whatsapp-bot

# Dependencies installieren (5-10 Minuten!)
npm install

# Setup
npm run setup
```

Fülle aus:
- Bot-Name
- WhatsApp-Nummer (Format: `491234567890@s.whatsapp.net`)
- Prefix

```bash
# Bot starten
npm start
```

Master-Passwort eingeben → QR-Code scannen → Fertig!

### Termux im Hintergrund

**Problem:** Android beendet Termux oft.

**Lösung 1: Screen verwenden**
```bash
pkg install -y screen

# Bot in Screen starten
screen -S bot
cd ~/whatsapp-bot
npm start

# Detach mit: Ctrl+A dann D
# Termux kann jetzt geschlossen werden

# Wieder verbinden:
screen -r bot
```

**Lösung 2: PM2 (professioneller)**
```bash
# PM2 installieren
npm install -g pm2

# Bot mit PM2 starten
cd ~/whatsapp-bot
pm2 start index.new.js --name whatsapp-bot

# Status checken
pm2 status

# Logs ansehen
pm2 logs whatsapp-bot

# Bot neu starten
pm2 restart whatsapp-bot
```

### Wichtig für Termux:

**Battery Optimization ausschalten:**
1. Android Einstellungen
2. Apps → Termux
3. Akku → Nicht optimieren

**Auto-Start (optional):**
```bash
# Termux:Boot von F-Droid installieren
# Dann:
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start-bot.sh
```

Inhalt:
```bash
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd ~/whatsapp-bot
pm2 resurrect
```

Speichern: `Ctrl+X`, `Y`, `Enter`

```bash
chmod +x ~/.termux/boot/start-bot.sh
```

---

## 3. Installation Android (UserLAnd)

### Schritt 1: UserLAnd installieren

Aus Play Store oder F-Droid: "UserLAnd" installieren

### Schritt 2: Ubuntu einrichten

1. UserLAnd öffnen
2. "Ubuntu" auswählen
3. Username eingeben (z.B. `admin`)
4. Passwort festlegen (merken!)
5. VNC-Passwort (egal, wir nutzen SSH)
6. "SSH" auswählen (nicht VNC!)
7. Warten (dauert 10-15 Minuten)

### Schritt 3: In SSH-Session

UserLAnd verbindet automatisch. Du siehst jetzt ein Linux-Terminal.

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y
# Passwort eingeben wenn gefragt

# Node.js 20.x installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Prüfen
node --version
npm --version
```

### Schritt 4: Bot installieren

```bash
# Bot klonen
git clone https://github.com/DeathNaitsa/whatsapp-bot.git
cd whatsapp-bot

# Dependencies (10-20 Minuten!)
npm install

# Setup
npm run setup
```

Ausfüllen und dann:

```bash
npm start
```

### UserLAnd im Hintergrund

**Screen verwenden:**
```bash
# Screen installieren
sudo apt install -y screen

# Bot in Screen starten
screen -S bot
cd ~/whatsapp-bot
npm start

# Detach: Ctrl+A dann D
# UserLAnd kann geschlossen werden

# Wieder verbinden
screen -r bot
```

**PM2 (besser):**
```bash
sudo npm install -g pm2
cd ~/whatsapp-bot
pm2 start index.new.js --name whatsapp-bot
pm2 startup systemd
pm2 save
```

Jetzt startet der Bot automatisch mit UserLAnd!

---

## 4. Installation VPS/Server

### Empfohlene Anbieter

**Günstig & gut:**
- **Hetzner Cloud** - 3-5€/Monat, 2-4GB RAM
- **Netcup** - 3€/Monat, 2GB RAM
- **Contabo** - 4€/Monat, 8GB RAM

**Mindest-Anforderungen:**
- 1GB RAM (2GB empfohlen)
- Ubuntu 20.04/22.04
- 20GB Speicher

### Installation auf VPS

Per SSH verbinden:
```bash
ssh root@DEINE-SERVER-IP
```

Dann:

```bash
# System aktualisieren
apt update && apt upgrade -y

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs git

# Neuen User anlegen (Sicherheit)
adduser botuser
usermod -aG sudo botuser

# Als botuser einloggen
su - botuser

# Bot installieren
git clone https://github.com/DEIN-USERNAME/whatsapp-bot.git
cd whatsapp-bot
npm install
npm run setup
```

### VPS: 24/7 Betrieb mit PM2

```bash
# PM2 installieren
sudo npm install -g pm2

# Bot starten
cd ~/whatsapp-bot
pm2 start index.new.js --name whatsapp-bot

# Auto-Start bei Server-Neustart
pm2 startup systemd
# Führe den angezeigten Befehl aus!
pm2 save

# Status checken
pm2 status
pm2 logs whatsapp-bot
```

**Firewall konfigurieren:**
```bash
sudo ufw allow 22
sudo ufw allow 3001
sudo ufw enable
```

### Web-Interface extern erreichbar machen

**WARNUNG:** Nur mit Nginx + SSL!

**Nginx installieren:**
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

**Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

Inhalt (kopieren und anpassen):
```nginx
server {
    listen 80;
    server_name deine-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Aktivieren:
```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**SSL (Let's Encrypt):**
```bash
sudo certbot --nginx -d deine-domain.com
```

Jetzt erreichbar unter: `https://deine-domain.com`

---

## Erste Schritte

### 1. Bot im Chat testen

Schreibe dem Bot privat (die Nummer mit der er verbunden ist):

```
.ping
```

Sollte antworten: `✅ Bot ist online! ...`

### 2. Registrieren

```
.acceptdsgvo
.register DeinUsername
```

Username-Regeln:
- 3-20 Zeichen
- Nur A-Z, 0-9, _ und -
- Keine Leerzeichen

### 3. Commands entdecken

```
.help           → Hilfe
.menu           → Alle Commands
.profil         → Dein Profil
.level          → Dein Level
```

### 4. Als Admin: Web-Passwort setzen

```
.setwebpass MeinSicheresPasswort123
```

Dann Dashboard öffnen:
- Lokal: `http://localhost:3001/dashboard`
- VPS: `https://deine-domain.com/dashboard`

Login:
- Username: DeinUsername (aus `.register`)
- Passwort: MeinSicheresPasswort123

### 5. In Gruppen nutzen

1. Bot zur Gruppe hinzufügen
2. Als Admin schreiben: `.acceptdsgvo`
3. Bot funktioniert jetzt in der Gruppe

**Prefix ändern (optional):**
```
.setprefix !
```

Dann Commands mit `!` statt `.` nutzen

---

## Commands-Übersicht

### Basis-Commands

```
.help               → Hilfe anzeigen
.help <command>     → Hilfe zu spezifischem Command
.menu               → Alle Commands
.ping               → Bot-Status
.status             → System-Info
```

### User-Commands

```
.register <name>    → Registrieren
.profil             → Dein Profil anzeigen
.level              → Level & XP Status
.leaderboard        → Top 10 User
.prestige           → Prestige (ab Level 100)
```

### DSGVO/Datenschutz

```
.dsgvo              → Datenschutzerklärung
.acceptdsgvo        → DSGVO akzeptieren (Pflicht!)
.exportdata         → Deine Daten als JSON
.deletedata         → Alle Daten löschen
```

### Support

```
.support <text>     → Ticket erstellen
                      Beispiel: .support Bot antwortet nicht
```

### Admin-Commands

**Team-Verwaltung:**
```
.setteam @user <rolle>    → Rolle vergeben
                            Rollen: ersteller, inhaber, owner, 
                                    manager, supporter

.deleteuser @user         → User löschen
.listusers                → Alle User anzeigen
```

**Gruppen:**
```
.setprefix <prefix>       → Prefix ändern (nur Group-Admin)
                            Beispiel: .setprefix !
```

**Plugins:**
```
.listplugins              → Alle Plugins
.getplugin <name>         → Plugin-Code anzeigen
```

**System:**
```
.migrate                  → Alte DB migrieren (nur Ersteller)
```

### Account-Verwaltung

```
.setwebpass <passwort>    → Web-Dashboard Passwort setzen
.linkaccount              → Zweite Nummer verknüpfen
```

---

## Web-Dashboard

### Zugriff

**Lokal (PC/Android):**
```
http://localhost:3001/dashboard
```

**VPS (mit Domain):**
```
https://deine-domain.com/dashboard
```

**VPS (direkter Zugriff - unsicher!):**
```
http://DEINE-SERVER-IP:3001/dashboard
```

### Login

- **Username**: Dein registrierter Bot-Name
- **Passwort**: Mit `.setwebpass` gesetztes Passwort

**Noch kein Passwort gesetzt?**
Schreibe dem Bot: `.setwebpass MeinPasswort123`

### Dashboard-Features

**Übersicht:**
- User-Statistiken
- Aktive User heute
- Gruppen-Anzahl
- Top-Level-User

**User-Verwaltung:**
- Profile bearbeiten
- Level / XP ändern
- Geld / Items verwalten
- Team-Rollen vergeben
- User löschen

**Support-System:**
- Offene Tickets ansehen
- Tickets beantworten
- Tickets schließen
- Ticket-Historie

**Activity-Log:**
- Alle Admin-Aktionen protokolliert
- Wer hat wann was geändert
- Filtert nach Datum/User

**Block-Editor:**
- Visueller Command-Editor
- Scratch-ähnlich
- Für einfache Commands

---

## Konfiguration

### config.json anpassen

```javascript
{
  "bot": {
    "name": "MeinBot",                    // Bot-Name
    "prefix": ".",                         // Standard-Prefix
    "owner": "491234567890@s.whatsapp.net" // DEINE Nummer!
  },
  
  "website": {
    "port": 3001,                          // Web-Port (änderbar)
    "host": "127.0.0.1"                    // localhost (für extern: 0.0.0.0)
  },
  
  "database": {
    "autoBackup": true,                    // Auto-Backup aktiviert
    "backupInterval": 3600000              // Backup alle 1 Stunde
  }
}
```

### Umgebungsvariablen (.env)

Nach `npm run setup` wird `.env` erstellt:

```env
# Session Secret (automatisch generiert)
SESSION_SECRET=generierter-hex-string

# JWT Secret (automatisch generiert)
JWT_SECRET=anderer-generierter-hex-string

# Optional: Datenbank-Passwort (sonst bei Start eingeben)
DB_PASSWORD=
```

**Secrets NIEMALS committen oder teilen!**

---

## Eigene Commands erstellen

### Neues Command erstellen

1. Datei erstellen: `src/plugins/commands/meincommand.js`

2. Basis-Template:

```javascript
const handler = async (m, { user, database, args, send, chatId, sender }) => {
  
  // Check ob User registriert ist
  if (!user.registered) {
    return '❌ Du musst registriert sein!';
  }
  
  // Check Argumente
  if (!args[0]) {
    return '💡 Verwendung: .meincommand <text>';
  }
  
  // Deine Logik hier
  const text = args.join(' ');
  
  // User-Daten updaten (optional)
  user.commandsUsed = (user.commandsUsed || 0) + 1;
  await database.setUser(sender, user);
  
  // Antwort zurückgeben
  return `✅ Du hast gesagt: ${text}`;
};

// Command-Konfiguration
handler.command = ['meincommand', 'mc'];  // Trigger
handler.tags = ['fun'];                    // Kategorie
handler.description = 'Mein erstes Command';
handler.usage = 'meincommand <text>';
handler.example = 'meincommand Hallo Welt';

// Berechtigungen (optional)
handler.owner = false;      // Nur Owner? (false = jeder)
handler.team = false;       // Nur Team?
handler.premium = false;    // Nur Premium?
handler.group = false;      // Nur in Gruppen?
handler.private = false;    // Nur privat?

export default handler;
```

3. Bot neu starten

```bash
# Mit PM2:
pm2 restart whatsapp-bot

# Oder:
npm start
```

### Command-Context Erklärung

**Verfügbare Parameter:**

```javascript
const handler = async (m, {
  user,          // User-Daten: { name, level, exp, money, ... }
  database,      // DB-Zugriff: getUser(), setUser(), getAllUsers()
  config,        // config.json Inhalt
  args,          // Command-Argumente als Array
  prefix,        // Aktueller Prefix (z.B. ".")
  isGroup,       // true wenn in Gruppe
  isAdmin,       // true wenn Gruppen-Admin
  sender,        // WhatsApp-ID des Senders
  chatId,        // Chat-ID (Gruppe oder Privat)
  send           // Send-Funktionen
}) => {
  // ...
};
```

**Send-Funktionen:**

```javascript
// Text senden
await send.text(chatId, 'Hallo Welt!');

// Bild senden
await send.image(chatId, imageBuffer, 'Caption');

// Video senden
await send.video(chatId, videoBuffer, 'Caption');

// Sticker senden
await send.sticker(chatId, stickerBuffer);

// Reaktion
await send.reaction(chatId, messageId, '👍');
```

**Datenbank-Funktionen:**

```javascript
// User abrufen
const userData = database.getUser(userId);

// User speichern
await database.setUser(userId, userData);

// Alle User
const allUsers = database.getAllUsers();

// Gruppe abrufen
const groupData = database.getGroup(groupId);

// Gruppe speichern
await database.setGroup(groupId, groupData);

// Änderungen speichern (wichtig!)
await database.save();
```

### Beispiel: Münzwurf-Command

```javascript
const handler = async (m, { user, send, chatId }) => {
  if (!user.registered) {
    return '❌ Registriere dich erst mit .register';
  }
  
  const coin = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
  const emoji = coin === 'Kopf' ? '🪙' : '💰';
  
  return `${emoji} Es ist: **${coin}**!`;
};

handler.command = ['coinflip', 'münze', 'coin'];
handler.tags = ['fun'];
handler.description = 'Wirf eine Münze';

export default handler;
```

### Beispiel: Geld-Transfer

```javascript
const handler = async (m, { user, database, args, sender, messageData }) => {
  if (!user.registered) {
    return '❌ Nicht registriert';
  }
  
  // Check ob jemand erwähnt wurde
  if (!messageData.mentions || messageData.mentions.length === 0) {
    return '💡 Verwendung: .pay @user <betrag>';
  }
  
  const targetId = messageData.mentions[0];
  const amount = parseInt(args[0]);
  
  if (isNaN(amount) || amount <= 0) {
    return '❌ Ungültiger Betrag';
  }
  
  if (user.money < amount) {
    return '❌ Nicht genug Geld!';
  }
  
  // Target-User laden
  const targetUser = database.getUser(targetId);
  if (!targetUser || !targetUser.registered) {
    return '❌ User nicht registriert';
  }
  
  // Transfer
  user.money -= amount;
  targetUser.money = (targetUser.money || 0) + amount;
  
  // Speichern
  await database.setUser(sender, user);
  await database.setUser(targetId, targetUser);
  
  return `✅ ${amount}€ an ${targetUser.name} überwiesen!`;
};

handler.command = ['pay', 'bezahlen'];
handler.tags = ['economy'];
handler.description = 'Geld an User überweisen';
handler.usage = 'pay @user <betrag>';

export default handler;
```

---

## Troubleshooting

### Bot startet nicht

**Fehler: "Cannot find module"**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

**Fehler: "Falsches Passwort"**
- Master-Passwort korrekt eingeben (Case-Sensitive!)
- Bei Vergessen: Datenbank ist verloren (neu anlegen)

**Fehler: "Port 3001 already in use"**
```bash
# Port in config.json ändern:
"website": {
  "port": 3002  // Statt 3001
}
```

### QR-Code erscheint nicht

**Terminal zu klein:**
- Terminal-Fenster vergrößern
- Schriftgröße verkleinern

**Termux:**
- Volumen-Down + E → Menü → Font Size → Kleiner

### Bot antwortet nicht

**Check 1: Ist Bot online?**
```
.ping
```

Keine Antwort? Bot-Prozess prüfen:
```bash
# PC:
ps aux | grep node

# Mit PM2:
pm2 status
pm2 logs whatsapp-bot
```

**Check 2: DSGVO akzeptiert?**
```
.acceptdsgvo
```

**Check 3: Richtiger Prefix?**
In Gruppen könnte ein eigener Prefix sein:
```
!ping
/ping
```

### Web-Dashboard nicht erreichbar

**Lokal:**
```bash
# Prüfe ob Bot läuft
pm2 status

# Prüfe Port
netstat -an | grep 3001

# Versuche:
http://127.0.0.1:3001
http://localhost:3001
```

**VPS:**
```bash
# Firewall check
sudo ufw status

# Port öffnen
sudo ufw allow 3001
```

### Login funktioniert nicht

**Passwort vergessen?**
Bot anschreiben:
```
.setwebpass NeuesPasswort123
```

**Username vergessen?**
```
.profil
```
→ Name ist dein Username

### Termux: Bot wird beendet

**Battery Optimization:**
1. Android Einstellungen
2. Apps → Termux
3. Akku → Nicht optimieren

**Screen/PM2 nutzen:**
```bash
# Screen:
screen -S bot
npm start
# Ctrl+A dann D

# PM2:
pm2 start index.new.js --name whatsapp-bot
```

### VPS: Bot startet nach Reboot nicht

**PM2 Setup prüfen:**
```bash
pm2 startup systemd
# Befehl ausführen der angezeigt wird!
pm2 save
```

**systemd Service erstellen:**
```bash
sudo nano /etc/systemd/system/whatsapp-bot.service
```

Inhalt:
```ini
[Unit]
Description=WhatsApp Bot
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/home/botuser/whatsapp-bot
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Aktivieren:
```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
```

### Speicherprobleme (RAM)

**Node.js Memory Limit setzen:**

In `package.json`:
```json
"scripts": {
  "start": "node --max-old-space-size=512 index.new.js"
}
```

Oder vor Start:
```bash
export NODE_OPTIONS="--max-old-space-size=512"
npm start
```

### Updates installieren

```bash
cd ~/whatsapp-bot

# Backup erstellen
cp -r data/ ~/backup-$(date +%Y%m%d)/

# Updates holen
git pull

# Dependencies
npm install

# Neustart
pm2 restart whatsapp-bot
# Oder:
npm start
```

---

## FAQ

**Läuft der Bot 24/7?**
- PC: Nur wenn PC an ist
- Termux: Ja, mit screen/PM2 und Battery Optimization aus
- UserLAnd: Ja, mit screen/PM2
- VPS: **Ja, perfekt für 24/7**

**Kostet der Bot etwas?**
- Software: Kostenlos & Open Source
- PC/Termux/UserLAnd: Kostenlos (nur Strom)
- VPS: 3-10€/Monat

**Kann ich mehrere Bots auf einem Gerät?**
Ja, aber jeder Bot braucht:
- Eigenen Ordner
- Eigene Datenbank
- Eigenen Port (z.B. 3001, 3002, 3003)

**Was passiert bei Bot-Neustart?**
- Alle Daten bleiben (verschlüsselt in DB)
- QR-Code muss NICHT neu gescannt werden (Session bleibt)
- Commands funktionieren sofort wieder

**Kann ich die Datenbank sichern?**
```bash
# Backup erstellen
cp -r data/ ~/bot-backup-$(date +%Y%m%d)/

# Automatisches Backup (cronjob):
crontab -e
# Einfügen:
0 3 * * * cp -r ~/whatsapp-bot/data ~/backups/backup-$(date +\%Y\%m\%d)
```

**Wo sind die Logs?**
```bash
# Mit PM2:
pm2 logs whatsapp-bot

# Oder in Datei:
npm start 2>&1 | tee bot.log
```

**Kann ich den Bot personalisieren?**
Ja:
- `config.json`: Name, Prefix, Einstellungen
- `src/plugins/commands/`: Commands anpassen
- Web-Interface: Logo, Farben (in `src/website/frontend/`)

**Ist der Bot DSGVO-konform?**
Ja:
- Daten verschlüsselt
- User-Rechte (Auskunft, Export, Löschung)
- Consent-System
- Keine Weitergabe
- Siehe: `.dsgvo` Command

**WhatsApp sperrt meinen Account?**
Nein, wenn:
- Du die offizielle WhatsApp API verwendest (macht der Bot)
- Du nicht spammst
- Du Nutzungsbedingungen einhältst
- Kein kommerzieller Missbrauch

Trotzdem: Nutze auf eigene Verantwortung!

---

## Sicherheit

### Was ist verschlüsselt?

✅ **Verschlüsselt (AES-256-GCM):**
- Komplette Datenbank
- User-Daten (Namen, Nummern, etc.)
- Gruppen-Daten
- Support-Tickets
- Alle Backups

❌ **Nicht verschlüsselt:**
- config.json
- .env Datei (Secrets!)
- Logs
- WhatsApp-Sessions

### Wichtige Sicherheits-Regeln

1. **Master-Passwort sicher aufbewahren**
   - Ohne Passwort = Kein Zugriff auf Datenbank
   - Backup an sicherem Ort
   - Passwort-Manager nutzen

2. **.env NIEMALS committen**
   - Enthält Secrets
   - .gitignore prüfen

3. **Web-Dashboard schützen**
   - Starke Passwörter
   - Nur im lokalen Netzwerk ODER mit Nginx + SSL
   - Nicht öffentlich ohne https!

4. **VPS absichern**
   ```bash
   # Firewall
   sudo ufw enable
   sudo ufw allow 22
   sudo ufw allow 3001   # Nur wenn nötig
   
   # SSH-Keys statt Passwörter
   ssh-copy-id botuser@server-ip
   
   # Auto-Updates
   sudo apt install unattended-upgrades
   ```

5. **Regelmäßige Backups**
   ```bash
   # data/ Ordner sichern
   cp -r data/ ~/backups/
   
   # Backup verschlüsseln (optional)
   tar -czf backup.tar.gz data/
   gpg -c backup.tar.gz
   ```

---

## Projektstruktur

```
whatsapp-bot/
├── config.json                 # Bot-Konfiguration
├── .env                        # Secrets (NICHT committen!)
├── .gitignore                  # Git Ignore Rules
├── package.json                # Dependencies
├── setup.js                    # Setup-Assistent
├── index.new.js                # Bot Hauptdatei
├── restart.js                  # Auto-Restart Script
│
├── data/                       # Daten (verschlüsselt)
│   ├── database.enc           # Verschlüsselte DB
│   └── backups/               # Auto-Backups
│
└── src/
    ├── database/
    │   ├── EncryptedDatabase.js      # DB + Verschlüsselung
    │   └── DatabaseMigration.js      # Migration Tool
    │
    ├── plugins/
    │   ├── PluginManager.js          # Plugin Loader
    │   └── commands/                 # Command Plugins (30+)
    │       ├── help.js
    │       ├── register.js
    │       ├── profil.js
    │       ├── level.js
    │       └── ...
    │
    ├── utils/
    │   ├── PermissionManager.js      # Rollen & Rechte
    │   └── DsgvoManager.js           # DSGVO Logik
    │
    └── website/
        ├── backend/
        │   ├── WebServer.js          # Express Server
        │   └── ActivityLogger.js     # Logging
        └── frontend/
            └── dist/                 # Web-Interface
                ├── index.html
                ├── dashboard.html
                └── ...
```

---

## Technologien

**Backend:**
- Node.js + Express.js
- @deathnaitsa/wa-api (WhatsApp)
- Socket.io (Realtime)
- AES-256-GCM Verschlüsselung

**Frontend:**
- Vanilla JavaScript
- Blockly (Visual Editor)
- Socket.io Client

**Sicherheit:**
- bcryptjs (Passwörter)
- jsonwebtoken (JWT)
- helmet (Security Headers)
- express-rate-limit

---

## Support & Community

**Probleme?**
1. [Troubleshooting](#troubleshooting) lesen
2. [GitHub Issues](https://github.com/DEIN-USERNAME/whatsapp-bot/issues) durchsuchen
3. Neues Issue erstellen mit:
   - Problem-Beschreibung
   - Error-Logs
   - System-Info (OS, Node-Version)

**Beitragen:**
- Pull Requests willkommen!
- Eigene Commands teilen
- Bugs melden
- Dokumentation verbessern

**Lizenz:** ISC License

---

## Credits

Entwickelt mit ❤️ für die WhatsApp Bot Community

**Libraries:**
- [@deathnaitsa/wa-api](https://www.npmjs.com/package/@deathnaitsa/wa-api)
- [Express.js](https://expressjs.com)
- [Socket.io](https://socket.io)
- [Blockly](https://developers.google.com/blockly)

---

**⚠️ Disclaimer:**

Dieser Bot ist ein Hobby-Projekt. Nutze ihn auf eigene Verantwortung. Der Entwickler übernimmt keine Haftung für:
- Datenverlust
- WhatsApp-Account-Sperrungen
- Schäden durch Nutzung

**Wichtig:**
- Master-Passwort sicher aufbewahren
- Regelmäßig Backups erstellen
- Nicht für kommerziellen Missbrauch
- WhatsApp Terms of Service beachten

---

**Made with ❤️ | v2.0.0 | 2024**

Bei Fragen: GitHub Issues öffnen oder `.support` Command nutzen 🚀
