const path = require("path")
import { apiSteemOauth } from "@nextdapp/account"
import conf from "nd/conf"
export default apiSteemOauth({ conf: conf })