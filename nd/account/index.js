const account = require("./account")
import { default as init } from "./init"
import { mergeAll } from "ramda"
const Login = { Login: require("./Login") }
const UPort = { UPort: require("./UPort") }
const Profile = { Profile: require("./Profile") }
const LinkAccount = { LinkAccount: require("./LinkAccount") }
import { socials } from "./const"
module.exports = mergeAll([
  { socials: socials },
  init,
  account,
  Profile,
  LinkAccount,
  Login,
  UPort
])
