const { removeTrailingSlash } = require('../util/removeTrailingSlash.js')

class Route {
    constructor(method, path, resolver, props) {
        let pathProto = `${props.rootPath}${removeTrailingSlash(path)}`
        
        if(props.routesToCheck.some(rt => {return rt.pathProto == pathProto})) {throw new Error(`A route with path ${pathProto} already exists.`)}

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
                case('@'):
                    symbols.push({
                        'kind': 'Component',
                        'compo': node.split(" ")[0].slice(1),
                        'varName': node.split(" ")[1]
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

        if(props.routesToCheck.some(x => {return x.matcher.join() == matcher.join()})) {
            throw new Error(`A route with matcher ${matcher.join('/')} already exists. Try another structure, or make your routes less ambiguous.`)
        }

        this.method = method.toUpperCase()

        this.path = path
        this.pathProto = pathProto
        this.symbols = symbols
        this.matcher = matcher
        this.prio = prio
        this.resolver = resolver

        console.log(this)

        return this
    }
}

module.exports.Route = Route;