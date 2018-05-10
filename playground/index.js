import WsApi from '../src/api'

const config = {
    // url: 'wss://www.eventials.com/websocket/',
    // url: 'ws://localhost:3001/',
    // url: 'ws://52.15.180.35:8888/rtc',
    url: 'wss://websocket-stg.eventials.com:8884/rtc',
    debug: true,
    channel: 'fhosdtj3ij3wkdij',
    email: 'random@email.com',
}

const client = document.location.search

try {
    const api = new WsApi(config, window.WebSocket)

    api.iws.send({
        'method': 'talk.start_time_changed',
        'data': {
        },
    })

    api.iws.send({
        'method': 'talk.vod_published',
        'data': {
        },
    })

    api.iws.send({
        'method': 'talk.updates.state_changed',
        'data': {
            'state': 'live',
        },
    })

    api.iws.send({
        random: 'random',
        abc: 'abc',
    })

    var i = 0

    let intervalId = setInterval(() => {
        api.iws.send({
            send: i,
            client: client,
        })
        i = i + 1
    }, 4000)

    api.onTalkStateChanged((msg, data) => {
        console.warn('api.onTalkStateChanged', msg, data)
    })

    api.onTalkStartTimeChanged((msg, data) => {
        console.warn('api.onTalkStartTimeChanged', msg, data)
    })

    api.onTalkVodPublished((msg, data) => {
        console.warn('api.onTalkVodPublished', msg, data)
    })

    api.onError((msg, data) => {
        console.error('api.onError', msg, data)
    })

    setTimeout(() => {
        console.warn('!!!!!!!!!!!!!!!! SHUTDOWN !!!!!!!!!!!!!!!!')
        clearInterval(intervalId)
        api.destroy()
    }, 30 * 1000)
} catch(e) {
    console.error('um erro grave ocorreu!', e)
}
