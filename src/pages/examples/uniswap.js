import { Box, Flex, Text, Image, Button } from "rebass"
import Nav from "../../../components/Nav"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Wallet from "../../../components/Wallet"
import Uniswap from "../../../components/Uniswap"
import Status from "../../../components/Status"
import Balances from "../../../components/Balances"
import SelectWallet from "../../../components/SelectWallet"
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
import { SMENU } from "../../lib/const"

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
                balances: tokens
              }
            },
            uniswap_allowances: {
              dep: ["eth_updated"],
              func: checkUniswapAllowance,
              args: {
                balances: tokens
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
    const footer = (
      <Flex
        color="white"
        bg="#DC6BE5"
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
    const uniswap_note =
      "The token needs to be unlocked so uniswap is allowed to transfer on behalf of you. Unlock first, then try swapping. The actual swapped amount may vary depending on changes made to the pools before your transaction. There is also 0.3% transaction fee deducted by Uniswap. When exchanging ETH with MetaMask, do not enter the maximam amount because you need to pay for the Gas too. Authereum requires no Gas at the moment. The slippage is automatically set to 0.5%."
    const TMENU = [
      {
        index: 1,
        text: `UNISWAP Example`,
        icon: "/static/images/uniswap.png"
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
            <Status />
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
              />
            </Box>
            <Box p={3} width={[1, null, 0.5]}>
              <Text color="#DC6BE5" mb={2}>
                3. Swap Tokens with Uniswap
              </Text>
              <Uniswap tokens={tokens} note={uniswap_note} />
            </Box>
          </Flex>
          {footer}
        </ThemeProvider>
      </Nav>
    )
  },
  [
    "address_in_use",
    "eth_selected",
    "auth_selected",
    "user_balances",
    "auth_init",
    "web3_network",
    "ongoing",
    "uniswap_to",
    "uniswap_from",
    "uniswap_to_amount",
    "uniswap_from_amount",
    "uniswap_allowances",
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
    "switchWallet",
    "changeUniswapAllowance",
    "getTokenPrices",
    "checkUniswap",
    "uniswap_tokens"
  ]
)
