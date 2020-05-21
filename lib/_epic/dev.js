import { fb, errlog } from "./util"
import { epic } from "nd-core"
import conf from "../../src/conf"
import R from "ramdam"
import N from "bignumber.js"
const dev_property_factory_abi = require("../abi/dev/PropertyFactory")
const dev_npm_market_abi = require("../abi/dev/NpmMarket")
const dev_lockup_abi = require("../abi/dev/Lockup")
const dev_lockup_storage_abi = require("../abi/dev/LockupStorage")
const dev_dev_abi = require("../abi/dev/Dev")
const abi_erc20 = require("../abi/IERC20.json").abi

export const devCheckBalance = async ({ set, state$, val: { properties } }) => {
  const _web3 =
    state$.value.address_in_use === "auth" ? state$.value.web3_authereum : web3
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  if (R.isNil(address)) {
    set({}, "dev_balances")
    return
  }
  const lockup = new _web3.eth.Contract(dev_lockup_abi, conf.dev.lockup)
  const lockup_storage = new _web3.eth.Contract(
    dev_lockup_storage_abi,
    conf.dev.lockup_storage
  )
  let prs = []
  for (const v of properties) {
    prs.push(lockup.methods.getPropertyValue(v.address).call())
    prs.push(lockup.methods.getValue(v.address, address).call())
    prs.push(
      lockup.methods
        .calculateWithdrawableInterestAmount(v.address, address)
        .call()
    )

    prs.push(
      lockup_storage.methods.getWithdrawalStatus(v.address, address).call()
    )
  }
  const balances = R.compose(
    R.splitEvery(4),
    R.addIndex(R.map)((v, i) => {
      return i % 4 == 3 ? v : _web3.utils.fromWei(v)
    })
  )(await Promise.all(prs))
  let devBalances = {}
  R.addIndex(R.forEach)((v, i) => {
    devBalances[properties[i].address] = {
      total: v[0],
      you: v[1],
      reward: v[2],
      withdrawal: v[3]
    }
  })(balances)
  set(devBalances, "dev_balances")
}
export const devCancel = epic(
  "devCancel",
  async ({ set, state$, val: { token_address } }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3

    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const lockup = new _web3.eth.Contract(dev_lockup_abi, conf.dev.lockup)
    const pid = `dev_cancel_${token_address}_${address}`
    set(true, ["ongoing", pid])
    const _err = (error, message = "something weng wrong.") => {
      if (R.isNil(error)) return false
      console.log(error)
      set(false, ["ongoing", pid])
      alert(message)
      return R.xNil(error)
    }
    const [err] = await R.err(
      lockup.methods.cancel(token_address).send,
      lockup
    )({ from: address })
    if (_err(err)) return
    set(false, ["ongoing", pid])
  }
)
export const devWithdrawInterest = epic(
  "devWithdrawInterest",
  async ({ set, state$, val: { token_address } }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3

    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const lockup = new _web3.eth.Contract(dev_lockup_abi, conf.dev.lockup)
    const pid = `dev_withdrawInterest_${token_address}_${address}`
    set(true, ["ongoing", pid])
    const _err = (error, message = "something weng wrong.") => {
      if (R.isNil(error)) return false
      console.log(error)
      set(false, ["ongoing", pid])
      alert(message)
      return R.xNil(error)
    }
    const [err] = await R.err(
      lockup.methods.withdrawInterest(token_address).send,
      lockup
    )({ from: address })
    if (_err(err)) return
    set(false, ["ongoing", pid])
  }
)
export const devWithdraw = epic(
  "devWithdraw",
  async ({ set, state$, val: { token_address } }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3

    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const lockup = new _web3.eth.Contract(dev_lockup_abi, conf.dev.lockup)
    const pid = `dev_withdraw_${token_address}_${address}`
    set(true, ["ongoing", pid])
    const _err = (error, message = "something weng wrong.") => {
      if (R.isNil(error)) return false
      console.log(error)
      set(false, ["ongoing", pid])
      alert(message)
      return R.xNil(error)
    }
    const [err] = await R.err(
      lockup.methods.withdraw(token_address).send,
      lockup
    )({ from: address })
    if (_err(err)) return
    set(false, ["ongoing", pid])
  }
)

