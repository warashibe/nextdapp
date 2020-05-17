import { Box, Flex, Text, Image, Button } from "rebass"
import Nav from "../../../components/Nav"
import moment from "moment"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Wallet from "../../../components/Wallet"
import Balances from "../../../components/Balances"
import Status from "../../../components/Status"
import SelectWallet from "../../../components/SelectWallet"
import Uniswap from "../../../components/Uniswap"
import conf from "../../conf"
import { checkBalance, checkWallet } from "../../../lib/_epic/web3"
import { devCheckBalance } from "../../../lib/_epic/dev"
import {
  autoCheckUniswap,
  checkUniswapAllowance
} from "../../../lib/_epic/uniswap"
import { SMENU } from "../../lib/const"
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
    img: "dev.png",
    key: "DEV",
    addr: "0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26"
  },
  {
    img: "dai.png",
    key: "DAI",
    addr: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  }
]
const token_addrs = R.indexBy(R.prop("key"))(tokens)
const token_keys = R.indexBy(R.prop("addr"))(tokens)
const properties = [
  {
    token_name: "alis",
    name: "alis",
    symbol: "ALISAPI",
    address: "0x55f31498d9de5e738e52CCbC393196FA9e16e62D"
  },
  {
    token_name: "fssweet",
    symbol: "FSSWEET",
    name: "firestore-sweet",
    address: "0x5D251F81E3810FA894b3EBee772CD76a52fD89fb"
  },
  {
    token_name: "ramdam",
    name: "ramdam",
    symbol: "RAMDAM",
    address: "0xB568630d96ca52Ea08dF5d3b1f8A65881F2dB320"
  }
]

