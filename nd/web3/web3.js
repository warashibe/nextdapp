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

const setETH = async ({
  val: { network, new_address },
  set,
  props,
  conf,
  global
}) => {
  let web3_address = null
  let current_network = null
  let balance = null
  console.log(window.web3.currentProvider)
  console.log("were....")
  if (complement(isNil)(window.web3.currentProvider)) {
    current_network =
      window.web3.currentProvider.networkVersion ||
      window.web3.currentProvider._network
    if (current_network === (network || conf.web3.network)) {
      console.log(window.web3.currentProvider.selectedAddress)
      web3_address =
        new_address ||
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
      str: window.web3.utils.fromWei(balance || "0"),
      wei: balance,
      address: web3_address
    }
  }

  if (complement(isNil)(web3_address) && isNil(props.address_in_use)) {
    obj.address_in_use = "eth"
  } else if (isNil(web3_address)) {
    obj.address_in_use = isNil(props.auth_selected) ? null : "auth"
  }

  global.web3_address = web3_address
  obj.web3_updated = Date.now()
  set(obj, null)
  set(true, "web3_init")
  return obj
}

export const initWeb3 = async ({
  val: { network, balances },
  props,
  set,
  conf,
  global
}) => {
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
    setETH({ val: { network }, set, props, conf, global })
    if (!isNil(window.web3.currentProvider.publicConfigStore)) {
      window.web3.currentProvider.publicConfigStore.on("update", c => {
        setETH({ val: { network }, set, props, conf, global })
      })
    } else if (!isNil(window.ethereum)) {
      window.ethereum.on("chainChanged", c => window.location.reload())
      window.ethereum.on("accountsChanged", accounts => {
        setETH({
          val: { network, new_address: accounts[0] },
          set,
          props,
          conf,
          global
        })
      })
    }
  } else {
    set(true, "web3_init")
  }
  return
}

export const contract = ({
  val: { abi, address },
  props,
  set,
  conf,
  global
}) => {
  const contract = new window.web3.eth.Contract(abi, address)
  let methods = {}
  for (let v of abi) {
    if (v.type === "function" && v.constant) {
      methods[v.name] = (...args) => contract.methods[v.name](...args).call()
    } else if (v.type === "function" && v.constant !== true) {
      methods[v.name] = async (...args) => {
        let hashFunc = is(Function)(args[args.length - 1]) ? args.pop() : null
        const obj = is(Object)(args[args.length - 1]) ? args.pop() : {}
        hashFunc = is(Function)(obj.transactionHash)
          ? obj.transactionHash
          : hashFunc
        const sender = o(
          mergeRight({
            from: props.web3_address
          }),
          pick(["from", "to", "value", "gas", "gasPrice", "data", "nonce"])
        )(obj)
        let receipt = null
        let err = null
        let hash = null
        try {
          receipt = await contract.methods[v.name](...args)
            .send(sender)
            .on("transactionHash", async hash => {
              hash = hash
              if (is(Function)(hashFunc)) hashFunc(hash)
            })
            .on("confirmation", async (number, receipt) => {
              if (is(Function)(obj.confirmation))
                obj.confirmation(number, receipt)
            })
            .on("error", async error => {
              if (is(Function)(obj.error)) obj.error(error)
            })
        } catch (e) {
          err = e
        }
        return [err, receipt]
      }
    }
  }
  return methods
}
contract.props = ["web3_address"]

export const erc20 = ({
  val: { token, address },
  props,
  set,
  conf,
  global
}) => {
  const contract_address =
    xNil(token) && hasPath(["web3", "erc20", token])(conf)
      ? conf.web3.erc20[token]
      : address
  return contract({
    val: { abi: abi_erc20, address: contract_address },
    props,
    set,
    conf,
    global
  })
}

erc20.props = ["web3_address"]
