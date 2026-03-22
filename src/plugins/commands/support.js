const handler = async (m, { user, database, config, args, chatId, sender }) => {
  
  if (!args[0]) {
    return `🎫 *Support-Anfrage*

Erstelle ein Support-Ticket.

📝 Verwendung:
.support <deine nachricht>

Beispiel:
.support Ich habe ein Problem mit dem Level-System

ℹ️ Dein Ticket wird an das Support-Team weitergeleitet.`;
  }
  
  const message = args.join(' ');
  
  const ticketId = `TICKET-${Date.now()}`;
  
  const ticket = {
    id: ticketId,
    userId: sender,
    userName: user.name,
    message: message,
    status: 'open',
    createdAt: new Date().toISOString(),
    responses: []
  };
  
  if (!database.data.tickets) database.data.tickets = {};
  database.data.tickets[ticketId] = ticket;
  await database.save();
  
  return `✅ *Support-Ticket erstellt*

Ticket-ID: ${ticketId}

📩 Deine Anfrage wurde an das Support-Team weitergeleitet.

⏱️ Durchschnittliche Antwortzeit: 2-24 Stunden

📊 Status: Offen

Du kannst den Status deines Tickets auf der Website einsehen:
🌐 http://localhost:${config.website.port}/dashboard.html

Vielen Dank für deine Geduld! 🙏`;
};

handler.help = ['support'];
handler.tags = ['main'];
handler.command = ['support', 'ticket', 'hilfe'];

export default handler;
