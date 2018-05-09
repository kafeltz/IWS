// Refs
// https://tools.ietf.org/html/rfc6455
// https://html.spec.whatwg.org/multipage/web-sockets.html
const defaultConfig = {
    debug: false,
    url: undefined,
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

//  Esta classe abre apenas uma única conexão por vez WebSocket.
class IWS {
    constructor(config, WebSocketConstructor) {
        if (!WebSocket) {
            throw new Error('Your user agent has no support to WebSocket')
        }

        this.config = { ...defaultConfig, ...config }

        if (!this.config.url) {
            throw new Error('missing or invalid url in config')
        }

        this.WebSocketConstructor = WebSocketConstructor

        this.messages = []
        this.ws = null
        this.intervalId = -1

        // this.destroy significa que não pode mais tentar reconectar (recriar a instancia) nunca mais
        // hoje, esta classe vai tentar reconectar em qualquer erro que ocorreu (esse comportamento pode mudar no futuro)
        this.dead = false

        this.lastMessage = null

        if (!this.config.debug) {
            log = () => {}
            info = () => {}
            warn = () => {}
            error = () => {}
        }

        this.connect(this.WebSocketConstructor)
    }

    connect() {
        // verifica se já está conectado
        if (!this.ws) {
            this.ws = new this.WebSocketConstructor(this.config.url)
            this.ws.binaryType = 'blob'

            this.ws.addEventListener('close', this.handleWsOnClose.bind(this))
            this.ws.addEventListener('error', this.handleWsOnError.bind(this))
            this.ws.addEventListener('message', this.handleWsOnMessage.bind(this))
            this.ws.addEventListener('open', this.handleWsOnOpen.bind(this))
        }
    }

    disconnect() {
        clearInterval(this.intervalId)

        if (this.ws) {
            // readiciona a mensagem que foi tirada da fila
            if (this.lastMessage && this.ws.bufferedAmount > 0) {
                this.messages = [this.lastMessage, ...this.messages]
            }

            this.lastMessage = null

            this.ws.removeEventListener('close', this.handleWsOnClose)
            this.ws.removeEventListener('error', this.handleWsOnError)
            this.ws.removeEventListener('message', this.handleWsOnMessage)
            this.ws.removeEventListener('open', this.handleWsOnOpen)

            // close tem que ser chamado por último porque esse método limpa tudo da instancia do WebSocket
            // e daí não é possível fazer mais nenhum tratamento de erro
            this.ws.close()
            this.ws = null
        }
    }

    handleWsOnClose(e) {
        if (e.wasClean && e.code === 1000) {
            info('Connection closed successfuly by the server.')
        } else {
            error(`Connect abnormally closed: wasClean: [${e.wasClean}], code: [${e.code}].`)
        }

        this.disconnect()

        // try to reconnect after a period of time
        if (!this.dead) {
            setTimeout(() => {
                info('trying to reconnect...')
                this.connect()
            }, this.config.reconnectInterval)
        }
    }

    handleWsOnError() {
        log('handleWsOnError')
        this.disconnect()
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

                this.lastMessage = message

                this.ws.send(JSON.stringify(message))

                info('sending: ', message)
            }
        }, 15)
    }

    // external api
    send(keyValueObject) {
        this.messages.push(keyValueObject)
    }

    // external api
    destroy() {
        info('destroy')
        this.dead = true
        this.disconnect()
    }
}

export default IWS
