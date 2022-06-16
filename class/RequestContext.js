class RequestContext {
    constructor(data) {
        //Parse the query string
        this.query = {}
        if(data.query) {
            let qsparts = data.query.split('&')
            for(let part of qsparts) {
                this.query[part.split('=')[0]] = part.split('=')[1]
            }
        }


        //Get variables
        this.variables = {}

        for(let e=0;e<data.pathA.length;e++) {
            switch(data.rt.symbols[e].kind ) {
                case('Variable'):
                    this.variables[data.rt.symbols[e].name] = data.pathA[e]
                    continue
                case('Component'):
                    let comp = data.compos.find(x => x.name == data.rt.symbols[e].compo)
                    if(!comp) throw new Error(`Component ${data.rt.symbols[e].compo} does not exist`)

                    let compBody = comp.resolve(data.req.body, this.query)
                    this.variables[data.rt.symbols[e].varName] = compBody
                    continue;
                default:
                    continue;
            }
        }

       

        this.headers = data.req.headers
        return this
    }
}

module.exports.RequestContext = RequestContext;