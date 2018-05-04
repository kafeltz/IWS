import IWS from './index'

const defaultConfig = {
    debug: false,
}

let log = function() {
    console.log.apply(console, ['WsApi: ', ...arguments])
}

let info = function() {
    console.info.apply(console, ['WsApi: ', ...arguments])
}

let warn = function() {
    console.warn.apply(console, ['WsApi: ', ...arguments])
}

let error = function() {
    console.error.apply(console, ['WsApi: ', ...arguments])
}

import PubSub from 'pubsub-js'

class WsApi {
    constructor(config) {
        const callback = {
            onMessage: data => this.handleOnMessage(data),
        }

        this.config = { ...defaultConfig, ...callback, ...config }

        this.iws = new IWS(this.config)
    }

    handleOnMessage(data) {
        info('handleOnMessage: ', data)

        try {
            const json = JSON.parse(data)
            const method = json.method
            const params = json.data

            if (method === 'talk.event') {
                PubSub.publish('talk.event', params)
            }


        } catch(e) {
            error(e)
        }
    }

    listenTalkEvents(fn) {
        PubSub.subscribe('talk.event', fn)
        // { "method": "talk.event", "data": "state_changed" }
        // start_time_changed
        // state_changed
        // vod_published
    }
}

export default WsApi
