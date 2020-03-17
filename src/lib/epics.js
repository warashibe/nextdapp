import R from "ramdam"
import conf from "../conf"

import { merge, track, tracker, set, epic } from "../../lib/_epic/util"

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
  removeAddress,
  switchWallet,
  changeAllowance
} from "../../lib/_epic/web3"

import {
  changeUniswapAllowance,
  uniswap_tokens,
  checkUniswap
} from "../../lib/_epic/uniswap"

import { getTokenPrices } from "../../lib/_epic/prices"

import { devStake, devCreateProperty, unlockDev } from "../../lib/_epic/dev"

export {
  devStake,
  unlockDev,
  devCreateProperty,
  getTokenPrices,
  changeAllowance,
  changeUniswapAllowance,
  switchWallet,
  uniswap_tokens,
  checkUniswap,
  check_alis,
  set,
  merge,
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
