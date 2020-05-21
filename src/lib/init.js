import R from "ramdam"
import { init as util } from "nd-util"
import { init as user } from "../../lib/_epic/user"
import { init as web3 } from "../../lib/_epic/web3"
import { init as prices } from "../../lib/_epic/prices"
import { init as uniswap } from "../../lib/_epic/uniswap"
import { init as dev } from "../../lib/_epic/dev"
import { init as blog } from "../../lib/_epic/blog"

export default R.mergeAll([user, util, web3, uniswap, prices, dev, blog])
