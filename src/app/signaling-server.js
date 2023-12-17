const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Map of user IDs to WebSocket connections
const users = new Map();

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
  
    console.log('Received message:', data);
  
    if (data.type === 'new-user') {
        users.set(data.user, ws);
        console.log('New user connected:', data.user);
        console.log('Users:', users);
        return;
    }
      
    if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate' || data.type === 'call-request') {
        const recipientWs = users.get(data.user);
        console.log('Received message for user:', data.user);
        console.log('Users:', users);
        if (recipientWs) {
          recipientWs.send(message);
        } else {
          console.error('Could not find recipient for message:', message);
        }
        return;
    }

    // Handle other message types
  });

  ws.on('close', () => {
    // Find the user who disconnected
    for (const [user, userWs] of users.entries()) {
      if (ws === userWs) {
        users.delete(user);
        console.log('User disconnected:', user);
        console.log('Users:', users);
        break;
      }
    }
  });
});