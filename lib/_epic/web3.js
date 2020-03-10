import { ofType } from "redux-observable"
import R from "ramdam"
import conf from "../../src/conf"
import { set, fb, epic } from "./util"
import Web3 from "web3"
import shortid from "shortid"
import { tap, switchMap, ignoreElements } from "rxjs/operators"

const network = conf.web3.network
const abi_erc20 = require("../abi/IERC20.json").abi
let authereum = null
import { ethereum_networks } from "../const"

const setETH = async ({ set }) => {
  let eth_selected = null
  if (R.isNotNil(window.web3.currentProvider)) {
    const current_network =
      window.web3.currentProvider.networkVersion ||
      window.web3.currentProvider._network
    if (current_network === network) {
      eth_selected =
        window.web3.currentProvider.selectedAddress ||
        window.web3.currentProvider._selectedAddress
    }
  }
  set(eth_selected, "eth_selected")
  set(Date.now(), "eth_updated")
}

export const checkWallet = async ({ set, state$ }) => {
  const wallets = R.isNil(state$.value.user)
    ? []
    : await fb().fsdb.get("wallet", ["uid", "==", state$.value.user.uid])
  set(wallets, "user_addresses")
}

export const checkBalance = async ({ set, state$, val }) => {
  if (R.isNil(state$.value.eth_selected)) {
    set({}, "user_balances")
  } else {
    const tokens = R.concat([{ key: "ETH" }], val.balances || [])
    const prs = R.compose(
      R.map(v => {
        if (v.key === "ETH") {
          return web3.eth.getBalance(state$.value.eth_selected)
        } else {
          const erc20_contract = new web3.eth.Contract(abi_erc20, v.addr)
          return erc20_contract.methods
            .balanceOf(state$.value.eth_selected)
            .call()
        }
      })
    )(tokens)
    let user_balances = R.compose(
      R.reduce((acc, v) => {
        acc[v[0]] = { balance: v[1] }
        return acc
      }, {}),
      R.zip(R.pluck("key")(tokens)),
      R.map(web3.utils.fromWei)
    )(await Promise.all(prs))
    if (R.isNotNil(val.allowance)) {
      const prs_allowance = R.compose(
        R.map(v => {
          const erc20_contract = new web3.eth.Contract(abi_erc20, v.addr)
          return erc20_contract.methods
            .allowance(state$.value.eth_selected, val.allowance)
            .call()
        })
      )(val.balances)
      const user_allowances = R.compose(
        R.reduce((acc, v) => {
          acc[v[0]] = { allowance: v[1] }
          return acc
        }, {}),
        R.zip(R.pluck("key")(val.balances)),
        R.map(web3.utils.fromWei)
      )(await Promise.all(prs_allowance))
      user_balances = R.mergeDeepLeft(user_balances, user_allowances)
    }
    set(user_balances, "user_balances")
  }
}

const hookAuthereum = async ({ set }) => {
  const Authereum = require("authereum").Authereum
  authereum = new Authereum({
    networkName: ethereum_networks[conf.web3.network]
  })

  const provider = authereum.getProvider()
  window.web3_authereum = new Web3(provider)
  const auth_selected = await authereum.getAccountAddress()
  set(auth_selected, "auth_selected")
  set(authereum, "authereum")
}

export const connectAuthereum = epic(
  "connectAuthereum",
  async ({ type, val: { user }, dispatch, extra, state$, set }) => {
    const provider = state$.value.authereum.getProvider()
    await provider.enable()
    const address = await state$.value.authereum.getAccountAddress()
    set(address, "auth_selected")
  }
)

export const disconnectAuthereum = epic(
  "disconnectAuthereum",
  async ({ type, val: { user }, dispatch, extra, state$, set }) => {
    const provider = state$.value.authereum.getProvider()
    await provider.disable()
    const address = await state$.value.authereum.getAccountAddress()
    set(null, "auth_selected")
  }
)

export const hookWeb3 = epic(
  "hookWeb3",
  async ({ type, val: { balances }, dispatch, extra, state$, set }) => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      try {
        await ethereum.enable()
      } catch (error) {
        console.log("access denied")
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      )
    }
    if (window.web3 != undefined) {
      hookAuthereum({ set })
      setETH({ set })
      window.web3.currentProvider.publicConfigStore.on("update", c => {
        setETH({ set })
      })
    }
  }
)

async function sign(text, address, isAuthereum = false) {
  if (isAuthereum) {
    if (R.isNil(await authereum.signMessageWithSigningKey("link address"))) {
      throw Error
    } else {
      return true
    }
  } else if (web3.eth.personal == undefined && web3.personal != undefined) {
    return new Promise((ret, rej) => {
      web3.personal.sign(text, address, (a, b) => {
        if (a != null) {
          rej(a)
        } else {
          ret(b)
        }
      })
    })
  } else {
    return await web3.eth.personal.sign(text, address)
  }
}

export const setWallet = epic(
  "setWallet",
  async ({ set, val: { plus = false, address, uid, isAuthereum = false } }) => {
    let rejected = false
    if (plus) {
      let exists = await fb().fsdb.get("wallet", address)
      if (exists != undefined) {
        alert("そのアドレスは既に他のユーザーに使われています。")
        return
      } else {
        try {
          await sign("アドレス追加", address, isAuthereum)
        } catch (e) {
          console.log(e)
          rejected = true
          alert("認証が拒否されました。")
        }
      }
    }
    if (rejected) {
      return
    }
    let wallets = await fb().fsdb.get("wallet", ["uid", "==", uid])
    let ex = false
    let exmain = false
    for (let w of wallets) {
      if (w.main) {
        exmain = true
      }
      if (w.address === address && plus === false) {
        ex = true
        w.main = true
      } else if (w.main && plus === false) {
        w.main = false
        await fb().fsdb.update({ main: false }, "wallet", w.address)
      }
    }
    let neww = {
      uid: uid,
      address: address,
      main: true,
      authereum: isAuthereum
    }
    if (plus && exmain === true) {
      neww.main = false
    }
    await fb().fsdb.upsert(neww, "wallet", address)
    if (!ex) {
      wallets.unshift(neww)
    }
    set(wallets, "user_addresses")
  }
)

export const removeAddress = epic(
  "removeAddress",
  async ({ val: { address, uid }, set }) => {
    if (confirm("連携アドレスをはずしてよろしいでしょうか？")) {
      let wallets = await fb().fsdb.get("wallet", ["uid", "==", uid])
      let ex = false
      let wallets2 = []
      for (let w of wallets) {
        if (address.main && w.address !== address.address && ex === false) {
          ex = true
          w.main = true
          await fb().fsdb.update({ main: true }, "wallet", w.address)
        }
        if (w.address !== address.address) {
          wallets2.push(w)
        }
      }
      await fb().fsdb.delete("wallet", address.address)
      set(wallets2, "user_addresses")
    }
  }
)

export const init = {
  eth_selected: null,
  auth_selected: null,
  eth_balance: 0,
  user_addresses: [],
  user_balances: {},
  eth_updated: null
}
