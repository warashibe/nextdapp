#!/usr/bin/env node

const command = process.argv[2]
const name = process.argv[3]
const namespace = process.argv[4]
const remove = require("../lib/remove").default
const add = require("../lib/add").default
switch (command) {
case "keys":
  const keys = require("../lib/generateKeys").default
  keys("./", name === "overwrite")
  break
  case "create":
    const create = require("../lib/create").default
    create(name)
  break
  case "refresh":
    const refresh = require("../lib/refresh").default
    refresh()
  break
  case "add":
    add(name,namespace)
    break
  case "remove":
    remove(name,namespace)
  break
  default:
    console.log("command not found")
}
