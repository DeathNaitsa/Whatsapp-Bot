async function handler(m, context) {
    const { user, database, config, args, client, sendMessage, messageData } = context;
    
    try {
        await sendMessage(messageData.sender, { react: { text: '', key: messageData.message.key } });
        
    } catch (error) {
        console.error('Command Error:', error);
        return '❌ Fehler: ' + error.message;
    }
}


handler.help = ['s'];
handler.tags = ['custom'];
handler.command = ['s'];



export default handler;
