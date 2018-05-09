var path = require('path')
var app = require('express')()
var ws = require('express-ws')(app)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

var aWss = ws.getWss('/')

app.ws('/', (s, req) => {
    let pings = 0

    s.send('{"method":"welcome","data":{}}')

    // echo
    s.on('message', function(msg) {
        aWss.clients.forEach(function (client) {
            if (s.readyState === 1) {
                client.send(msg)
            }
        })
    })

    setInterval(() => {
        let ping = {
            method: 'ping',
            value: pings,
        }

        pings = pings + 1
        if (s.readyState === 1) {
            s.send(JSON.stringify(ping))
        }
    }, 5000)

    console.log('delay')
})

app.listen(3001)
