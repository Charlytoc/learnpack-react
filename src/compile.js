const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { Utils, CompilationError } = require('learnpack/plugin');

const run = (compiler) => new Promise((res, rej) => compiler.run((err, stats) => {
  res({ err, stats });
}));

const clean = (path) => path.indexOf("./") === 0 ? path : "./" + path;

module.exports = {
  validate: () => true,
  run: async function ({ exercise, socket, configuration }) {

    let entryPath = exercise.files.map(f => './'+f.path).find(f => f.includes(exercise.entry || 'app.jsx'));
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
    webpackConfig.output.path = process.cwd() + '/' + configuration.outputPath;
    //the base directory for the preview, the bundle will be dropped here
    webpackConfig.output.publicPath = configuration.publicPath;

    // webpackConfig.entry = entryPath
    webpackConfig.entry = [
      clean(entryPath),
      // `webpack-dev-server/client?http://${configuration.address}:${configuration.port}`
    ];

    const compiler = webpack(webpackConfig);
    const result = {
      starting_at: Date.now(),
      source_code: "",
      exitCode: 0

    }
    const { err, stats } = await run(compiler);

    result.ended_at = Date.now()
    if (err) {
      result.stderr = err
      result.exitCode = 1
    };
    
    const output = stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    });

    result.stdout = Utils.cleanStdout(output)
    if(stats.hasErrors()) {
      result.stderr = output
      result.exitCode = 1
    };
    //open preview window on the front-end.
    socket.openWindow(`${configuration.publicUrl}/preview`)

    return result;

  },
}
