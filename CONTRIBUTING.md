# Contributing zu Nishi-Bot

Danke für dein Interesse am Projekt! 🎉

## 🤝 Wie kann ich beitragen?

### Code-Beiträge
1. **Fork** das Repository
2. Erstelle einen **Feature-Branch** (`git checkout -b feature/AmazingFeature`)
3. **Committe** deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. **Push** zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen **Pull Request**

### Bug-Reports
Öffne ein Issue mit:
- Beschreibung des Problems
- Schritte zur Reproduktion
- Erwartetes vs. tatsächliches Verhalten
- Screenshots (falls relevant)
- Node-Version und OS

### Feature-Requests
Beschreibe:
- Was soll die Funktion tun?
- Warum ist sie nützlich?
- Wie könnte die Implementation aussehen?

## 📝 Code-Standards

### JavaScript Style
- Verwende ES6+ Syntax
- `const` über `let`, vermeide `var`
- Async/Await statt Callbacks
- Aussagekräftige Variablennamen
- Kommentare für komplexe Logik

### Plugin-Entwicklung
```javascript
// Template für neue Commands
const handler = async (m, context) => {
  // Input-Validierung
  if (!context.user.registered) {
    return '❌ Nicht registriert';
  }
  
  // Logik
  // ...
  
  // Response
  return '✅ Erfolg';
};

handler.command = ['commandname'];
handler.tags = ['category'];
handler.description = 'Was macht der Command';
handler.usage = 'commandname <args>';

export default handler;
```

### Commits
Nutze conventional commits:
- `feat: Neue Funktion`
- `fix: Bug-Fix`
- `docs: Dokumentation`
- `style: Formatierung`
- `refactor: Code-Refactoring`
- `test: Tests`
- `chore: Build/Config`

Beispiel:
```
feat(commands): Add weather command
fix(database): Fix save race condition
docs(readme): Update installation steps
```

## 🔒 Sicherheit

- **Keine Secrets** im Code committen
- **Input-Validierung** für alle User-Eingaben
- **Keine sensiblen Logs** (User-Daten, Passwörter)
- Security-Issues als **Private Issue** oder Email

## 🧪 Testing

Vor dem Pull Request:
```bash
# Dependencies installieren
npm install

# Bot testen
npm start

# Errors checken
npm run lint  # (wenn vorhanden)
```

## 📋 Pull Request Checklist

- [ ] Code folgt dem Projekt-Style
- [ ] Keine Secrets committed
- [ ] README aktualisiert (falls nötig)
- [ ] Funktioniert auf deinem System
- [ ] Commit-Messages sind aussagekräftig
- [ ] Branch ist aktuell mit main

## 💡 Ideen für Beiträge

### Quick Wins
- Typos in Dokumentation fixen
- Kommentare hinzufügen
- Error-Messages verbessern
- Tests schreiben

### Features
- Neue Commands
- Web-Interface Features
- API-Endpoints
- Plugins

### Verbesserungen
- Performance-Optimierungen
- Code-Refactoring
- Besseres Error-Handling
- Logging-System

## 📞 Fragen?

Bei Fragen:
- Öffne ein Issue mit Label `question`
- Diskutiere in Discussions (falls aktiviert)

## 🙏 Danke!

Jeder Beitrag zählt, egal wie klein!

---

**Code of Conduct**: Sei respektvoll und konstruktiv.
