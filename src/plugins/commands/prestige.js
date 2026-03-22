const handler = async (m, { user, database, send, chatId, sender }) => {
    if (!user.level || user.level < 100) {
        return send.text(chatId, 
            `❌ *Prestige nicht verfügbar*\n\n` +
            `Du benötigst mindestens Level 100!\n` +
            `Dein aktuelles Level: ${user.level || 0}`
        );
    }
    
    const currentPrestige = user.prestige || 0;
    if (currentPrestige >= 10) {
        return send.text(chatId, 
            `✨ *Max Prestige erreicht!*\n\n` +
            `Du hast bereits das maximale Prestige-Level von 10 erreicht!\n` +
            `Du bist ein wahrer Meister! 🏆`
        );
    }
    
    const newPrestige = currentPrestige + 1;
    const xpMultiplier = 1 + (newPrestige * 0.5); // +50% pro Prestige
    const coinBonus = 1000 * newPrestige;
    
    user.level = 0;
    user.exp = 0;
    user.prestige = newPrestige;
    user.coins = (user.coins || 0) + coinBonus;
    
    if (!user.prestigeMultipliers) user.prestigeMultipliers = {};
    user.prestigeMultipliers.xp = xpMultiplier;
    
    await database.setUser(sender, user);
    
    const prestigeStars = '⭐'.repeat(newPrestige);
    
    await send.text(chatId, 
        `🌟 *PRESTIGE ${newPrestige}!* 🌟\n\n` +
        `${prestigeStars}\n\n` +
        `Du hast Prestige ${newPrestige} erreicht!\n\n` +
        `*Boni:*\n` +
        `• XP-Multiplikator: ${xpMultiplier.toFixed(1)}x\n` +
        `• Coin-Bonus: ${coinBonus} 💰\n` +
        `• Prestige-Rang: ${getPrestigeRank(newPrestige)}\n\n` +
        `Dein Level wurde zurückgesetzt.\n` +
        `Viel Erfolg beim erneuten Aufstieg! 🚀`
    );
};

function getPrestigeRank(prestige) {
    const ranks = [
        '🥉 Bronze',      // Prestige 1
        '🥈 Silber',      // Prestige 2
        '🥇 Gold',        // Prestige 3
        '💎 Platin',      // Prestige 4
        '💠 Diamant',     // Prestige 5
        '🔷 Meister',     // Prestige 6
        '🔶 Großmeister', // Prestige 7
        '👑 Champion',    // Prestige 8
        '🏆 Legende',     // Prestige 9
        '✨ Unsterblich'  // Prestige 10
    ];
    
    return ranks[prestige - 1] || '⭐ Anfänger';
}

handler.help = ['prestige'];
handler.tags = ['leveling'];
handler.command = ['prestige'];
handler.description = 'Setze dein Level zurück für permanente Boni (ab Level 100)';
handler.usage = 'prestige';

export default handler;
