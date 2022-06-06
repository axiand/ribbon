const http = require('http')
const HEADER = {'Content-Type': 'application/json'}
const { RequestContext } = require('./class/RequestContext.js')

function removeTrailingSlash(string) {
    if(string) {
        return string.replace(/\/*$/g, '')
    } else {
        return null
    }
}

function testRoute(rt, pathA) {
    for(let i=0;i<rt.matcher.length;i++) {
        //console.log(rt.matcher[i], pathA[i], rt.matcher[i] == pathA[i] || rt.matcher[i] == '*')
        switch(rt.matcher[i] == pathA[i] || rt.matcher[i] == '*') {
            case(true):
                continue;
            case(false):
                return false;
            default:
                continue;
        }
    }
    return true;
}

function testCandidateRoutes(rts, pathA) {
    for(let rt of rts) {
        if(testRoute(rt, pathA) == true) return rt;
    }
    return false
}

class Ribbon {
    constructor(port, debug = false, options = {}) {
        //init options
        this.options = options
        this.options.rootPath = removeTrailingSlash(this.options.rootPath)

        //replace the root path with a dummy if none was set
        //kinda hacky but itll have to do
        if(!this.options.rootPath) {
            this.options.rootPath = ''
        }
        
        this.routes = []
        this.server = http.createServer((req, res) => {
            if(!req.url.startsWith(this.options.rootPath)) {
                res.writeHead(404, HEADER)

                res.end()
                return
            }

            //find an applicable route
            let path = removeTrailingSlash(req.url).slice(this.options.rootPath.length).split('?')[0]
            let qs = removeTrailingSlash(req.url).slice(this.options.rootPath.length).split('?')[1]
            let pathA = path.split('/').slice(1)

            //fina candidates with:
            // - matcher length equal to path array length, and
            // - first matcher element equal to first path array element or *
            let rts = this.routes.filter(x => x.matcher.length == pathA.length).filter(x => x.matcher[0] == pathA[0] || x.matcher[0] == '*')
            

            //sort candidates by priority - amount of wildcards
            rts = rts.sort((a, b) => a.prio - b.prio)
            let rt = testCandidateRoutes(rts, pathA)

             if(!rt) {
                 res.writeHead(404, HEADER)

                 res.end()
                 return
            }

            //pass on the variables
            let ctx = new RequestContext({
                'rt': rt,
                'pathA': pathA,
                'query': qs,
                'req': req
            })
            
            let resp = null

            try {
                resp = rt.resolver(ctx)
            } catch(e) {
                res.writeHead(500, HEADER)

                res.write('500 Internal Server Error')

                res.end()

                console.log(e)
                return;
            }

            res.writeHead(200, HEADER)

            res.write(JSON.stringify(resp))

            res.end()
        })

        this.server.listen(port)
    }

    route(path, resolver) {
        let pathProto = `${this.options.rootPath}${removeTrailingSlash(path)}`

        if(this.routes.find(x => x.pathProto == pathProto)) throw new Error(`A route with path ${pathProto} already exists.`)

        let symbols = []
        let matcher = []
        let prio = 0

        for(let node of removeTrailingSlash(path).split('/').slice(1)) {
            switch(node[0]) {
                case(':'):
                    symbols.push({
                        'kind': 'Variable',
                        'name': node.slice(1)
                    })
                    matcher.push('*')
                    prio++
                    continue;
                default:
                    symbols.push({
                        'kind': 'Symbol',
                        'value': node
                    })
                    matcher.push(node)
            }
        }

        this.routes.push(
            {
                'prio': prio,
                'matcher': matcher,
                'symbols': symbols,
                'pathProto': pathProto,
                'resolver': resolver
            }
        )
    }
}

module.exports.default = Ribbon