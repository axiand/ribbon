// To start this example:
// [node || your_preferred_runtime] example_server.js

//Importing ribbon
const ribbon = require('./index.js').default

//Initiate our app with a root path of /api
const app = new ribbon(4000, true, {
    rootPath: '/api/'
})

// A basic route:
// YOUR_DOMAIN/api/helloworld
app.route('/helloworld/', () => {
    return {'message': 'Hello World!'}
})

// ex. /api/posts/4
// :postId is a variable - if you've ever used
// express.js or anything of the sort, you'll be
// familiar with the concept.
app.route('/posts/:postId', (ctx) => {
    return {
        'postId': ctx.variables.postId,
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, [...]',
        'author': 'John Doe'
    }
    //Notice how we use ctx.variables to get
    //the post ID from the request path.
    //
    //ctx contains every bit of info about
    //the request that you may want to use.
    //
    //Try performing a console.log() on ctx
    //to see what else it contains.
})

// ex. /api/echo?query=string
app.route('/echo', (ctx) => {
    return ctx.query
    //Here we simply return the query string
    //provided by the user back to them.
    //Ribbon handles all the heavy lifting
    //for you, and converts the query
    //string to a neat object: ctx.query
})

//TBC