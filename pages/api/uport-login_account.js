const path = require("path")
import { apiUportLogin } from "@nextdapp/account"
import conf from "nd/conf"
export default apiUportLogin({ conf: conf })