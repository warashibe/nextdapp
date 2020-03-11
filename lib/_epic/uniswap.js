import { set, fb, epic } from "./util"
import conf from "../../src/conf"
import { uniswap_factory } from "../const"
import uniswap_exchange_abi from "../abi/uniswap_exchange"
import uniswap_factory_abi from "../abi/uniswap_factory"
import R from "ramdam"
const factory = uniswap_factory[conf.web3.network]
const abi_erc20 = require("../abi/IERC20.json").abi

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
  const uniswap_factory = new _web3.eth.Contract(uniswap_factory_abi, factory)
  const prs_allowance = R.compose(
    R.map(async v => {
      const erc20_contract = new _web3.eth.Contract(abi_erc20, v.addr)
      return uniswap_factory.methods
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
    R.map(web3.utils.fromWei)
  )(await Promise.all(prs_allowance))

  set(user_allowances, "uniswap_allowances")
}

export const uniswap_tokens = epic(
  "uniswap_tokens",
  async ({
    type,
    val: { from, to, amount = 0 },
    dispatch,
    extra,
    state$,
    set
  }) => {
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3
    const uniswap_factory = new _web3.eth.Contract(uniswap_factory_abi, factory)
    const exchange_address = await uniswap_factory.methods
      .getExchange(from || to)
      .call()
    const uniswap = new _web3.eth.Contract(
      uniswap_exchange_abi,
      exchange_address
    )
    const dead = Math.round(Date.now() / 1000 + 60 * 60 * 24)
    if (R.isNil(from)) {
      const tx = await uniswap.methods.ethToTokenSwapInput(1, dead).send({
        value: web3.utils.toWei(amount.toString()),
        from: address
      })
    } else if (R.isNil(to)) {
      const tx = await uniswap.methods
        .tokenToEthSwapInput(web3.utils.toWei(amount.toString()), 1, dead)
        .send({
          from: address
        })
    } else {
      const tx = await uniswap.methods
        .tokenToTokenSwapInput(
          web3.utils.toWei(amount.toString()),
          1,
          1,
          dead,
          to
        )
        .send({
          from: address
        })
    }
    set(Date.now(), "eth_updated")
  }
)

export const autoCheckUniswap = async ({ val: { tokens }, state$, set }) => {
  const from = state$.value.uniswap_from
  const to = state$.value.uniswap_to
  const amount = state$.value.uniswap_from_amount || 0
  check_uniswap_rate({
    val: {
      amount: amount,
      from: from === "ETH" ? null : tokens[from].addr,
      to: to === "ETH" ? null : tokens[to].addr
    },
    set
  })
}

const check_uniswap_rate = async ({ val: { amount = 0, from, to }, set }) => {
  if (amount === 0) {
    set(0, "uniswap_to_amount")
    return
  }
  const uniswap_factory = new web3.eth.Contract(uniswap_factory_abi, factory)
  const exchange_address = await uniswap_factory.methods
    .getExchange(from || to)
    .call()
  const uniswap = new web3.eth.Contract(uniswap_exchange_abi, exchange_address)
  let price = await uniswap.methods[
    R.isNil(from) ? "getEthToTokenInputPrice" : "getTokenToEthInputPrice"
  ](web3.utils.toWei(amount.toString())).call()
  if (R.all(R.xNil)([from, to])) {
    const exchange_address2 = await uniswap_factory.methods
      .getExchange(to)
      .call()
    const uniswap2 = new web3.eth.Contract(
      uniswap_exchange_abi,
      exchange_address2
    )
    price = await uniswap2.methods.getEthToTokenInputPrice(price).call()
  }
  set(web3.utils.fromWei(price), "uniswap_to_amount")
}
export const checkUniswap = epic("checkUniswap", async ({ val, set }) => {
  check_uniswap_rate({ val, set })
})

export const changeUniswapAllowance = epic(
  "changeUniswapAllowance",
  async ({ val, state$, set }) => {
    const _web3 =
      state$.value.address_in_use === "auth"
        ? state$.value.web3_authereum
        : web3
    const uniswap_factory = new _web3.eth.Contract(uniswap_factory_abi, factory)
    const contract_address = await uniswap_factory.methods
      .getExchange(val.token_address)
      .call()
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const erc20_contract = new _web3.eth.Contract(abi_erc20, val.token_address)
    await erc20_contract.methods
      .approve(contract_address, _web3.utils.toWei(val.value))
      .send({ from: address })
    set(Date.now(), "eth_updated")
  }
)

export const init = {
  uniswap_from_amount: 0,
  uniswap_from: "ETH",
  uniswap_to: "DAI",
  uniswap_to_amount: 0,
  uniswap_allowances: {}
}
