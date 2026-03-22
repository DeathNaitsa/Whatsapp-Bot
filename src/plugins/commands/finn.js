async function handler(m, context) {
    const { user, database, sendMessage, config, args, client, messageData } = context;
    
    try {
        console.log(context)
        await sendMessage(messageData.sender, { text: 'finndus stink' }, { quoted: messageData.raw });
        
    } catch (error) {
        console.error('Command Error:', error);
        return '❌ Fehler: ' + error.message;
    }
}


handler.help = ['finn'];
handler.tags = ['custom'];
handler.command = ['finn'];



export default handler;
