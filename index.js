const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
require('./wa_ekspress');

/**
 * @type {WebSocket.WebSocket[]}
 */
var admins = []

var pesanans = []

var forLogin = {
    randNumbs: [],
    /**@type {WebSocket.WebSocket[]} */
    conns: []
}

var isReady = false;
var wasNotReady = {
    /**@type {WebSocket.WebSocket[]} */
    conns: [],
    msgs: []
}

function nowReady() {
    isReady = true;
    wasNotReady.conns.forEach((c, i) => c.send(wasNotReady.msgs[i]))
    wasNotReady.conns = []
    wasNotReady.msgs = []
}

wss.on('connection', (ws) => {
    ws.on('message', (messageAsString) => {
        console.log("ada yang konek")
        if (messageAsString == "reqLogin") {
            var randNumb = Math.round(Math.random() * (10 ** 6))
            console.log("sepertinya sampe sini masih aman, cobe berapa.. "+randNumb)
            while (forLogin.randNumbs.find((rn) => rn == randNumb)) {
                randNumb = Math.round(Math.random() * (10 ** 6))
            }
            forLogin.randNumbs.push(randNumb)
            forLogin.conns.push(ws)
            if (isReady) {
                ws.send(JSON.stringify({ status: "konek", kode: randNumb }))
            } else {
                wasNotReady.conns.push(ws)
                wasNotReady.msgs.push(JSON.stringify({ status: "konek", kode: randNumb }))
            }
            return null;
        }
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
                a.send(JSON.stringify({ tipe: "notif pesanan baru", dataa: [message] }))
            })
        }

    })
});

wss.on('close', (ws) => {
    const i = forLogin.conns.findIndex((conn) => conn == ws);
    if (i != -1) {
        forLogin.randNumbs.splice(i, 1);
        forLogin.conns.splice(i, 1);
    }
})

//----------------------------------------------------------

client.initialize();