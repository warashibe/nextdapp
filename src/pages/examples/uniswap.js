import { Box, Flex, Text, Image, Button } from "rebass"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Wallet from "../../../components/Wallet"
import conf from "../../conf"
import { checkBalance, checkWallet } from "../../../lib/_epic/web3"
import {
  autoCheckUniswap,
  checkUniswapAllowance
} from "../../../lib/_epic/uniswap"
import { ethereum_networks, socials } from "../../../lib/const"
const socials_map = R.indexBy(R.prop("key"))(socials)
import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"
const tokens = [
  {
    img: "dai.png",
    key: "DAI",
    addr: "0xad6d458402f60fd3bd25163575031acdce07538d"
  },
  {
    img: "link.png",
    key: "LINK",
    addr: "0x20fE562d797A42Dcb3399062AE9546cd06f63280"
  }
]
const token_addrs = R.indexBy(R.prop("key"))(tokens)
const token_keys = R.indexBy(R.prop("addr"))(tokens)

const BalanceTable = props =>
  R.isNil(props.address_in_use) ? null : (
    <Box p={3}>
      <Box as="table" width={1} textAlign="center" fontSize="14px">
        <Box as="thead">
          <Box as="tr" bg="#4CAF50" color="#eee">
            <Box as="th" p={2}>
              Token
            </Box>
            <Box as="th" p={2}>
              Blanace
            </Box>
            <Box as="th" p={2}>
              Unlock
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {R.map(v => {
            return (
              <Box as="tr" bg="#ddd">
                <Box as="td" p={2} title={v.key}>
                  <Image src={`/static/images/${v.img}`} height="25px" />
                </Box>
                <Box as="td" p={2}>
                  {R.isNil(props.user_balances[v.key])
                    ? 0
                    : props.user_balances[v.key].balance}
                </Box>

                {v.key === "ETH" ||
                (R.hasPath(["uniswap_allowances", v.key, "allowance"])(props) &&
                  N(+props.uniswap_allowances[v.key].allowance).gt(
                    Math.pow(2, 100)
                  )) ? (
                  <Box as="td" bg="#4CAF50" color="white" p={2}>
                    <Box as="i" className="fas fa-lock-open" />
                  </Box>
                ) : props.ongoing[
                  `changeUniswapAllowance_${v.addr}_${
                    props[`${props.address_in_use}_selected`]
                  }`
                ] ? (
                  <Box as="td" bg="#E69500" color="white" p={2}>
                    <Box as="i" className="fas fa-spin fa-sync" />
                  </Box>
                ) : (
                  <Box
                    title="unlock"
                    as="td"
                    bg="#999"
                    color="white"
                    p={2}
                    sx={{
                      cursor: "pointer",
                      ":hover": { bg: "#4CAF50", color: "white" }
                    }}
                    onClick={() => {
                      props.changeUniswapAllowance({
                        value: N(Math.pow(2, 256)).toFixed(),
                        token_address: v.addr
                      })
                    }}
                  >
                    <Box as="i" className="fas fa-lock" />
                  </Box>
                )}
              </Box>
            )
          })(R.concat([{ key: "ETH", img: "ethereum.png" }], tokens))}
        </Box>
      </Box>
    </Box>
  )

