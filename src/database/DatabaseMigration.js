import EncryptedDatabase from './EncryptedDatabase.js';
import fs from 'fs/promises';
import crypto from 'crypto';

class DatabaseMigration {
  constructor(oldDbPath, newDb) {
    this.oldDbPath = oldDbPath;
    this.newDb = newDb;
  }

  createOldHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  async loadOldDatabase() {
    try {
      const content = await fs.readFile(this.oldDbPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Fehler beim Laden der alten Datenbank:', error);
      throw error;
    }
  }

  convertUserData(oldUserId, oldData) {
    const platformIds = [];
    
    platformIds.push(oldUserId);
    
    if (oldData.linkedAccounts && Array.isArray(oldData.linkedAccounts)) {
      oldData.linkedAccounts.forEach(account => {
        if (Array.isArray(account) && account.length > 0) {
          account.forEach(id => {
            if (id && !platformIds.includes(id)) {
              platformIds.push(id);
            }
          });
        }
      });
    }

    return {
      name: oldData.name || oldData.supname || 'Unbekannt',
      age: oldData.age || null,
      region: oldData.region || null,
      gender: oldData.gender || null,
      pronouns: oldData.pronouns || null,
      hobbies: oldData.hobbies || [],
      birthday: oldData.birthday || null,
      
      platformIds: platformIds.filter(id => id && id !== ''),
      oldHash: oldUserId,
      

      registered: oldData.registered || false,
      registeredAt: oldData.regTime || Date.now(),
      anmelden: oldData.anmelden !== false,
      
      level: oldData.level || 0,
      exp: oldData.exp || 0,
      pointxp: oldData.pointxp || 0,
      prestige: oldData.prestige || 0,
      
      money: oldData.money || 0,
      dolares: oldData.dolares || 0,
      bank: oldData.bank || 0,
      bankLimit: oldData.bankLimit || 1000000,
      coins: oldData.coins || 0,
      
      items: {
        pickaxe: oldData.pickaxe || 0,
        pickaxedurability: oldData.pickaxedurability || 0,
        sword: oldData.sword || 0,
        sworddurability: oldData.sworddurability || 0,
        armor: oldData.armor || 0,
        armordurability: oldData.armordurability || 0,
        fishingrod: oldData.fishingrod || 0,
        fishingroddurability: oldData.fishingroddurability || 0,
        ring: oldData.ring || 0,
        ringdurability: oldData.ringdurability || 0,
        
        wood: oldData.wood || 0,
        stone: oldData.stone || oldData.rock || 0,
        iron: oldData.iron || 0,
        gold: oldData.gold || 0,
        diamond: oldData.diamond || oldData.diamonds || 0,
        emerald: oldData.emerald || 0,
        coal: oldData.coal || 0,
        
        apple: oldData.apple || 0,
        orange: oldData.orange || 0,
        banana: oldData.banana || 0,
        grape: oldData.grape || 0,
        watermelon: oldData.watermelon || 0,
        strawberry: oldData.strawberry || 0,
        cherry: oldData.cherry || 0,
        blueberry: oldData.blueberry || oldData.bluberry || 0,
        raspberry: oldData.raspberry || 0,
        fish: oldData.fish || 0,
        steak: oldData.steak || 0,
        sushi: oldData.sushi || oldData.Sushi || 0,
        bread: oldData.bread || 0,
        cheese: oldData.cheese || 0,
        
        water: oldData.water || 0,
        milk: oldData.milk || 0,
        seeds: oldData.seeds || oldData.seed || 0
      },
      
      farm: oldData.farm || null,
      planted: oldData.planted || false,
      plantWaterLevels: oldData.plantWaterLevels || {},
      
      health: oldData.health || 100,
      hero: oldData.hero || 0,
      warn: oldData.warn || 0,
      banned: oldData.banned || false,
      timeout: oldData.timeout || 0,
      
      premium: oldData.premium || false,
      premiumDate: oldData.premiumDate || null,
      premiumTime: oldData.premiumTime || null,
      
      team: oldData.team || null,
      teamm: oldData.teamm || null,
      label: oldData.label || null,
      role: oldData.role || null,
      
      cooldown: oldData.cooldown || {},
      lastwork: oldData.lastwork || 0,
      lastmine: oldData.lastmine || 0,
      lastrob: oldData.lastrob || 0,
      lastfishing: oldData.lastfishing || 0,
      lastHunt: oldData.lastHunt_Jan || 0,
      lastslot: oldData.lastslot || oldData.lastSlot || 0,
      lastbonus: oldData.lastbonus || 0,
      lastClaim: oldData.lastClaim || 0,
      
      workStats: oldData.workStats || { xpToday: 0, moneyToday: 0 },
      workCount: oldData.workCount || 0,
      
      crimeCount: oldData.crimeCount || 0,
      crimeStats: oldData.crimeStats || { xp: 0, money: 0 },
      
      marry: oldData.marry || null,
      marryId: oldData.marryId || null,
      marriageId: oldData.marriageId || null,
      marrySince: oldData.marrySince || null,
      
      pet: oldData.pet || null,
      petFood: oldData.petFood || 0,
      
      pokemon: oldData.pokemon || null,
      
      quests: oldData.quests || {},
      achievements: oldData.achievements || {},
      
      shop: oldData.shop || {},
      boosts: oldData.boosts || {},
      upgrades: oldData.upgrades || {},
      freeSpins: oldData.freeSpins || null,
      
      autolevelup: oldData.autolevelup !== false,
      antiTag: oldData.antiTag || false,
      afk: oldData.afk || -1,
      afkReason: oldData.afkReason || '',
      
      webPassword: oldData.webPassword || null,
      email: oldData.email || null,
      
      api: oldData.api || false,
      apiToken: oldData.apiToken || null,
      apiFolder: oldData.apiFolder || null,
      tokenExpiry: oldData.tokenExpiry || null,
      
      host: oldData.host || null,
      hostsAgbDsgvo: oldData.hostsAgbDsgvo || false,
      
      profileImagePath: oldData.profileImagePath || null,
      
      stats: oldData.stats || {},
      
      dsgvoAccepted: false,
      dsgvoAcceptedAt: null,
      
      // Timestamps
      lastUpdate: oldData.lastUpdate || new Date().toISOString(),
      migratedAt: new Date().toISOString()
    };
  }

  async migrate() {
    console.log('🔄 Starte Datenbank-Migration...');
    
    try {
      const oldDb = await this.loadOldDatabase();
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const [oldUserId, oldUserData] of Object.entries(oldDb)) {
        try {
          if (oldUserData.master) {
            console.log(`⏭️ Überspringe verknüpften Account: ${oldUserId}`);
            skippedCount++;
            continue;
          }

          const newUserData = this.convertUserData(oldUserId, oldUserData);
          
          const primaryId = newUserData.platformIds[0];
          await this.newDb.setUser(primaryId, newUserData);
          
          migratedCount++;
          
          if (migratedCount % 10 === 0) {
            console.log(`📊 Fortschritt: ${migratedCount} User migriert...`);
          }
        } catch (error) {
          console.error(`❌ Fehler bei User ${oldUserId}:`, error.message);
          errorCount++;
        }
      }

      console.log('\n✅ Migration abgeschlossen!');
      console.log(`✔️ Migriert: ${migratedCount}`);
      console.log(`⏭️ Übersprungen: ${skippedCount}`);
      console.log(`❌ Fehler: ${errorCount}`);
      
      return {
        success: true,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount
      };
      
    } catch (error) {
      console.error('❌ Migration fehlgeschlagen:', error);
      throw error;
    }
  }
}

export default DatabaseMigration;
