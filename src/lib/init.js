import R from "ramdam"
import { init as user } from "../../lib/_epic/user"
import { init as util } from "../../lib/_epic/util"
import { init as web3 } from "../../lib/_epic/web3"
import { init as prices } from "../../lib/_epic/prices"
import { init as vechain } from "../../lib/_epic/vechain"
import { init as uniswap } from "../../lib/_epic/uniswap"

export default R.mergeAll([user, util, web3, vechain, uniswap, prices])
