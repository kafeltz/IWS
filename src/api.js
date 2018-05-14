import IWS from './index'

const defaultConfig = {
    debug: false,
    channel: undefined,
    email: '', // opcional: pra fins de log do server-side
}

let info = function() {
    console.info.apply(console, ['WsApi: ', ...arguments])
}

import PubSub from 'pubsub-js'

// methods
const TALK_STREAM_STARTED = 'talk.stream_started'
const TALK_START_TIME_CHANGED = 'talk.start_time_changed'
const TALK_VOD_PUBLISHED = 'talk.vod_published'

const ON_MESSAGE_ERROR = 'ON_MESSAGE_ERROR'

// in: {"method":"talk.stream_started","data":{"state":"live"}}
// in: {"method":"talk.vod_published","data":{"state":"live"}}

// out: {"method":"subscribe","data":{"channel":"random_string","email":"random@email.com"}}
// in: {"method":"connected","data":{"id":"4fc0dc43460c485fbfb471b53d301998"}}

class evWebSocketAPI {
    constructor(config, WebSocketConstructor) {
        const callback = {
            onMessage: data => this.handleOnMessage(data),
            onOpen: () => this.subscribeChannel(),
        }

        this.config = { ...defaultConfig, ...callback, ...config }

        if (this.config.channel === undefined) {
            throw new Error('config.channel is undefined')
        }

        this.iws = new IWS(this.config, WebSocketConstructor)
    }

    subscribeChannel() {
        const obj = {
            method: 'subscribe',
            data: {
                channel: this.config.channel,
                email: this.config.email,
            },
        }

        this.iws.sendFirst(obj)
    }

    handleOnMessage(payload) {
        info('handleOnMessage: ', payload)

        try {
            const json = JSON.parse(payload)
            const method = json.method
            const data = json.data

            switch(method) {
                case TALK_STREAM_STARTED:
                    PubSub.publish(TALK_STREAM_STARTED, data)
                    break
                case TALK_START_TIME_CHANGED:
                    PubSub.publish(TALK_START_TIME_CHANGED, data)
                    break
                case TALK_VOD_PUBLISHED:
                    PubSub.publish(TALK_VOD_PUBLISHED, data)
                    break
                default:
                    break
            }
        } catch(e) {
            PubSub.publish(ON_MESSAGE_ERROR, e)
        }
    }

    // external api
    onTalkStreamStarted(fn) {
        PubSub.subscribe(TALK_STREAM_STARTED, fn)
    }

    // external api
    onTalkStartTimeChanged(fn) {
        PubSub.subscribe(TALK_START_TIME_CHANGED, fn)
    }

    // external api
    onTalkVodPublished(fn) {
        PubSub.subscribe(TALK_VOD_PUBLISHED, fn)
    }

    // external api
    onError(fn) {
        PubSub.subscribe(ON_MESSAGE_ERROR, fn)
    }

    // external api
    destroy() {
        info('destroy')
        PubSub.clearAllSubscriptions()
        this.iws.destroy()
        this.iws = null
    }
}

export default evWebSocketAPI
