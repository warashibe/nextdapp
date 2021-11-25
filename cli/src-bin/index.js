#!/usr/bin/env node

const [, , cmd, name, namespace] = process.argv
const { defaultTo, equals, T, cond, map } = require("ramda")

const cmds = [
  ["keys", ["./", name === "overwrite"], "generateKeys"],
  ["create", [name]],
  ["refresh"],
  ["add", [name, namespace]],
  ["remove", [name, namespace]],
]

cond([
  ...map(v => [
    equals(v[0]),
    () => require(`../lib/${v[2] || v[0]}`).default(...(v[1] || [])),
  ])(cmds),
  [T, () => console.log(`command not found: ${cmd}`)],
])(cmd)
