const { removeTrailingSlash } = require('../util/removeTrailingSlash.js')

class Route {
    constructor(path, resolver, props) {
        let pathProto = `${props.rootPath}${removeTrailingSlash(path)}`

        if(props.routes.find(x => x.pathProto == pathProto)) throw new Error(`A route with path ${pathProto} already exists.`)

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

        this.path = path
        this.symbols = symbols
        this.matcher = matcher
        this.prio = prio
        this.resolver = resolver

        return this
    }
}

module.exports.Route = Route;