export const devCreateProperty = epic(
  "devCreateProperty",
  async ({
    type,
    val: { token_name, symbol },
    dispatch,
    extra,
    state$,
    set
  }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3

    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const property_factory = new _web3.eth.Contract(
      dev_property_factory_abi,
      conf.dev.property_factory
    )
    const [err] = await R.err(
      property_factory.methods.create(token_name, symbol, address).send,
      property_factory
    )({ from: address })
  }
)

export const devAuthenticateNPM = epic(
  "devAuthenticateNMP",
  async ({
    type,
    val: { name, token_address, npm_access_token },
    dispatch,
    extra,
    state$,
    set
  }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3

    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const npm_market = new _web3.eth.Contract(
      dev_npm_market_abi,
      conf.dev.npm_market
    )
    const [err] = await R.err(
      npm_market.methods.authenticate(
        token_address,
        name,
        npm_access_token,
        "0",
        "0",
        "0"
      ).send,
      npm_market
    )({ from: address })
  }
)
export const devStake = epic(
  "devStake",
  async ({
    type,
    val: { amount, token_address },
    dispatch,
    extra,
    state$,
    set
  }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const pid = `dev_stake_${token_address}_${address}`
    set(true, ["ongoing", pid])
    const dev_contract = new _web3.eth.Contract(dev_dev_abi, conf.dev.dev)
    const _err = (error, message = "something weng wrong.") => {
      if (R.isNil(error)) return false
      console.log(error)
      set(false, ["ongoing", pid])
      alert(message)
      return R.xNil(error)
    }
    const [err] = await R.err(
      dev_contract.methods.deposit(
        token_address,
        _web3.utils.toWei(N(amount).toFixed(18))
      ).send,
      dev_contract
    )({ from: address })
    if (_err(err)) return
    set(false, ["ongoing", pid])
  }
)

export const checkDevAllowance = async ({ set, state$, val }) => {
  if (
    R.isNil(state$.value.address_in_use) ||
    R.isNil(state$.value[`${state$.value.address_in_use}_selected`])
  ) {
    set({}, "dev_allowances")
    return
  }
  const _web3 =
    state$.value.address_in_use === "auth" ? state$.value.web3_authereum : web3
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const tokens = val.balances
  const dev = new _web3.eth.Contract(dev_dev_abi, conf.dev.dev)
  const prs_allowance = R.compose(
    R.map(async v => {
      const erc20_contract = new _web3.eth.Contract(abi_erc20, v.addr)
      return erc20_contract.methods.allowance(address, conf.dev.lockup).call()
    })
  )(val.balances)

  const user_allowances = R.compose(
    R.reduce((acc, v) => {
      acc[v[0]] = { allowance: v[1] }
      return acc
    }, {}),
    R.zip(R.pluck("key")(val.balances)),
    R.map(_web3.utils.fromWei)
  )(await Promise.all(prs_allowance))
  set(user_allowances, "dev_allowances")
}

export const unlockDev = epic("unlockDev", async ({ val, state$, set }) => {
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const pid = `changeAllowance_${val.token_address}_${address}`
  const _web3 =
    state$.value.address_in_use === "auth" ? state$.value.web3_authereum : web3
  set(true, ["ongoing", pid])
  const erc20_contract = new _web3.eth.Contract(abi_erc20, val.token_address)
  const [err] = await R.err(
    erc20_contract.methods.approve(
      conf.dev.dev,
      _web3.utils.toWei(N(val.value).toFixed(18))
    ).send,
    erc20_contract
  )({ from: address })
  set(false, ["ongoing", pid])

  R.xNil(err) ? alert("something went wrong.") : set(Date.now(), "eth_updated")
})

export const init = {
  dev_balances: {},
  dev_allowances: {},
  dev_amounts: {}
}
