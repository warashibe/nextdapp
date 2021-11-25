#!/usr/bin/env node
const path = require("path")
const argv = require("minimist")(process.argv.slice(2))
const [cmd, name, namespace] = argv._
const { or, defaultTo, equals, T, cond, map } = require("ramda")

const cmds = [
  ["keys", ["./", name === "overwrite"], "generateKeys"],
  ["create", [name, argv.template || argv.t]],
  ["refresh"],
  ["add", [name, namespace]],
  ["remove", [name, namespace]],
]

cond([
  ...map(v => [
    equals(v[0]),
    () => require(`../lib/${v[2] || v[0]}`).default(...(v[1] || [])),
  ])(cmds),
  [T, () => or(argv.v,argv.version) ? console.log((require(path.resolve(__dirname, "../package.json"))).version): console.log(`command not found: ${cmd}`)],
])(cmd)
