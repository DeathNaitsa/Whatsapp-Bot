const handler = async (m, { user, database, send, chatId }) => {
    const level = user.level || 0;
    const exp = user.exp || 0;
    const prestige = user.prestige || 0;
    const coins = user.coins || 0;
    
    const nextLevelXp = Math.pow(level + 1, 2) * 100;
    const progress = Math.floor((exp / nextLevelXp) * 100);
    
    const barLength = 10;
    const filledBars = Math.floor(progress / 10);
    const progressBar = '█'.repeat(filledBars) + '░'.repeat(barLength - filledBars);
    
    const prestigeStars = prestige > 0 ? '⭐'.repeat(prestige) : '';
    
    const allUsers = Object.values(database.getAllUsers());
    const userLevels = allUsers
        .map(u => ({ level: u.level || 0, prestige: u.prestige || 0 }))
        .sort((a, b) => {
            if (b.prestige !== a.prestige) return b.prestige - a.prestige;
            return b.level - a.level;
        });
    
    const rank = userLevels.findIndex(u => 
        u.level === level && u.prestige === prestige
    ) + 1;
    
    await send.text(chatId, 
        `📊 *Dein Level-Status* ${prestigeStars}\n\n` +
        `👤 ${user.name || 'Unbekannt'}\n` +
        `🏆 Rang: #${rank} von ${allUsers.length}\n\n` +
        `*Level:* ${level}\n` +
        `*XP:* ${exp}/${nextLevelXp}\n` +
        `*Fortschritt:* ${progress}%\n` +
        `${progressBar}\n\n` +
        (prestige > 0 ? `✨ *Prestige:* ${prestige}\n\n` : '') +
        `💰 *Coins:* ${coins}\n` +
        `📝 *Messages:* ${user.messagesCount || 0}\n\n` +
        (level >= 100 && prestige < 10 
            ? `🌟 *Prestige verfügbar!*\nNutze .prestige für Boni!` 
            : `Nächstes Level: ${nextLevelXp - exp} XP`
        )
    );
};

handler.help = ['level', 'lvl'];
handler.tags = ['leveling'];
handler.command = ['level', 'lvl'];
handler.description = 'Zeige dein aktuelles Level und XP';
handler.usage = 'level';

export default handler;