export default binder(
  props => {
    useEffect(() => {
      isFirebase().then(async () => {
        props.tracker({
          global: true,
          tracks: {
            user: {
              dep: ["eth_updated"],
              func: checkBalance,
              args: {
                balances: tokens,
                uniswap: true
              }
            },
            uniswap_allowances: {
              dep: ["eth_updated"],
              func: checkUniswapAllowance,
              args: {
                balances: tokens,
                uniswap: true
              }
            },
            check_uniswap_rate: {
              any: [
                "uniswap_from",
                "uniswap_to",
                "uniswap_from_amount",
                "uniswap_to_amount",
                "eth_updated"
              ],
              func: autoCheckUniswap,
              args: {
                tokens: token_addrs
              }
            }
          }
        })

        props.hookWeb3()
        props.getTokenPrices({
          token_ids: ["ethereum", "dai", "chainlink"],
          currencies: ["usd"]
        })
      })
    }, [])
    const pics = {
      eth: "metamask",
      auth: "authereum"
    }
    const wallet =
      R.isNil(props.eth_selected) && R.isNil(props.auth_selected) ? (
        <Box color="#FF4C2F" textAlign="center">
          No Available Wallet Found
        </Box>
      ) : (
        <Flex alignItems="center" width={1}>
          <Box flex={1}>
            <Select
              width={1}
              onChange={e => props.switchWallet({ type: e.target.value })}
            >
              {R.isNil(props.eth_selected) ? null : (
                <option value="eth">{props.eth_selected}</option>
              )}
              {R.isNil(props.auth_selected) ? null : (
                <option value="auth">{props.auth_selected}</option>
              )}
            </Select>
          </Box>
          <Box width="50px">
            <Image
              ml={2}
              height="30px"
              src={`/static/images/${pics[props.address_in_use]}.png`}
            />
          </Box>
        </Flex>
      )
    const footer = (
      <Flex color="white" bg="#DC6BE5" width={1} flexWrap="wrap" p={3}>
        <Box textAlign="center" width={1}>
          <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )

    const connectAuth = `${
      R.isNil(props.auth_selected) ? "Connect" : "Disconnect"
    } Authereum`

    const isSwappable =
      !R.any(R.equals(0))([
        +props.uniswap_from_amount,
        +props.uniswap_to_amount
      ]) &&
      R.hasPath(["user_balances", props.uniswap_from, "balance"])(props) &&
      N(+props.uniswap_from_amount).lte(
        props.user_balances[props.uniswap_from].balance
      )
    const token_ids = {
      ETH: "ethereum",
      LINK: "chainlink",
      DAI: "dai"
    }

    const getPrice = props => {
      if (+(props.uniswap_from_amount || 0) === 0) {
        return [0, 0]
      } else {
        const per = +props.uniswap_to_amount / +props.uniswap_from_amount
        const per_rounded = Math.round(per * 1000) / 1000
        if (R.isNil(props.token_prices[token_ids[props.uniswap_to]])) {
          return [per_rounded, "-"]
        } else {
          const amount =
            Math.round(
              per * +props.token_prices[token_ids[props.uniswap_to]].usd * 100
            ) / 100

          return [per_rounded, amount]
        }
      }
    }

    return (
      <ThemeProvider theme={preset}>
        <Flex flexWrap="wrap">
          <Box
            p={3}
            textAlign="center"
            color="white"
            bg="#DC6BE5"
            width={1}
            mb={3}
          >
            {R.all(R.xNil)([props.web3_network, props.eth_selected]) ? (
              <React.Fragment>
                <Box as="i" color="#4CAF50" className="fa fa-circle" mr={1} />
                MetaMask Connected to {ethereum_networks[props.web3_network]}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box as="i" color="#FF4C2F" className="fa fa-circle" mr={1} />
                Connect MetaMask to{" "}
                {(ethereum_networks[conf.web3.network] || "").toUpperCase()}
              </React.Fragment>
            )}{" "}
            {R.xNil(props.auth_selected) ? (
              <React.Fragment>
                <Box
                  ml={3}
                  as="i"
                  color="#4CAF50"
                  className="fa fa-circle"
                  mr={1}
                />
                Authereum Connected
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box
                  ml={3}
                  as="i"
                  color="#FF4C2F"
                  className="fa fa-circle"
                  mr={1}
                />
                Authereum Not Connected
              </React.Fragment>
            )}
          </Box>
          <Box p={3} width={[1, null, 0.5]}>
            <Text color="#FF4C2F" mb={2}>
              1. Choose Wallet (MetaMask or Authereum)
            </Text>
            <Box
              p={3}
              sx={{ border: "1px solid #FF4C2F", borderRadius: "3px" }}
            >
              {wallet}
              <Box width={1} mt={3}>
                <Box
                  sx={{ ...btn }}
                  p={2}
                  textAlign="center"
                  bg="#FF4C2F"
                  color="white"
                  onClick={() => {
                    if (props.auth_init) {
                      props[
                        R.isNil(props.auth_selected)
                          ? "connectAuthereum"
                          : "disconnectAuthereum"
                      ]({ user: props.user })
                    }
                  }}
                >
                  {props.auth_init ? (
                    connectAuth
                  ) : (
                    <Box as="i" className="fa fa-spin fa-sync" />
                  )}
                </Box>
              </Box>
            </Box>
            <Text color="#4CAF50" mb={2} mt={4}>
              2. Unlock to grant permission to Uniswap
            </Text>
            <Box
              mb={3}
              sx={{ border: "1px solid #4CAF50", borderRadius: "3px" }}
            >
              <BalanceTable {...props} />
            </Box>
          </Box>
          <Box p={3} width={[1, null, 0.5]}>
            <Text color="#DC6BE5" mb={2}>
              3. Swap Tokens with Uniswap
            </Text>
            <Box
              mb={3}
              p={3}
              sx={{ border: "1px solid #DC6BE5", borderRadius: "3px" }}
            >
              {R.isNil(props.address_in_use) ? null : (
                <React.Fragment>
                  <Text lineHeight="150%" color="#DC6BE5" mb={2}>
                    {R.all(R.xNil)([
                      props.uniswap_from,
                      props.uniswap_from_amount,
                      props.uniswap_to,
                      props.uniswap_to_amount,
                      props.token_prices
                    ]) && +(props.uniswap_from_amount || 0) !== 0
                      ? `Rate: 1 ${props.uniswap_from} = ${
                          getPrice(props)[0]
                        } ${props.uniswap_to} = ${getPrice(props)[1]} USD`
                      : "Rate: -"}
                  </Text>

                  <Box as="table" width={1} mb={3}>
                    <Box as="tbody">
                      <Box as="tr">
                        <Box as="td">
                          <Select
                            value={props.uniswap_from}
                            onChange={e =>
                              props.set(e.target.value, "uniswap_from")
                            }
                          >
                            {R.compose(
                              R.map(v => {
                                return <option value={v}>{v}</option>
                              }),
                              R.filter(v => v !== props.uniswap_to),
                              R.concat(["ETH"]),
                              R.pluck("key")
                            )(tokens)}
                          </Select>
                        </Box>
                        <Box
                          as="td"
                          width="40px"
                          textAlign="center"
                          rowSpan={2}
                          sx={{ ...btn }}
                          onClick={() => {
                            props.merge({
                              uniswap_from: props.uniswap_to,
                              uniswap_to: props.uniswap_from
                            })
                          }}
                        >
                          <Box as="i" className="fas fa-angle-double-right" />
                        </Box>
                        <Box as="td">
                          <Select
                            value={props.uniswap_to}
                            onChange={e =>
                              props.set(e.target.value, "uniswap_to")
                            }
                          >
                            {R.compose(
                              R.map(v => {
                                return <option value={v}>{v}</option>
                              }),
                              R.filter(v => v !== props.uniswap_from),
                              R.concat(["ETH"]),
                              R.pluck("key")
                            )(tokens)}
                          </Select>
                        </Box>
                      </Box>
                      <Box as="tr">
                        <Box as="td">
                          <Input
                            color={
                              R.hasPath([
                                "user_balances",
                                props.uniswap_from,
                                "balance"
                              ])(props) &&
                              N(+props.uniswap_from_amount).gt(
                                props.user_balances[props.uniswap_from].balance
                              )
                                ? "#FF4C2F"
                                : "#000"
                            }
                            bg={props.input_lock === "from" ? "white" : "#eee"}
                            value={props.uniswap_from_amount}
                            onChange={e => {
                              if (R.isNaN(e.target.value * 1) == false) {
                                props.set(e.target.value, "uniswap_from_amount")
                                props.checkUniswap({
                                  amount: e.target.value * 1,
                                  from:
                                    props.uniswap_from === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_from].addr,
                                  to:
                                    props.uniswap_to === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_to].addr,
                                  lock: "from"
                                })
                              }
                            }}
                            placeholder={props.uniswap_from}
                          />
                        </Box>
                        <Box as="td">
                          <Input
                            bg={props.input_lock === "to" ? "white" : "#eee"}
                            value={props.uniswap_to_amount}
                            onChange={e => {
                              if (R.isNaN(e.target.value * 1) == false) {
                                props.set(e.target.value, "uniswap_to_amount")
                                props.checkUniswap({
                                  amount: e.target.value * 1,
                                  from:
                                    props.uniswap_from === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_from].addr,
                                  to:
                                    props.uniswap_to === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_to].addr,
                                  lock: "to"
                                })
                              }
                            }}
                            placeholder={props.uniswap_to}
                          />
                        </Box>
                      </Box>
                      <Box as="tr">
                        {props.ongoing[
                          `uniswap_tokens_${
                            props[`${props.address_in_use}_selected`]
                          }`
                        ] ? (
                          <Box
                            p={2}
                            color="white"
                            bg={"#DC6BE5"}
                            as="td"
                            colSpan={3}
                            textAlign="center"
                          >
                            <Flex justifyContent="center" alignItems="center">
                              <Box as="i" className="fas fa-spin fa-sync" />
                            </Flex>
                          </Box>
                        ) : (
                          <Box
                            p={2}
                            color="white"
                            bg={isSwappable ? "#DC6BE5" : "#999"}
                            sx={{ ...(isSwappable ? btn : {}) }}
                            as="td"
                            colSpan={3}
                            textAlign="center"
                            onClick={() => {
                              if (isSwappable) {
                                props.uniswap_tokens({
                                  from:
                                    props.uniswap_from === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_from].addr,
                                  to:
                                    props.uniswap_to === "ETH"
                                      ? null
                                      : token_addrs[props.uniswap_to].addr,

                                  amount: props.uniswap_from_amount * 1,
                                  to_amount: props.uniswap_to_amount * 1
                                })
                              }
                            }}
                          >
                            <Flex justifyContent="center" alignItems="center">
                              <Image
                                src="/static/images/uniswap.png"
                                mr={2}
                                height="20px"
                              />
                              Swap Tokens
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </React.Fragment>
              )}
              <Text lineHeight="150%" color="#DC6BE5">
                The token needs to be unlocked so uniswap is allowed to transfer
                on behalf of you. Unlock first, then try swapping. The actual
                swapped amount may vary depending on changes made to the pools
                before your transaction. There is also 0.3% transaction fee
                deducted by Uniswap. When exchanging ETH with MetaMask, do not
                enter the maximam amount because you need to pay for the Gas
                too. Authereum requires no Gas at the moment. The slippage is
                automatically set to 0.5%.
              </Text>
            </Box>
          </Box>
        </Flex>
        {footer}
      </ThemeProvider>
    )
  },
  [
    "address_in_use",
    "eth_selected",
    "auth_selected",
    "uniswap_to",
    "uniswap_from",
    "uniswap_to_amount",
    "uniswap_from_amount",
    "user_balances",
    "uniswap_allowances",
    "new_allowance",
    "auth_init",
    "web3_network",
    "ongoing",
    "token_prices",
    "input_lock"
  ],
  [
    "tracker",
    "connectAuthereum",
    "disconnectAuthereum",
    "hookWeb3",
    "set",
    "merge",
    "checkUniswap",
    "uniswap_tokens",
    "switchWallet",
    "changeUniswapAllowance",
    "getTokenPrices"
  ]
)
