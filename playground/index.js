// import IWS from '../src/index'

// const config = {
//     // url: 'ws://52.15.180.35:8888/rtc',
//     url: 'ws://localhost:3001/',
//     debug: true,
// }

// const iws = new IWS(config)

// window.iws = iws

// console.log('iws: ', iws)

import WsApi from '../src/api'

const config = {
    url: 'ws://localhost:3001/',
    // url: 'ws://52.15.180.35:8888/rtc',
    debug: true,
}

const api = new WsApi(config)

api.listenTalkEvents(data => {
    console.log('Eu bobão tenho interesse em ouvir!', data)
})

api.listenTalkEvents(data => {
    console.log('Também tenho interesse em ouvir!', data)
})
