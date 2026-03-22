async function handler(m, context) {
    const { user, database, config, args, client, messageData } = context;
    
    try {
        await client.sendMessage(messageData.sender, { text: 'Hierr Deine Schokiiii!!!' }, { quoted: messageData.message });
        
    } catch (error) {
        console.error('Command Error:', error);
        return '❌ Fehler: ' + error.message;
    }
}


handler.help = ['schoko'];
handler.tags = ['custom'];
handler.command = ['schoko'];
handler.owner = true;


export default handler;
