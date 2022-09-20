const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

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
            console.log("sepertinya sampe sini masih aman, cobe berapa.. " + randNumb)
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
                //wwbjs
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

//---

const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql');
const port = 8081;

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "kantinasqy"
})

var QRCode = require('qrcode');
const wwebjs = require('whatsapp-web.js');

const client = new wwebjs.Client({
    authStrategy: new wwebjs.LocalAuth({ clientId: "farhan" }),
    puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
});
var qrr = "null";
var sessionn = "null";
client.on('qr', qr => {
    QRCode.toDataURL(qr, function (err, url) {
        qrr = url;
    });
});

client.on('disconnected', () => {
    console.log("disconnected");
})

app.get('/init/', (req, res) => {
    client.initialize();
    res.send("oke")
})

app.get('/logout/', (req, res) => {
    client.logout().then(
        (done) => {
            res.send("oke");
        },
        (fail) => {
            res.send("gagal");
        }
    )
})

app.get('/update/', (req, res) => {
    var wstate = "";
    try {
        client.getState().then((ws) => {
            wstate = ws == null ? "null" : ws.toString()
            sendd()
        })
    } catch (error) {
        console.log(error)
        sendd()
    }
    function sendd() {
        res.set({ 'Content-Type': 'application/json; charset=utf-8' })
        res.send(JSON.stringify({
            qrcode: qrr,
            wastate: wstate,
            session: sessionn
        }));
    }
});

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`)
})

app.get('/admin_whatsapp', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

client.on('ready', () => {
    nowReady();

    //Kantin ASQY
    client.on('message', (msg) => {
        console.log(msg.body);
        const msgs = msg.body.split("\n")
        if (msgs[0] == "Jangan ubah isi chat ini") {
            const i = forLogin.randNumbs.findIndex((rn) => rn == msgs[1])
            if (i != -1) {
                console.log("kode benar")
                msg.getContact().then((c) => forLogin.conns[i].send(JSON.stringify({ status: "dapet", nowa: c.number})))
                forLogin.randNumbs.splice(i, 1);
                forLogin.conns.splice(i, 1);
                msg.reply("Kode yang anda masukkan benar, silahkan kembali ke Aplikasi/Web Kantin ASQY")
            } else {
                console.log("kode salah")
                msg.reply("Maaf kode yang anda masukkan salah atau sedang ada gangguan")
            }
        }
    })
})

client.initialize();