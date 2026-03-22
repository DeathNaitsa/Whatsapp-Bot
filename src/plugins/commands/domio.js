async function handler(m, context) {
    const { user, database, config, args, client, sendMessage, messageData } = context;
    
    try {
        await sendMessage(messageData.sender, { text: 'hallooo' }, { quoted: messageData.raw });
        
    } catch (error) {
        console.error('Command Error:', error);
        return '❌ Fehler: ' + error.message;
    }
}


handler.help = ['domio'];
handler.tags = ['custom'];
handler.command = ['domio'];



export default handler;
