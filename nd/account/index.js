const account = require("./account")
import { default as init } from "./init"
import { mergeAll } from "ramda"
module.exports = mergeAll([init, account])
