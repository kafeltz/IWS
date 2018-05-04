var path = require('path')
var app = require('express')()
var ws = require('express-ws')(app)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

var aWss = ws.getWss('/')

app.ws('/', (s, req) => {
    s.send('Message from server!!!')

    s.on('message', function(msg) {
        aWss.clients.forEach(function (client) {
            client.send(msg)
        })
    })

    // setTimeout(() => {
    //     s.send('Self destruction!')
    //     s.close()
    // }, 3000)
})

app.listen(3001)
