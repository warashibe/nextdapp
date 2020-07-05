import {
  o,
  mergeRight,
  mergeLeft,
  pick,
  hasPath,
  is,
  complement,
  isNil,
  concat,
  compose,
  map,
  reduce,
  zip,
  pluck,
  mergeDeepLeft
} from "ramda"

import { xNil } from "nd/util"

import Web3 from "web3"

const abi_erc20 = require("./IERC20.json")

export const ETHEREUM_NETWORKS = {
  "1": "mainnet",
  "3": "ropsten",
  "4": "rinkby",
  "42": "kovan"
}

export const isAddress = address => window.web3.utils.isAddress(address)

export const toWei = amount => window.web3.utils.toWei(amount)

export const fromWei = amount => window.web3.utils.fromWei(amount)

const setETH = async ({ val: { network }, set, get, conf, global }) => {
  let web3_address = null
  let current_network = null
  let balance = null

  if (complement(isNil)(window.web3.currentProvider)) {
    current_network =
      window.web3.currentProvider.networkVersion ||
      window.web3.currentProvider._network
    if (current_network === (network || conf.web3.network)) {
      web3_address =
        window.web3.currentProvider.selectedAddress ||
        window.web3.currentProvider._selectedAddress
      balance = await window.web3.eth.getBalance(web3_address)
    }
  }

  let obj = {
    web3_network: current_network,
    web3_address: web3_address,
    eth_balance: {
      network: current_network,
      str: window.web3.utils.fromWei(balance),
      wei: balance,
      address: web3_address
    }
  }

  if (complement(isNil)(web3_address) && isNil(get("address_in_use"))) {
    obj.address_in_use = "eth"
  } else if (isNil(web3_address)) {
    obj.address_in_use = isNil(get("auth_selected")) ? null : "auth"
  }

  global.web3_address = web3_address
  obj.web3_updated = Date.now()
  set(obj, null)
  set(true, "web3_init")
  return obj
}

export const initWeb3 = async ({ val: { network, balances }, set, fn }) => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
      await window.ethereum.enable()
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
  if (complement(isNil)(window.web3)) {
    fn(setETH)({ network })
    window.web3.currentProvider.publicConfigStore.on("update", c => {
      fn(setETH)({ network })
    })
  } else {
    set(true, "web3_init")
  }
  return
}

const listenTransaction = async ({ method, args, eth, from, to, value }) => {
  let hashFunc = is(Function)(args[args.length - 1]) ? args.pop() : null
  const obj = is(Object)(args[args.length - 1]) ? args.pop() : {}
  hashFunc = is(Function)(obj.transactionHash) ? obj.transactionHash : hashFunc
  let _sender = { from }
  if (xNil(to)) _sender.to = to
  if (xNil(value)) _sender.value = value
  const sender = o(
    mergeRight(_sender),
    pick(["from", "to", "value", "gas", "gasPrice", "data", "nonce"])
  )(obj)

  let receipt = null
  let err = null
  let hash = null
  try {
    receipt = await (eth ? method(sender) : method(...args).send(sender))
      .on("transactionHash", async hash => {
        hash = hash
        if (is(Function)(hashFunc)) hashFunc(hash)
      })
      .on("confirmation", async (number, receipt) => {
        if (is(Function)(obj.confirmation)) obj.confirmation(number, receipt)
      })
      .on("error", async error => {
        if (is(Function)(obj.error)) obj.error(error)
      })
  } catch (e) {
    err = e
  }
  return [err, receipt]
}

export const contract = ({ val: { abi, address }, get, set, conf, global }) => {
  const contract = new window.web3.eth.Contract(abi, address)
  let methods = {}
  for (let v of abi) {
    if (v.type === "function" && v.constant) {
      methods[v.name] = (...args) => contract.methods[v.name](...args).call()
    } else if (v.type === "function" && v.constant !== true) {
      methods[v.name] = async (...args) => {
        return await listenTransaction({
          method: contract.methods[v.name],
          args,
          from: get("web3_address")
        })
      }
    }
  }
  return methods
}

export const erc20 = ({ val: { token, address }, conf, fn }) => {
  const contract_address =
    xNil(token) && hasPath(["web3", "erc20", token])(conf)
      ? conf.web3.erc20[token]
      : address
  return fn(contract)({ abi: abi_erc20, address: contract_address })
}

export const eth = ({ fn, get }) => {
  let web3js = {
    balanceOf: address =>
      window.web3.eth.getBalance(address || get("web3_address")),
    getBalance: address =>
      window.web3.eth.getBalance(address || get("web3_address"))
  }
  web3js.transfer = async (...args) => {
    return await listenTransaction({
      eth: true,
      to: args[0],
      value: args[1],
      method: window.web3.eth.sendTransaction,
      args: args.slice(2),
      from: get("web3_address")
    })
  }
  web3js.sendTransaction = async (...args) => {
    return await listenTransaction({
      eth: true,
      method: window.web3.eth.sendTransaction,
      args,
      from: get("web3_address")
    })
  }

  return web3js
}
