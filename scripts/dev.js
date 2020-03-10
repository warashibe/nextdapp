const path = require("path")

const R = require("ramdam")

const fs = require("fs-extra")

exports.args = R.hasPath(["argv"], process) ? process.argv.slice(2) : []

exports.logit = (log, code = 0) => console.log(log) || process.exit(code)

const resolve = (...paths) => path.resolve(__dirname, ...paths)

exports.exists = (...paths) => fs.exists(resolve(...paths))

// exports
exports.R = R
exports.fs = fs
exports.resolve = resolve
