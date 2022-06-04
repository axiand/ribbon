class RequestContext {
    constructor(data) {
        //Get variables
        this.variables = {}

        for(let e=0;e<data.pathA.length;e++) {
            if(data.rt.symbols[e].kind == "Variable") {this.variables[data.rt.symbols[e].name] = data.pathA[e]}
        }

        //Parse the query string
        this.query = {}
        if(data.query) {
            let qsparts = data.query.split('&')
            for(let part of qsparts) {
                this.query[part.split('=')[0]] = part.split('=')[1]
            }
        }

        this.headers = data.req.headers
        return this
    }
}

module.exports.RequestContext = RequestContext;