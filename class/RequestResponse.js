class RequestResponse {
    constructor() {
        this.headers = {'Content-Type': 'application/json'}
        this.body = null
        this.status = 200
        this.raw = false

        this.mime = (mime) => {
            //if type doesn't match the typical type/subtype format
            if(!mime.includes('/')) {
                throw new Error(`Mime type ${mime} does not match type/subtype format`)
            }

            if(mime != 'application/json') this.raw = true

            this.setHeader('Content-Type', mime)

            return this
        }

        this.getBody = () => {
            return this.body
        }
    
        this.raw = () => {
            this.raw = true
            return this
        }
    
        this.setHeader = (k, v) => {
            this.headers[k] = v
            return this
        }
    
        this.write = (data, mime) => {
            if(mime) {this.mime(mime)}
    
            this.body = data
            return this
        }

        return this
    }
}

module.exports.RequestResponse = RequestResponse;