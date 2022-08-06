const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

/**
 * @type {WebSocket.WebSocket[]}
 */
var admins = []
var pesanans = []

wss.on('connection', (ws) => {
    ws.on('message', (messageAsString) => {
        /**
         * @type {{
         *  pengirim: String, 
         *  pesanan: Object
         * }}
         */
        const message = JSON.parse(messageAsString);
        console.log(message)
        if (message.pengirim.slice(0, 12)/* .slice(-8) */ == 'Admin Kantin') {
            admins.push(ws);
            ws.send(JSON.stringify({ tipe: "all order", data: pesanans }))
            // return true; gatau ini bisa nge end 'on' apa engga
        } else {
            pesanans.push(message.pesanan)
            admins.forEach((a) => {
                a.send(JSON.stringify({ tipe: "notif pesanan baru", data: message.pesanan }))
            })
        }
    })
});