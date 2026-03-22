import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import ActivityLogger from './ActivityLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebServer {
  constructor(database, config, permissionManager, dsgvoManager, botClient) {
    this.db = database;
    this.config = config;
    this.permissionManager = permissionManager;
    this.dsgvoManager = dsgvoManager;
    this.activityLogger = new ActivityLogger(database);
    
    if (botClient && botClient.pluginManager) {
      this.botClient = botClient.client;
      this.pluginManager = botClient.pluginManager;
    } else {
      this.botClient = botClient;
      this.pluginManager = null;
    }
    
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.activityLogger = new ActivityLogger(this.db);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
  }

  setupMiddleware() {
    this.app.use(cookieParser(this.config.website.sessionSecret));
    
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https://blockly-demo.appspot.com'],
          connectSrc: ["'self'", 'https://unpkg.com']
        }
      }
    }));
    
    this.app.use(cors({
      origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost', 'http://127.0.0.1'],
      credentials: true
    }));
    
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.maxRequests,
      message: 'Zu viele Anfragen, bitte versuche es später erneut.'
    });
    this.app.use('/api/', limiter);
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    this.app.use(session({
      secret: this.config.website.sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: 'bot.session',
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: this.config.security.sessionTimeout,
        sameSite: 'lax'
      }
    }));
    
    const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
    this.app.use(express.static(frontendPath));
  }

  setupRoutes() {
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: this.config.bot.version
      });
    });
    
    this.setupAuthRoutes();
    this.setupUserRoutes();
    this.setupAdminRoutes();
    this.setupSupportRoutes();
    this.setupBotRoutes();
    this.setupActivityRoutes();
    this.setupSecurityRoutes();
    
    this.app.get('/dashboard', this.requireAuth.bind(this), (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'dashboard-loader.html'));
    });
    
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    });
  }

  setupAuthRoutes() {
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { username, password, rememberMe } = req.body;
        
        if (!username || !password) {
          return res.status(400).json({ error: 'Username und Passwort erforderlich' });
        }
        
        const users = this.db.getAllUsers();
        let foundUser = null;
        let foundUserId = null;
        
        for (const [userId, userData] of Object.entries(users)) {
          if (userData.name === username || userData.supname === username) {
            const crypto = await import('crypto');
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            
            if (userData.webPassword === hashedPassword) {
              foundUser = userData;
              foundUserId = userId;
              break;
            }
          }
        }
        
        if (!foundUser) {
          return res.status(401).json({ error: 'Benutzername oder Passwort falsch' });
        }
        
        req.session.userId = foundUserId;
        req.session.user = {
          id: foundUserId,
          name: foundUser.name,
          team: foundUser.teamm || null,
          premium: foundUser.premium || false
        };
        
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
          req.session.cookie.maxAge = this.config.security.sessionTimeout;
        }
        
        await this.db.setUser(foundUserId, { 
          lastSeen: Date.now(),
          lastLogin: new Date().toISOString()
        });
        
        await this.activityLogger.log(foundUserId, 'LOGIN', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          rememberMe
        });
        
        res.json({
          success: true,
          user: req.session.user
        });
        
      } catch (error) {
        console.error('Login-Fehler:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    this.app.post('/api/auth/logout', (req, res) => {
      const userId = req.session.userId;
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Fehler beim Abmelden' });
        }
        
        if (userId) {
          this.activityLogger.log(userId, 'LOGOUT', { ip: req.ip });
        }
        
        res.clearCookie('bot.session');
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Erfolgreich abgemeldet' });
      });
    });
    
    this.app.get('/api/auth/session', (req, res) => {
      if (req.session && req.session.userId) {
        res.json({
          authenticated: true,
          user: req.session.user
        });
      } else {
        res.json({ authenticated: false });
      }
    });
  }

  setupUserRoutes() {
    this.app.get('/api/user/info', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User nicht gefunden' });
        }
        
        res.json({
          name: user.name || 'Unbekannt',
          rank: user.teamm || null,
          permissions: this.getUserPermissions(user)
        });
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der User-Info' });
      }
    });

    this.app.get('/api/user/profile', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User nicht gefunden' });
        }
        
        const safeUser = { ...user };
        delete safeUser.webPassword;
        delete safeUser.apiToken;
        
        res.json(safeUser);
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden des Profils' });
      }
    });
    
    this.app.put('/api/user/profile', this.requireAuth.bind(this), async (req, res) => {
      try {
        const updates = req.body;
        
        const allowedFields = ['name', 'age', 'region', 'gender', 'pronouns', 'hobbies', 'birthday'];
        const filteredUpdates = {};
        
        for (const field of allowedFields) {
          if (updates.hasOwnProperty(field)) {
            filteredUpdates[field] = updates[field];
          }
        }
        
        await this.db.setUser(req.session.userId, filteredUpdates);
        
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
      }
    });
    
    this.app.get('/api/user/stats', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        const allUsers = this.db.getAllUsers();
        
        if (!user) {
          return res.status(404).json({ error: 'User nicht gefunden' });
        }
        
        const stats = {
          // User Stats
          level: user.level || 1,
          exp: user.exp || 0,
          money: user.money || 0,
          coins: user.coins || 0,
          premium: user.premium || false,
          registered: user.registered || false,
          registeredAt: user.registeredAt || null,
          
          lastSeen: user.lastSeen || Date.now(),
          commandsUsed: user.commandsUsed || 0,
          messagesCount: user.messagesCount || 0,
          
          moneyRank: this.calculateRank(allUsers, 'money', user.money || 0),
          levelRank: this.calculateRank(allUsers, 'level', user.level || 1),
          expRank: this.calculateRank(allUsers, 'exp', user.exp || 0),
          
          totalUsers: Object.keys(allUsers).length,
          totalRegistered: Object.values(allUsers).filter(u => u.registered).length
        };
        
        res.json(stats);
      } catch (error) {
        console.error('Stats-Fehler:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
      }
    });
  }
  
  calculateRank(users, field, value) {
    const sorted = Object.values(users)
      .map(u => u[field] || 0)
      .sort((a, b) => b - a);
    
    return sorted.indexOf(value) + 1;
  }

  setupAdminRoutes() {
    this.app.get('/api/admin/users', this.requireAuth.bind(this), this.requireTeam.bind(this), async (req, res) => {
      try {
        const users = this.db.getAllUsers();
        
        const safeUsers = {};
        for (const [id, user] of Object.entries(users)) {
          safeUsers[id] = {
            id,
            name: user.name,
            level: user.level,
            team: user.teamm,
            premium: user.premium,
            registered: user.registered,
            registeredAt: user.registeredAt
          };
        }
        
        res.json(safeUsers);
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der User' });
      }
    });
    
    this.app.put('/api/admin/users/:userId/team', this.requireAuth.bind(this), this.requireOwner.bind(this), async (req, res) => {
      try {
        const { userId } = req.params;
        const { team } = req.body;
        
        if (!this.permissionManager.roleExists(team)) {
          return res.status(400).json({ error: 'Ungültige Rolle' });
        }
        
        await this.db.setUser(userId, { teamm: team });
        
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
      }
    });
  }

  setupSupportRoutes() {
    this.app.post('/api/support/ticket', this.requireAuth.bind(this), async (req, res) => {
      try {
        const { subject, message } = req.body;
        
        if (!subject || !message) {
          return res.status(400).json({ error: 'Betreff und Nachricht erforderlich' });
        }
        
        const ticketId = `TICKET-${Date.now()}`;
        
        const ticket = {
          id: ticketId,
          userId: req.session.userId,
          userName: req.session.user.name,
          subject,
          message,
          status: 'open',
          createdAt: new Date().toISOString(),
          responses: []
        };
        
        if (!this.db.data.tickets) this.db.data.tickets = {};
        this.db.data.tickets[ticketId] = ticket;
        await this.db.save();
        
        res.json({ success: true, ticket });
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen des Tickets' });
      }
    });
    
    this.app.get('/api/support/tickets', this.requireAuth.bind(this), async (req, res) => {
      try {
        const allTickets = this.db.data.tickets || {};
        const user = this.db.getUser(req.session.userId);
        
        let tickets = {};
        
        if (this.permissionManager.isTeam(user)) {
          tickets = allTickets;
        } else {
          for (const [id, ticket] of Object.entries(allTickets)) {
            if (ticket.userId === req.session.userId) {
              tickets[id] = ticket;
            }
          }
        }
        
        res.json(tickets);
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Tickets' });
      }
    });
  }

  setupBotRoutes() {
    this.app.get('/api/bot/stats', this.requireAuth.bind(this), async (req, res) => {
      try {
        const users = this.db.getAllUsers();
        const groups = this.db.data.groups || {};
        
        const stats = {
          totalUsers: Object.keys(users).length,
          registeredUsers: Object.values(users).filter(u => u.registered).length,
          premiumUsers: Object.values(users).filter(u => u.premium).length,
          totalGroups: Object.keys(groups).length,
          botVersion: this.config.bot.version
        };
        
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
      }
    });

    this.app.get('/api/plugins', this.requireAuth.bind(this), async (req, res) => {
      try {
        if (!this.pluginManager) {
          return res.status(503).json({ error: 'Plugin Manager nicht verfügbar' });
        }

        const plugins = this.pluginManager.getPluginList();
        res.json(plugins);
      } catch (error) {
        console.error('Plugins API error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Plugins' });
      }
    });

    this.app.get('/api/commands', this.requireAuth.bind(this), async (req, res) => {
      try {
        if (!this.pluginManager) {
          return res.status(503).json({ error: 'Plugin Manager nicht verfügbar' });
        }

        const commands = this.pluginManager.getCommandList();
        res.json(commands);
      } catch (error) {
        console.error('Commands API error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Commands' });
      }
    });

    this.app.post('/api/commands/save', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        const { id, name, description, code, permission } = req.body;

        if (!name || !code) {
          return res.status(400).json({ error: 'Name und Code sind erforderlich' });
        }

        if (permission === 'owner' && !this.permissionManager.isOwner(user)) {
          return res.status(403).json({ error: 'Keine Berechtigung für Owner-Commands' });
        }

        if (!id && this.pluginManager) {
          const existing = this.pluginManager.commandExists(name);
          if (existing) {
            return res.status(400).json({ error: 'Command existiert bereits' });
          }
        }

        const validation = this.validateCommandCode(code);
        if (!validation.safe) {
          return res.status(400).json({ error: 'Unsicherer Code erkannt: ' + validation.reason });
        }

        const result = await this.pluginManager.saveCommand({
          id,
          name: name.toLowerCase(),
          description,
          code,
          permission,
          author: user.name
        });

        res.json({ success: true, message: 'Command gespeichert!', commandId: result.id });
      } catch (error) {
        console.error('Save command error:', error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
      }
    });

    this.app.delete('/api/commands/delete/:id', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        const { id } = req.params;

        if (!this.pluginManager) {
          return res.status(503).json({ error: 'Plugin Manager nicht verfügbar' });
        }

        const cmdInfo = this.pluginManager.getCommandInfo(id);
        if (!cmdInfo) {
          return res.status(404).json({ error: 'Command nicht gefunden' });
        }

        if (cmdInfo.owner && !this.permissionManager.isOwner(user)) {
          return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        await this.pluginManager.deleteCommand(id);
        res.json({ success: true, message: 'Command gelöscht!' });
      } catch (error) {
        console.error('Delete command error:', error);
        res.status(500).json({ error: 'Fehler beim Löschen' });
      }
    });

    this.app.post('/api/bot/restart', this.requireTeam.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        
        if (!this.permissionManager.isOwner(user)) {
          return res.status(403).json({ error: 'Nur der Owner kann den Bot neu starten' });
        }

        res.json({ success: true, message: 'Bot wird neu gestartet...' });

        setTimeout(() => {
          console.log('🔄 Bot wird neu gestartet...');
          process.exit(0);
        }, 1000);
      } catch (error) {
        console.error('Restart error:', error);
        res.status(500).json({ error: 'Fehler beim Neustart' });
      }
    });
  }

  setupActivityRoutes() {
    this.app.get('/api/activity/me', this.requireAuth.bind(this), async (req, res) => {
      try {
        const logs = this.activityLogger.getUserLogs(req.session.userId, 50);
        res.json({ logs });
      } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Activity Logs' });
      }
    });

    this.app.get('/api/activity/all', this.requireAuth.bind(this), this.requireTeam.bind(this), async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = this.activityLogger.getAllLogs(limit);
        res.json({ logs });
      } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Activity Logs' });
      }
    });
  }

  setupSecurityRoutes() {
    this.app.get('/api/security/sessions', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = this.db.getUser(req.session.userId);
        
        res.json({
          currentSession: {
            id: req.sessionID,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            lastActivity: new Date().toISOString()
          },
          lastLogin: user.lastLogin || null,
          lastSeen: user.lastSeen || null
        });
      } catch (error) {
        console.error('Sessions error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Sessions' });
      }
    });

    this.app.post('/api/security/change-password', this.requireAuth.bind(this), async (req, res) => {
      try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: 'Aktuelles und neues Passwort erforderlich' });
        }

        if (newPassword.length < this.config.security.passwordMinLength) {
          return res.status(400).json({ 
            error: `Passwort muss mindestens ${this.config.security.passwordMinLength} Zeichen lang sein` 
          });
        }

        const user = this.db.getUser(req.session.userId);
        const crypto = await import('crypto');
        
        const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
        if (user.webPassword !== hashedCurrentPassword) {
          return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
        }

        const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
        await this.db.setUser(req.session.userId, { 
          webPassword: hashedNewPassword 
        });

        await this.activityLogger.log(req.session.userId, 'PASSWORD_CHANGE', {
          ip: req.ip
        });

        res.json({ success: true, message: 'Passwort erfolgreich geändert' });
      } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Fehler beim Ändern des Passworts' });
      }
    });

    this.app.get('/api/security/overview', this.requireAuth.bind(this), this.requireTeam.bind(this), async (req, res) => {
      try {
        const users = this.db.getAllUsers();
        const logs = this.activityLogger.getAllLogs(100);

        const loginAttempts = logs.filter(l => l.action === 'LOGIN').length;
        const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED').length;
        const uniqueIPs = [...new Set(logs.map(l => l.ip))].length;
        const recentActivity = logs.slice(0, 10);

        res.json({
          loginAttempts,
          failedLogins,
          uniqueIPs,
          totalUsers: Object.keys(users).length,
          activeUsers: Object.values(users).filter(u => 
            u.lastSeen && (Date.now() - u.lastSeen) < 86400000
          ).length,
          recentActivity
        });
      } catch (error) {
        console.error('Security overview error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Sicherheitsübersicht' });
      }
    });
  }

  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log('✅ WebSocket Client verbunden');
      
      socket.on('disconnect', () => {
        console.log('❌ WebSocket Client getrennt');
      });
    });
  }

  requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Nicht angemeldet' });
    }
    next();
  }

  requireTeam(req, res, next) {
    const user = this.db.getUser(req.session.userId);
    if (!this.permissionManager.isTeam(user)) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    next();
  }

  requireOwner(req, res, next) {
    const user = this.db.getUser(req.session.userId);
    if (!this.permissionManager.isOwner(user)) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    next();
  }

  validateCommandCode(code) {
    const dangerousPatterns = [
      /require\s*\(\s*['"]child_process['"]\s*\)/,
      /require\s*\(\s*['"]fs['"]\s*\)/,
      /process\.exit/,
      /eval\s*\(/,
      /Function\s*\(/,
      /require\s*\(\s*['"]vm['"]\s*\)/,
      /\.exec\s*\(/,
      /\.spawn\s*\(/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'Gefährliche Funktion erkannt: ' + pattern.source
        };
      }
    }

    if (!code.includes('handler') && !code.includes('function')) {
      return {
        safe: false,
        reason: 'Kein Handler gefunden'
      };
    }

    return { safe: true };
  }

  getUserPermissions(user) {
    const permissions = [];
    
    if (this.permissionManager.isOwner(user)) {
      permissions.push('owner', 'team', 'premium');
    } else if (this.permissionManager.isTeam(user)) {
      permissions.push('team');
    }
    
    if (user.premium) {
      permissions.push('premium');
    }
    
    return permissions;
  }

  start() {
    const port = this.config.website.port;
    const host = this.config.website.host;
    
    this.server.listen(port, host, () => {
      console.log(`\n🌐 Website läuft auf:`);
      console.log(`   http://127.0.0.1:${port}`);
      console.log(`   http://localhost:${port}`);
      console.log(`\n📊 Dashboard: http://127.0.0.1:${port}/dashboard`);
      console.log(`🔒 Login: http://127.0.0.1:${port}/login\n`);
    });
  }
}

export default WebServer;
