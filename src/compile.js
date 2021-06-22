const fs = require('fs');
const path = require('path');
const { node } = require('compile-run');
const { Utils, CompilationError } = require('./utils/index.js');

module.exports = {
  validate: () => true,
  run: async function ({ exercise, socket }) {

    let entryPath = exercise.entry || exercise.files.map(f => './'+f.path).find(f => f.indexOf('app.js') > -1);
    if(!entryPath) throw new Error("No entry file, maybe you need to create an app.js file on the exercise folder?");

    /**
     * LOAD WEBPACK
     */
    const webpackConfigPath = path.resolve(__dirname,`./webpack.config.js`);
    if (!fs.existsSync(webpackConfigPath)) throw CompilationError(`Uknown react.js config for webpack`)

    /**
     * COMPILATION WITH WEBPACK
     */
    let webpackConfig = require(webpackConfigPath)(exercise.files);
    webpackConfig.stats = {
      cached: false,
      cachedAssets: false,
      chunks: false,
      modules: false
    };
    // the url were webpack will publish the preview
    webpackConfig.devServer.contentBase = config.configPath.output;
    webpackConfig.output.path = process.cwd() + '/' + config.configPath.output;
    //the base directory for the preview, the bundle will be dropped here
    webpackConfig.output.publicPath = config.publicPath;

    const compiler = webpack(webpackConfig);
    const { err, stats } = await run(compiler);

    if (err) throw CompilerError(err);

    const output = stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
    });
    if(stats.hasErrors()) throw CompilerError(output);
    return Utils.cleanStdout(output);

  },
}
