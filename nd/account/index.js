const account = require("./account")
import init from "./init"
import apiAlisOauth from "./api/alis-oauth"

module.exports = {
  apiAlisOauth,
  ...account,
  init
}
