const handler = async (m, { database, args, send, chatId }) => {
    const category = (args[0] || 'level').toLowerCase();
    
    const allUsers = Object.values(database.getAllUsers());
    
    if (allUsers.length === 0) {
        return send.text(chatId, '❌ Keine Benutzer gefunden!');
    }
    
    let sorted = [];
    let emoji = '';
    let title = '';
    let fieldName = '';
    
    switch (category) {
        case 'level':
            sorted = allUsers.sort((a, b) => {
                const prestigeDiff = (b.prestige || 0) - (a.prestige || 0);
                if (prestigeDiff !== 0) return prestigeDiff;
                return (b.level || 0) - (a.level || 0);
            });
            emoji = '🏆';
            title = 'Level-Rangliste';
            fieldName = 'level';
            break;
            
        case 'xp':
        case 'exp':
            sorted = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));
            emoji = '✨';
            title = 'XP-Rangliste';
            fieldName = 'exp';
            break;
            
        case 'coins':
        case 'coin':
            sorted = allUsers.sort((a, b) => (b.coins || 0) - (a.coins || 0));
            emoji = '💰';
            title = 'Coins-Rangliste';
            fieldName = 'coins';
            break;
            
        case 'messages':
        case 'msg':
            sorted = allUsers.sort((a, b) => (b.messagesCount || 0) - (a.messagesCount || 0));
            emoji = '📝';
            title = 'Nachrichten-Rangliste';
            fieldName = 'messagesCount';
            break;
            
        default:
            return send.text(chatId, 
                `❌ Ungültige Kategorie!\n\n` +
                `Verfügbare Kategorien:\n` +
                `• level - Level-Rangliste\n` +
                `• xp - XP-Rangliste\n` +
                `• coins - Coins-Rangliste\n` +
                `• messages - Nachrichten-Rangliste`
            );
    }
    
    const top10 = sorted.slice(0, 10);
    
    let message = `${emoji} *${title}* ${emoji}\n\n`;
    
    top10.forEach((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        const name = user.username || user.name || 'Unbekannt';
        const prestige = user.prestige ? `⭐${user.prestige}` : '';
        
        let value = '';
        switch (fieldName) {
            case 'level':
                value = `Level ${user.level || 0} ${prestige}`;
                break;
            case 'exp':
                value = `${(user.exp || 0).toLocaleString('de-DE')} XP`;
                break;
            case 'coins':
                value = `${(user.coins || 0).toLocaleString('de-DE')} 💰`;
                break;
            case 'messagesCount':
                value = `${(user.messagesCount || 0).toLocaleString('de-DE')} 📝`;
                break;
        }
        
        message += `${medal} ${name}\n   ${value}\n\n`;
    });
    
    message += `\n_Gesamt: ${allUsers.length} Spieler_`;
    
    await send.text(chatId, message);
};

handler.help = ['leaderboard', 'lb', 'top'];
handler.tags = ['leveling'];
handler.command = ['leaderboard', 'lb', 'top'];
handler.description = 'Zeige die Top-Spieler nach Level, XP, Coins oder Messages';
handler.usage = 'leaderboard [level|xp|coins|messages]';

export default handler;
