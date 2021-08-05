const { plugin } = require("learnpack/plugin")

module.exports = plugin({
    language: "react",
    compile: require('./compile'),
    test: require('./test'),
})