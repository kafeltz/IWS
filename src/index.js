// Refs
// https://tools.ietf.org/html/rfc6455
// https://html.spec.whatwg.org/multipage/web-sockets.html
const defaultConfig = {
    debug: false,
    reconnectInterval: 5 * 1000,
    onMessage: () => {},
}

let log = function() {
    console.log.apply(console, ['IWS:', ...arguments])
}

let info = function() {
    console.info.apply(console, ['IWS:', ...arguments])
}

let warn = function() {
    console.warn.apply(console, ['IWS:', ...arguments])
}

let error = function() {
    console.error.apply(console, ['IWS:', ...arguments])
}

//  Esta classe abre apenas uma única conexão WebSocket.
class IWS {
    constructor(config) {
        if (typeof WebSocket === 'undefined') {
            throw new Error('Your browser has no support to WebSocket')
        }

        this.messages = []
        this.config = { ...defaultConfig, ...config }
        this.ws = null
        this.intervalId = -1

        if (!this.config.debug) {
            log = () => {}
            info = () => {}
            warn = () => {}
            error = () => {}
        }

        this.connect()
    }

    connect() {
        // WebSocket pode lançar exceção que não é possível pegar pelo try/catch se o endpoint tiver algum problema.
        // Isso tá na especificação do WebSocket e parece ser por motivos de segurança

        // verifica se já está conectado
        if (!this.ws) {
            this.ws = new WebSocket(this.config.url)
            this.ws.binaryType = 'blob'

            this.ws.addEventListener('close', this.handleWsOnClose.bind(this))
            this.ws.addEventListener('error', this.handleWsOnError.bind(this))
            this.ws.addEventListener('message', this.handleWsOnMessage.bind(this))
            this.ws.addEventListener('open', this.handleWsOnOpen.bind(this))
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.removeEventListener('close', this.handleWsOnClose)
            this.ws.removeEventListener('error', this.handleWsOnError)
            this.ws.removeEventListener('message', this.handleWsOnMessage)
            this.ws.removeEventListener('open', this.handleWsOnOpen)
            this.ws.close()
            this.ws = null
            clearInterval(this.intervalId)
        }
    }

    handleWsOnClose(e) {
        if (e.wasClean && e.code === 1000) {
            info('Connection closed successfuly by the server.')
        } else {
            error(`Connect abnormally closed: wasClean: [${e.wasClean}], code: [${e.code}].`)
        }

        if (this.ws) {
            this.disconnect()
        } else {
            warn('WebSocket not created, possible network failure exception trying to stabilish a connection.')
        }

        // try to reconnect after 1 second
        setTimeout(() => {
            info('trying to reconnect...')
            this.connect()
        }, this.config.reconnectInterval)
    }

    handleWsOnError() {
        log('handleWsOnError')
    }

    handleWsOnMessage(e) {
        log('handleWsOnMessage', e.data)

        this.config.onMessage(e.data)
    }

    handleWsOnOpen() {
        log('connection success!')

        this.initAutomaticSender()
    }

    initAutomaticSender() {
        this.intervalId = setInterval(() => {
            if (this.ws.bufferedAmount === 0 && this.messages.length > 0) {
                const message = this.messages.splice(0, 1)[0]

                this.ws.send(JSON.stringify(message))

                info('sending: ', message)
            }
        }, 100)
    }

    send(keyValueObject) {
        if (typeof keyValueObject !== 'undefined' && Object.keys(keyValueObject).length > 0) {
            this.messages.push(keyValueObject)
        }
    }
}

export default IWS
