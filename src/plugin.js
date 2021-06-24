const { plugin } = require("./utils/index")

module.exports = plugin({
    language: "react",
    compile: require('./compile'),
    test: require('./test'),
})