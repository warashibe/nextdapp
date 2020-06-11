const path = require("path")
import { apiAlisOauth } from "@nextdapp/account"
import conf from "nd/conf"
export default apiAlisOauth({ conf: conf })