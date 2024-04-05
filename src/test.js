const fs = require('fs')
const os = require('os')
const util = require('util')
const path = require('path')
const chalk = require("chalk")
const shell = require('shelljs')
const {execSync} = require('child_process')
const transformer = require.resolve('./utils/babelTransformer')
const { Utils, TestingError } = require('learnpack/plugin')

let nodeModulesPath = path.dirname(require.resolve('jest'))
nodeModulesPath = nodeModulesPath.substr(0, nodeModulesPath.indexOf("node_modules")) + "node_modules/"

const resultBuilder = {
  init: (sourceCode) => {
    this.starting_at = Date.now()
    this.source_code = sourceCode
  },
  finish: (code, stdout, stderr) => {
    this.ended_at = Date.now();
    this.exitCode = code
    this.stdout = stdout
    this.stderr = stderr

    return {
      starting_at: this.starting_at,
      ended_at: this.ended_at,
      source_code: this.source_code,
      exitCode: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr
    }
  }
}


module.exports = {
  validate: async function ({ exercise, configuration }) {
    
    if (!fs.existsSync(nodeModulesPath + '/prettier')) throw InternalError(`Uknown prettier path`);

    if (!shell.which('jest')) {
      const packageName = "jest@29.7.0";
      throw TestingError(`🚫 You need to have ${packageName} installed to run test the exercises, run $ npm i ${packageName} -g`);
    }

    return true
  },
  run: async ({ exercise, socket, configuration }) => {

    let jestConfig = {
      verbose: true,
      moduleDirectories: [nodeModulesPath],
      prettierPath: nodeModulesPath + '/prettier',
      transform: {
        "^.+.jsx?$": transformer,
      },
      testEnvironment: 'jsdom',
    }

    const getEntry = () => {

      let testsPath = exercise.files.map(f => f.path).find(f => f.includes('test.js') || f.includes('tests.js'));
      if (!fs.existsSync(testsPath)) throw TestingError(`🚫 No test script found on the exercise files`);

      return testsPath;
    }

    const getCommands = async function () {
      const reportedPath = path.resolve(__dirname, './utils/reporter.js')
      if (!fs.existsSync(reportedPath)) throw TestingError(`🚫 Custom Jest Reporter not found for at ${reportedPath}`);

      jestConfig.reporters = [[reportedPath, { reportPath: path.resolve(`${configuration.dirPath}/reports/${exercise.slug}.json`)}]];
      jestConfig.testRegex = getEntry()
      let jestCommand = `jest --config='${JSON.stringify(jestConfig)}' --colors`
      const isWindows = process.platform === 'win32'

      if (isWindows) {
        jestConfig.testRegex = getEntry().replace('/', '\\')
        jestCommand = `jest --config="${JSON.stringify(jestConfig).replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\"')}" --colors`;
      }

      return jestCommand
    }

    const getStdout = (rawStdout) => {
      let _stdout = [];
      if (fs.existsSync(`${configuration.dirPath}/reports/${exercise.slug}.json`)) {
        const _text = fs.readFileSync(`${configuration.dirPath}/reports/${exercise.slug}.json`);
        const errors = JSON.parse(_text);

        _stdout = errors.testResults.map(r => r.message);

        if (errors.failed.length > 0) {
          msg = `\n\n   ${'Your code must to comply with the following tests:'.red} \n\n${[...new Set(errors.failed)].map((e, i) => `     ${e.status !== 'failed' ? chalk.green.bold('✓ (done)') : chalk.red.bold('x (fail)')} ${i}. ${chalk.white(e.title)}`).join('\n')} \n\n`;
          _stdout.push(msg);
        }
      }
      else {
        return [rawStdout, "Could not find the error report for " + exercise.slug]
      }
      return _stdout
    }

    let commands = await getCommands()

    resultBuilder.init("")

    if (!Array.isArray(commands)) commands = [commands]
    let stdout, stderr, code = [null, null, null]
    for (let cycle = 0; cycle < commands.length; cycle++) {
      let resp = shell.exec(commands[cycle], { silent: true })
      stdout = resp.stdout
      code = resp.code
      stderr = resp.stderr
      if (code != 0) break
    }

    let result = resultBuilder.finish(code, stdout, stderr)

    if (code != 0) {
      result.stderr = getStdout(stdout || stderr).join()
    }
    else {
      result.stdout = chalk.green("✅ All tests passed!")
    }
    return result
  }
}