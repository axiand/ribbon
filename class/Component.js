class Component {
    constructor(name, resolver, binds) {
        this.name = name
        this.resolver = resolver
        this.binds = binds

        this.resolve = (reqBody, reqQuery) => {
            return this.resolver(reqBody, reqQuery)
        }

        return this
    }
}

module.exports.Component = Component;