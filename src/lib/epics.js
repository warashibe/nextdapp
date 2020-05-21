import R from "ramdam"
import conf from "../conf"

import { merge, checkHeight, getURL } from "../../lib/_epic/util"

import {
  login,
  changeUser,
  logout,
  deleteAccount,
  linkAccount,
  unlinkAccount,
  check_alis
} from "../../lib/_epic/user"

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

import {
  devCancel,
  devStake,
  devCreateProperty,
  unlockDev,
  devWithdrawInterest,
  devWithdraw
} from "../../lib/_epic/dev"

import {
  blogLoadArticle,
  blogLoadDir,
  createArticle,
  createArticleList,
  createArticleListFB,
  postBlog,
  blogLoadHistory,
  blogSwitchAccess,
  blogDeleteArticle,
  blogPreviewArticle,
  blogSwitchModes,
  blogChangeListTitle,
  blogChangeListTitleFB,
  blogDeleteList,
  connect_to_3box_public,
  getMyArticles,
  createBlankArticle,
  loadPostedArticle,
  deleteFromWarashibe,
  postToWarashibe,
  getArticle
} from "../../lib/_epic/blog"

export {
  blogChangeListTitleFB,
  createArticleListFB,
  loadPostedArticle,
  deleteFromWarashibe,
  postToWarashibe,
  getArticle,
  createBlankArticle,
  getMyArticles,
  blogDeleteList,
  blogChangeListTitle,
  blogDeleteArticle,
  blogSwitchModes,
  blogSwitchAccess,
  blogLoadArticle,
  blogLoadDir,
  createArticle,
  createArticleList,
  blogLoadHistory,
  postBlog,
  devWithdrawInterest,
  devWithdraw,
  devCancel,
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
  merge,
  changeUser,
  deleteAccount,
  linkAccount,
  unlinkAccount,
  logout,
  login,
  hookWeb3,
  removeAddress,
  setWallet,
  connectAuthereum,
  disconnectAuthereum,
  checkHeight,
  connect_to_3box_public,
  getURL
}
