import { ofType } from "redux-observable"
import R from "ramdam"
import conf from "../conf"
import { track, tracker, set, epic } from "../../lib/_epic/util"
import {
  login,
  changeUser,
  logout,
  deleteAccount,
  linkAccount,
  unlinkAccount,
  check_alis
} from "../../lib/_epic/user"
import { hookVeChain } from "../../lib/_epic/vechain"

import {
  connectAuthereum,
  disconnectAuthereum,
  hookWeb3,
  setWallet,
  removeAddress
} from "../../lib/_epic/web3"

export {
  check_alis,
  set,
  changeUser,
  deleteAccount,
  linkAccount,
  unlinkAccount,
  logout,
  login,
  track,
  tracker,
  hookWeb3,
  removeAddress,
  setWallet,
  hookVeChain,
  connectAuthereum,
  disconnectAuthereum
}
