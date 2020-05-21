import { errlog } from "nd-util"
import { fb } from "nd-firebase"
import { epic } from "nd-core"
import conf from "../../src/conf"
import { uniswap_factory } from "../const"
import uniswap_exchange_abi from "../abi/uniswap_exchange"
import uniswap_factory_abi from "../abi/uniswap_factory"
import R from "ramdam"
const abi_erc20 = require("../abi/IERC20.json").abi
import N from "bignumber.js"

export const checkUniswapAllowance = async ({ set, state$, val }) => {
  if (
    R.isNil(state$.value.address_in_use) ||
    R.isNil(state$.value[`${state$.value.address_in_use}_selected`])
  ) {
    set({}, "uniswap_allowances")
    return
  }
  const _web3 =
    state$.value.address_in_use === "auth" ? state$.value.web3_authereum : web3
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const tokens = val.balances
  const factory = uniswap_factory[val._network || conf.web3.network]
  const _uniswap_factory = new _web3.eth.Contract(uniswap_factory_abi, factory)
  const prs_allowance = R.compose(
    R.map(async v => {
      const erc20_contract = new _web3.eth.Contract(abi_erc20, v.addr)
      return _uniswap_factory.methods
        .getExchange(v.addr)
        .call()
        .then(exchange_address => {
          return erc20_contract.methods
            .allowance(address, exchange_address)
            .call()
        })
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
  set(user_allowances, "uniswap_allowances")
}

export const uniswap_tokens = epic(
  "uniswap_tokens",
  async ({
    type,
    val: { from, to, amount = 0, to_amount = 0, _network },
    dispatch,
    extra,
    state$,
    set
  }) => {
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const lock = state$.value.input_lock
    const pid = `uniswap_tokens_${address}`
    set(true, ["ongoing", pid])
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3
    const dead = Math.round(Date.now() / 1000 + 60 * 15)
    const factory = uniswap_factory[_network || conf.web3.network]
    const _uniswap_factory = new _web3.eth.Contract(
      uniswap_factory_abi,
      factory
    )
    if (lock === "from") {
      const [err, exchange_address] = await R.err(
        _uniswap_factory.methods.getExchange(from || to).call,
        _uniswap_factory
      )()
      const _err = (error, message = "something weng wrong.") => {
        if (R.isNil(error)) return false
        console.log(error)
        set(false, ["ongoing", pid])
        alert("something went wrong.")
        return R.xNil(error)
      }
      if (_err(err)) return
      const uniswap = new _web3.eth.Contract(
        uniswap_exchange_abi,
        exchange_address
      )

      if (R.isNil(from)) {
        const [err2, tx] = await R.err(
          uniswap.methods.ethToTokenSwapInput(1, dead).send,
          uniswap
        )({
          value: _web3.utils.toWei(N(amount).toFixed(18)),
          from: address
        })
        if (_err(err2)) return
      } else if (R.isNil(to)) {
        const [err2, tx] = await R.err(
          uniswap.methods.tokenToEthSwapInput(
            _web3.utils.toWei(N(amount).toFixed(18)),
            1,
            dead
          ).send,
          uniswap
        )({
          from: address
        })
        if (_err(err2)) return
      } else {
        const [err2, tx] = await R.err(
          uniswap.methods.tokenToTokenSwapInput(
            _web3.utils.toWei(N(amount).toFixed(18)),
            1,
            1,
            dead,
            to
          ).send,
          uniswap
        )({
          from: address
        })
        if (_err(err2)) return
      }
    } else {
      const [err, exchange_address] = await R.err(
        _uniswap_factory.methods.getExchange(to || from).call,
        _uniswap_factory
      )()
      const _err = (error, message = "something weng wrong.") => {
        if (R.isNil(error)) return false
        console.log(error)
        set(false, ["ongoing", pid])
        alert("something went wrong.")
        return R.xNil(error)
      }
      if (_err(err)) return
      const uniswap = new _web3.eth.Contract(
        uniswap_exchange_abi,
        exchange_address
      )
      if (R.isNil(from)) {
        const [err2, tx] = await R.err(
          uniswap.methods.ethToTokenSwapOutput(
            _web3.utils.toWei(N(to_amount).toFixed(18)),
            dead
          ).send,
          uniswap
        )({
          value: _web3.utils.toWei(N(amount * 1.005).toFixed(18)),
          from: address
        })
        if (_err(err2)) return
      } else if (R.isNil(to)) {
        const [err2, tx] = await R.err(
          uniswap.methods.tokenToEthSwapOutput(
            _web3.utils.toWei(N(to_amount).toFixed(18)),
            _web3.utils.toWei(N(amount * 1.005).toFixed(18)),
            dead
          ).send,
          uniswap
        )({
          from: address
        })
        if (_err(err2)) return
      } else {
        const [err, exchange_address2] = await R.err(
          _uniswap_factory.methods.getExchange(from).call,
          _uniswap_factory
        )()
        const uniswap2 = new _web3.eth.Contract(
          uniswap_exchange_abi,
          exchange_address2
        )
        const [err2, tx] = await R.err(
          uniswap2.methods.tokenToTokenSwapOutput(
            _web3.utils.toWei(N(to_amount).toFixed(18)),
            _web3.utils.toWei(N(amount * 1.005).toFixed(18)),
            _web3.utils.toWei("100000000"),
            dead,
            to
          ).send,
          uniswap
        )({
          from: address
        })
        if (_err(err2)) return
      }
    }

    set(false, ["ongoing", pid])
    set(Date.now(), "eth_updated")
  }
)

export const autoCheckUniswap = async ({
  val: { tokens, _network },
  state$,
  set
}) => {
  const from = state$.value.uniswap_from
  const to = state$.value.uniswap_to
  const lock = state$.value.input_lock
  const amount =
    lock === "from"
      ? state$.value.uniswap_from_amount || 0
      : state$.value.uniswap_to_amount || 0
  check_uniswap_rate({
    val: {
      _network,
      amount: amount,
      from: from === "ETH" ? null : tokens[from].addr,
      to: to === "ETH" ? null : tokens[to].addr,
      lock: lock
    },
    set,
    state$
  })
}

const check_uniswap_rate = async ({
  val: { amount = 0, from, to, lock, _network },
  set,
  state$
}) => {
  const _web3 =
    state$.value.address_in_use === "auth" ? state$.value.web3_authereum : web3
  const tar = lock === "from" ? "to" : "from"
  if (amount === 0) {
    set(0, `uniswap_${tar}_amount`)
    return
  }
  const factory = uniswap_factory[_network || conf.web3.network]
  const _uniswap_factory = new _web3.eth.Contract(uniswap_factory_abi, factory)

  if (lock === "from") {
    const exchange_address = await _uniswap_factory.methods
      .getExchange(from || to)
      .call()
    const uniswap = new _web3.eth.Contract(
      uniswap_exchange_abi,
      exchange_address
    )

    let [err, price] = await R.err(
      uniswap.methods[
        R.isNil(from) ? "getEthToTokenInputPrice" : "getTokenToEthInputPrice"
      ](_web3.utils.toWei(N(amount).toFixed(18))).call,
      uniswap
    )()
    if (R.xNil(price) && R.all(R.xNil)([from, to])) {
      const exchange_address2 = await _uniswap_factory.methods
        .getExchange(to)
        .call()
      const uniswap2 = new _web3.eth.Contract(
        uniswap_exchange_abi,
        exchange_address2
      )
      ;[err, price] = await R.err(
        uniswap2.methods.getEthToTokenInputPrice(price).call,
        uniswap2
      )()
    }
    set(_web3.utils.fromWei(price || "0"), `uniswap_${tar}_amount`)
  } else {
    const exchange_address = await _uniswap_factory.methods
      .getExchange(to || from)
      .call()
    const uniswap = new _web3.eth.Contract(
      uniswap_exchange_abi,
      exchange_address
    )

    let [err, price] = await R.err(
      uniswap.methods[
        R.xNil(to) ? "getEthToTokenOutputPrice" : "getTokenToEthOutputPrice"
      ](_web3.utils.toWei(N(amount).toFixed(18))).call,
      uniswap
    )()
    if (R.xNil(price) && R.all(R.xNil)([from, to])) {
      const exchange_address2 = await _uniswap_factory.methods
        .getExchange(from)
        .call()
      const uniswap2 = new _web3.eth.Contract(
        uniswap_exchange_abi,
        exchange_address2
      )
      ;[err, price] = await R.err(
        uniswap2.methods.getTokenToEthOutputPrice(price).call,
        uniswap2
      )()
    }
    set(_web3.utils.fromWei(price || "0"), `uniswap_${tar}_amount`)
  }
}

export const checkUniswap = epic(
  "checkUniswap",
  async ({ val, set, state$ }) => {
    set(val.lock, "input_lock")
    check_uniswap_rate({ val, set, state$ })
  }
)

export const changeUniswapAllowance = epic(
  "changeUniswapAllowance",
  async ({ val, state$, set }) => {
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const pid = `changeAllowance_${val.token_address}_${address}`
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3
    const factory = uniswap_factory[val._network || conf.web3.network]

    const _uniswap_factory = new _web3.eth.Contract(
      uniswap_factory_abi,
      factory
    )
    set(true, ["ongoing", pid])
    const [err, contract_address] = await R.err(
      _uniswap_factory.methods.getExchange(val.token_address).call,
      _uniswap_factory
    )()
    if (R.xNil(err)) {
      console.log(err)
      set(false, ["ongoing", pid])
      alert("something went wrong.")
      return
    }
    const erc20_contract = new _web3.eth.Contract(abi_erc20, val.token_address)
    const [err2] = await R.err(
      erc20_contract.methods.approve(
        contract_address,
        _web3.utils.toWei(N(val.value).toFixed(18))
      ).send,
      erc20_contract
    )({ from: address })
    set(false, ["ongoing", pid])
    R.xNil(err2)
      ? alert("something went wrong.")
      : set(Date.now(), "eth_updated")
  }
)

export const init = {
  uniswap_from_amount: 0,
  uniswap_from: "ETH",
  uniswap_to: "DAI",
  uniswap_to_amount: 0,
  uniswap_allowances: {},
  input_lock: "from"
}
