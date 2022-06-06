function removeTrailingSlash(string) {
    if(string) {
        return string.replace(/\/*$/g, '')
    } else {
        return null
    }
}

module.exports.removeTrailingSlash = removeTrailingSlash;