const prop_keys = R.indexBy(R.prop("address"))(properties)
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
                balances: tokens
              }
            },
            dev: {
              dep: ["eth_updated"],
              func: devCheckBalance,
              args: { properties }
            },
            dev_allowances: {
              dep: ["eth_updated"],
              func: checkUniswapAllowance,
              args: {
                balances: tokens,
                _network: "1"
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
                tokens: token_addrs,
                _network: "1"
              }
            }
          }
        })
        props.hookWeb3({ _network: "1" })
        props.getTokenPrices({
          token_ids: ["ethereum", "dai"],
          currencies: ["usd"]
        })
      })
    }, [])
    const properties_sorted = R.sortBy(v => {
      return (
        (R.hasPath(["dev_balances", v.address])(props)
          ? props.dev_balances[v.address].total
          : 0) * -1
      )
    })(properties)

    const footer = (
      <Flex
        color="white"
        bg="#cb3837"
        width={1}
        flexWrap="wrap"
        p={3}
        id="footer"
      >
        <Box textAlign="center" width={1}>
          <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )
    const TMENU = [
      {
        index: 1,
        text: `DEV Example`,
        icon: "/static/images/dev.png"
      }
    ]

    return (
      <Nav
        side_border_color="#008080"
        side_selected={`uniswap`}
        outerElms={["nav", "footer"]}
        side_width={225}
        side_text_color="#03414D"
        size="sx"
        SMENU={SMENU}
        TMENU={TMENU}
        side_selected_color="#008080"
        pre_title="Next"
        pre_title_color="rgb(240, 236, 212)"
        post_title="Dapp"
        fontSize="18px"
        bg_side="#72DFD0"
        regular_border="#008080"
        selected_border="#3A7CEC"
        bg_top="#03414D"
        title_logo="/static/images/icon-128x128.png"
      >
        <ThemeProvider theme={preset}>
          <Flex flexWrap="wrap">
            <Status _network="1" />
            <Box p={3} width={[1, null, 0.5]}>
              <Text color="#FF4C2F" mb={2}>
                1. Choose Wallet (MetaMask or Authereum)
              </Text>
              <SelectWallet />
              <Text color="#4CAF50" mb={2} mt={4}>
                2. Unlock to grant permission to Uniswap
              </Text>
              <Balances
                allowances={props.uniswap_allowances}
                changeAllowance={props.changeUniswapAllowance}
                tokens={tokens}
                _network="1"
              />
              <Text color="#DC6BE5" mb={2} mt={4}>
                3. Get DEV Token with Uniswap
              </Text>
              <Uniswap tokens={tokens} _network="1" />
            </Box>
            <Box p={3} width={[1, null, 0.5]}>
              <Box mb={2} color="#CB3837">
                4. Stake DEV token and earn rewards
              </Box>
              {R.addIndex(R.map)((v, i) => {
                const isSwappable =
                  R.hasPath(["user_balances", "DEV", "balance"])(props) &&
                  R.hasPath(["dev_amounts", v.address])(props) &&
                  N(+props.dev_amounts[v.address]).lte(
                    props.user_balances.DEV.balance
                  ) &&
                  +props.dev_amounts[v.address] !== 0 &&
                  props.ongoing[
                    `dev_stake_${v.address}_${
                      props[`${props.address_in_use}_selected`]
                    }`
                  ] !== true
                const showSwappable =
                  R.hasPath(["dev_balances", v.address])(props) &&
                  +props.dev_balances[v.address].withdrawal === 0
                const isCancellable =
                  R.hasPath(["dev_balances", v.address])(props) &&
                  props.dev_balances[v.address].you > 0 &&
                  +props.dev_balances[v.address].withdrawal === 0
                const isCancelled =
                  R.hasPath(["dev_balances", v.address])(props) &&
                  props.dev_balances[v.address].you > 0 &&
                  +props.dev_balances[v.address].withdrawal !== 0
                const isReward =
                  R.hasPath(["dev_balances", v.address])(props) &&
                  +props.dev_balances[v.address].reward !== 0
                const isWithdrawable =
                  isCancelled &&
                  +props.dev_balances[v.address].withdrawal -
                    props.web3_block <=
                    0
                const overPrice =
                  R.hasPath(["user_balances", "DEV", "balance"])(props) &&
                  R.hasPath(["dev_amounts", v.address])(props) &&
                  N(+props.dev_amounts[v.address]).gt(
                    props.user_balances.DEV.balance
                  ) &&
                  +props.dev_amounts[v.address] !== 0
                return (
                  <Box
                    sx={{ borderRadius: "3px", border: "1px solid #CB3837" }}
                    mb={3}
                  >
                    <Flex
                      p={2}
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #cb3837, #d6524b, #e0695f, #e97f74, #f1948a)"
                      }}
                      color="white"
                    >
                      <Flex
                        flex={1}
                        as="a"
                        target="_blank"
                        href={`https://npmjs.com/package/${v.name}`}
                        sx={{ textDecoration: "none" }}
                        fontWeight="bold"
                        color="white"
                        fontSize="16px"
                      >
                        {v.name}
                        <Box
                          as="i"
                          className="fas fa-external-link-alt"
                          ml={2}
                          fontSize="11px"
                          sx={{ alignSelf: "flex-start" }}
                        />
                      </Flex>
                      <Image
                        alt="npm"
                        src={`https://img.shields.io/npm/dw/${v.name}`}
                        ml={3}
                      />
                    </Flex>
                    <Flex p={3} justifyContent="center" flexWrap="wrap">
                      <Box display="inline-block" textAlign="center" mr="3">
                        <Box color="#999" fontSize="12px">
                          TOTAL
                        </Box>
                        <Box fontSize="25px" color="#cb3837">
                          {R.hasPath(["dev_balances", v.address])(props)
                            ? props.dev_balances[v.address].total
                            : 0}{" "}
                          <Box color="#333" fontSize="16px" as="span">
                            DEV
                          </Box>
                        </Box>
                      </Box>
                      <Box display="inline-block" textAlign="center" mr="3">
                        <Box color="#999" fontSize="12px">
                          YOU
                        </Box>
                        <Box fontSize="25px" color="#cb3837">
                          {R.hasPath(["dev_balances", v.address])(props)
                            ? props.dev_balances[v.address].you
                            : 0}{" "}
                          <Box color="#333" fontSize="16px" as="span">
                            DEV
                          </Box>
                        </Box>
                      </Box>
                      <Box display="inline-block" textAlign="center" mr="3">
                        <Box color="#999" fontSize="12px">
                          REWARD
                        </Box>
                        <Box fontSize="25px" color="#cb3837">
                          {R.hasPath(["dev_balances", v.address])(props)
                            ? props.dev_balances[v.address].reward
                            : 0}{" "}
                          <Box color="#333" fontSize="16px" as="span">
                            DEV
                          </Box>
                        </Box>
                      </Box>

                      <Flex
                        width={[1, "auto", 1, "auto"]}
                        display="inline-block"
                        alignItems="center"
                        justifyContent="center"
                        mt={[3, 0, 3, 0]}
                      >
                        {showSwappable ? (
                          <Flex alignItems="center">
                            <Input
                              color={overPrice ? "#CB3837" : "#333"}
                              width="70px"
                              sx={{
                                border: `1px solid ${
                                  isSwappable ? "#cb3837" : "#999"
                                }`,
                                borderRadius: "3px 0 0 3px"
                              }}
                              onChange={e => {
                                if (R.isNaN(e.target.value * 1) == false) {
                                  props.set(e.target.value, [
                                    "dev_amounts",
                                    v.address
                                  ])
                                }
                              }}
                            />
                            <Flex
                              sx={{
                                border: `1px solid ${
                                  isSwappable ? "#cb3837" : "#999"
                                }`,
                                borderRadius: "0 3px 3px 0",
                                ...(isSwappable ? btn : {})
                              }}
                              alignItems="center"
                              justifyContent="center"
                              bg={isSwappable ? "#cb3837" : "#999"}
                              p={2}
                              color="white"
                              onClick={() => {
                                if (isSwappable) {
                                  props.devStake({
                                    amount: props.dev_amounts[v.address],
                                    token_address: v.address
                                  })
                                }
                              }}
                            >
                              {props.ongoing[
                                `dev_stake_${v.address}_${
                                  props[`${props.address_in_use}_selected`]
                                }`
                              ] ? (
                                <Box as="i" className="fas fa-spin fa-sync" />
                              ) : (
                                "Stake"
                              )}
                            </Flex>
                          </Flex>
                        ) : null}
                        {!isCancellable ? null : (
                          <Flex
                            ml={2}
                            sx={{
                              border: `1px solid ${
                                isCancellable ? "#cb3837" : "#999"
                              }`,
                              borderRadius: "3px",
                              ...(isCancellable ? btn : {})
                            }}
                            alignItems="center"
                            justifyContent="center"
                            bg={isCancellable ? "#cb3837" : "#999"}
                            p={2}
                            color="white"
                            onClick={() => {
                              if (isCancellable) {
                                props.devCancel({
                                  token_address: v.address
                                })
                              }
                            }}
                          >
                            {props.ongoing[
                              `dev_cancel_${v.address}_${
                                props[`${props.address_in_use}_selected`]
                              }`
                            ] ? (
                              <Box as="i" className="fas fa-spin fa-sync" />
                            ) : (
                              "Cancel"
                            )}
                          </Flex>
                        )}
                        {!isReward ? null : (
                          <Flex
                            ml={2}
                            sx={{
                              border: `1px solid #cb3837`,
                              borderRadius: "3px",
                              ...btn
                            }}
                            alignItems="center"
                            justifyContent="center"
                            bg={"#cb3837"}
                            p={2}
                            color="white"
                            onClick={() => {
                              if (isReward) {
                                props.devWithdrawInterest({
                                  token_address: v.address
                                })
                              }
                            }}
                          >
                            {props.ongoing[
                              `dev_withdrawInterest_${v.address}_${
                                props[`${props.address_in_use}_selected`]
                              }`
                            ] ? (
                              <Box as="i" className="fas fa-spin fa-sync" />
                            ) : (
                              "Get"
                            )}
                          </Flex>
                        )}
                        {!isWithdrawable ? null : (
                          <Flex
                            ml={2}
                            sx={{
                              border: `1px solid #cb3837`,
                              borderRadius: "3px",
                              ...btn
                            }}
                            alignItems="center"
                            justifyContent="center"
                            bg={"#cb3837"}
                            p={2}
                            color="white"
                            onClick={() => {
                              if (isWithdrawable) {
                                props.devWithdraw({
                                  token_address: v.address
                                })
                              }
                            }}
                          >
                            {props.ongoing[
                              `dev_withdraw_${v.address}_${
                                props[`${props.address_in_use}_selected`]
                              }`
                            ] ? (
                              <Box as="i" className="fas fa-spin fa-sync" />
                            ) : (
                              "Withdraw"
                            )}
                          </Flex>
                        )}
                      </Flex>
                      {isCancelled ? (
                        <Flex
                          color="#cb3837"
                          justifyContent="center"
                          pt={2}
                          width={1}
                          flexWrap="wrap"
                        >
                          <Text textAlign="center">
                            {+props.dev_balances[v.address].withdrawal -
                              props.web3_block}{" "}
                            blocks to withdrawal
                          </Text>
                        </Flex>
                      ) : null}
                    </Flex>
                  </Box>
                )
              })(properties_sorted)}
              <Box mb={2} color="#CB3837" lineHeight="150%">
                Once you stake, you can cancell it anytime but you will only be
                able to withdraw your stake 1 month after the cancellation. Read
                the{" "}
                <Box
                  as="a"
                  href="https://github.com/dev-protocol/protocol/blob/master/docs/WHITEPAPER.md"
                  target="_blank"
                >
                  whitepaper
                </Box>{" "}
                carefully for how it works.
              </Box>
            </Box>
          </Flex>
          {footer}
        </ThemeProvider>
      </Nav>
    )
  },
  [
    "web3_block",
    "address_in_use",
    "eth_selected",
    "auth_selected",
    "user_balances",
    "auth_init",
    "web3_network",
    "ongoing",
    "input_lock",
    "dev_balances",
    "dev_amounts",
    "uniswap_to",
    "uniswap_from",
    "uniswap_to_amount",
    "uniswap_from_amount",
    "uniswap_allowances",
    "token_prices",
    "input_lock"
  ],
  [
    "devStake",
    "devWithdraw",
    "devWithdrawInterest",
    "tracker",
    "connectAuthereum",
    "disconnectAuthereum",
    "hookWeb3",
    "set",
    "merge",
    "switchWallet",
    "changeUniswapAllowance",
    "devCreateProperty",
    "checkUniswap",
    "uniswap_tokens",
    "getTokenPrices",
    "checkUniswap",
    "uniswap_tokens",
    "devCancel"
  ]
)
