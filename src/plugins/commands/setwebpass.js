import crypto from 'crypto';

const handler = async (m, { user, database, config, args, chatId, sender }) => {
  
  if (!args[0]) {
    return `⚠️ *Web-Passwort setzen*

Setze dein Passwort für das Website-Login.

📝 Verwendung:
.setwebpass <passwort>

Beispiel:
.setwebpass MeinSicheresPasswort123!

ℹ️ Das Passwort muss mindestens ${config.security.passwordMinLength} Zeichen lang sein.`;
  }
  
  const password = args.join(' ');
  
  if (password.length < config.security.passwordMinLength) {
    return `❌ Passwort muss mindestens ${config.security.passwordMinLength} Zeichen lang sein.`;
  }
  
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  await database.setUser(sender, {
    webPassword: hashedPassword
  });
  
  return `✅ *Web-Passwort gesetzt!*

Du kannst dich jetzt auf der Website anmelden:

🌐 Website: http://localhost:${config.website.port}
👤 Benutzername: ${user.name}
🔑 Passwort: Das gerade gesetzte Passwort

🔒 Dein Passwort ist sicher verschlüsselt gespeichert.

⚠️ **WICHTIG:** Merke dir dein Passwort gut oder speichere es sicher ab!`;
};

handler.help = ['setwebpass'];
handler.tags = ['user'];
handler.command = ['setwebpass', 'webpasswort', 'setwebpassword'];

export default handler;
