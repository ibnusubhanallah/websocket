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
         *  admin: boolean,
         *  pembeli: String, 
         *  pesanan: Object,
         *  status: Enumerator,
         *  totalHarga: int
         * }}
         */
        const message = JSON.parse(messageAsString);
        console.log(message)
        if (message.admin) {
            admins.push(ws);
            ws.send(JSON.stringify({ tipe: "all order", dataa: pesanans }))
            // return true; gatau ini bisa nge end 'on' apa engga
        } else {
            pesanans.push(message)
            admins.forEach((a) => {
                a.send(JSON.stringify({ tipe: "notif pesanan baru", dataa: message }))
            })
        }
    })
});