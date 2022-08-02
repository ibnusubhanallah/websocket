const WebSocket = require('ws');
const wss = new WebSocket.Server({port});

/**
 * @type {WebSocket.WebSocket[]}
 */
var admins = []

wss.on('connection', (ws) => {
    ws.on('message', (messageAsString) => {
        /**
         * @type {{
         *  pengirim: String, 
         *  pesanan: Object
         * }}
         */
        const message = JSON.parse(messageAsString);
        if (message.pengirim.slice(0,12)/* .slice(-8) */ == 'Admin Kantin') {
            admins.push(ws);
            // return true; gatau ini bisa nge end 'on' apa engga
        } else {
            admins.forEach((a) => {
                a.send(message.pesanan)
            })
        }
    })
});