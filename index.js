const http = require('http')
const { RequestContext } = require('./class/RequestContext.js');
const { RequestResponse } = require('./class/RequestResponse.js');
const { Route } = require('./class/Route.js');
const { removeTrailingSlash } = require('./util/removeTrailingSlash.js')

const HEADER = {'Content-Type': 'application/json'}
const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY']

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
        this.server = http.createServer(async (req, res) => {
            if(!req.url.startsWith(this.options.rootPath)) {
                res.writeHead(404, HEADER)

                res.end()
                return
            }

            //find an applicable route
            let path = removeTrailingSlash(req.url).slice(this.options.rootPath.length).split('?')[0]
            let qs = removeTrailingSlash(req.url).slice(this.options.rootPath.length).split('?')[1]
            let pathA = path.split('/').slice(1)

            //find candidates with:
            // - matcher length equal to path array length, and
            // - first matcher element equal to first path array element or *, and
            let rts = this.routes
            .filter(x => x.matcher.length == pathA.length)
            .filter(x => x.matcher[0] == pathA[0] || x.matcher[0] == '*')
            

            //sort candidates by priority - amount of wildcards
            rts = rts.sort((a, b) => a.prio - b.prio)
            let rt = testCandidateRoutes(rts, pathA)

            if(!rt) {
                 res.writeHead(404, {})

                 res.end()
                 return
            }

            if(req.method != rt.method && rt.method != 'ANY') {
                res.writeHead(405, {'Allow': rt.method.toUpperCase()})

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
                resp = rt.resolver(ctx, new RequestResponse())
            } catch(e) {
                res.writeHead(500, {})

                res.write('500 Internal Server Error')

                res.end()

                console.log(e)
                return;
            }

            //If the response wasn't a standard RequestResponse for some reason, we'll have to fill in some data
            if(resp.constructor.name != 'RequestResponse') {
                resp = {
                    'headers': {'Content-Type': 'application/octet-stream'},
                    'raw': true,
                    'status': 200,
                    'body': resp
                }
            }

            res.writeHead(resp.status, resp.headers)

            res.write(resp.raw ? JSON.stringify(resp.body) : resp.body)

            res.end()
        })

        this.server.listen(port)
    }

    route(method, path, resolver) {
        if(!METHODS.includes(method.toUpperCase())) {
            throw new Error(`Invalid method ${method}`)
        }

        let rt = new Route(method, path, resolver, {
            'rootPath': this.options.rootPath,
            'routesToCheck': this.routes.filter(rt => rt.method == method.toUpperCase() || rt.method == 'ANY')
        })

        this.routes.push(rt)

        return rt
    }
}

module.exports.default = Ribbon