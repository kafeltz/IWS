import WsApi from '../api'
import IWS from '../index'

describe('WsApi Test', () => {
    const WebSocket = require('ws')

    test('default init', () => {
        const config = {
            url: 'ws://localhost:3001/',
            debug: true,
            channel: 'random_hash',
            email: 'random@email.com',
        }

        const api = new WsApi(config)

        expect(api).toBeDefined()
    })

    test('url is mandatory', () => {
        const config = {
            channel: 'random_hash',
            email: 'random@email.com',
        }

        expect(() => {
            new WsApi(config, WebSocket)
        }).toThrow('missing or invalid url in config')
    })

    test('channel is mandatory', () => {
        const WebSocket = require('ws')

        const config = {
            url: 'ws://xxx.com',
            email: 'random@email.com',
        }

        expect(() => {
            new WsApi(config, WebSocket)
        }).toThrow('config.channel is undefined')
    })
})

describe('IWS', () => {
    const necessaryParam = {
        url: 'ws://test.com',
    }

    const WebSocket = require('ws')

    test('default init', () => {
        expect(new IWS(necessaryParam, WebSocket)).toBeDefined()
    })

    test('must throw exception if WebSocket library is not avaible', () => {
        expect(() => {
            new IWS(necessaryParam, null)
        }).toThrow('Your user agent has no support to WebSocket')
    })

    test('must throw exception if url is not defined in config', () => {
        expect(() => {
            new IWS({}, WebSocket)
        }).toThrow('missing or invalid url in config')
    })

    test('should redirect the request payload to the websocket client', () => {
        jest.useFakeTimers()

        const iws = new IWS(necessaryParam, FakeWebSocket)

        iws.send({ method: 'test' })

        jest.runOnlyPendingTimers()

        expect(iws.ws.result).toBe(JSON.stringify({ method: 'test' }))
    })
})

class FakeWebSocket {
    constructor() {
        this.result = null
        this.bufferedAmount = 0
    }

    send(objKeyValue) {
        this.result = objKeyValue
    }

    addEventListener(event, fn) {
        if (event === 'open') {
            fn()
        }
    }
}
