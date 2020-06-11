import Nav from "nd/nav/Nav"
import { Box, Flex, Text, Image, Button } from "rebass"
import N from "bignumber.js"
import bind from "nd/bind"
import { isFirebase } from "@nextdapp/firebase"
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Uniswap from "nd/uniswap/Uniswap"
import Balances from "nd/web3/Balances"
import Status from "nd/web3/Status"
import { checkBalance, checkWallet } from "@nextdapp/web3"
import { autoCheckUniswap, checkUniswapAllowance } from "@nextdapp/uniswap"
import { SMENU } from "../../lib/const"
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

export default bind(
  props => {
    useEffect(() => {
      isFirebase(props.conf).then(async () => {
        props.tracker({
          global: true,
          tracks: {
            user: {
              all: ["eth_updated$web3"],
              func: checkBalance,
              args: {
                balances: tokens
              }
            },
            uniswap_allowances: {
              all: ["eth_updated$web3"],
              func: checkUniswapAllowance,
              args: {
                balances: tokens
              }
            },
            check_uniswap_rate: {
              any: [
                "from$uniswap",
                "to$uniswap",
                "from_amount$uniswap",
                "to_amount$uniswap",
                "eth_updated$web3"
              ],
              func: autoCheckUniswap,
              args: {
                tokens: token_addrs
              }
            }
          }
        })

        props.hookWeb3$web3()
        props.getTokenPrices$uniswap({
          token_ids: ["ethereum", "dai", "chainlink"],
          currencies: ["usd"]
        })
      })
    }, [])
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
        <Flex flexWrap="wrap">
          <Status />
          <Box p={3} width={[1, null, 0.5]}>
            <Text color="#4CAF50" mb={2} mt={4}>
              1. Unlock to grant permission to Uniswap
            </Text>
            <Balances
              allowances={props.allowances$uniswap}
              changeAllowance={props.changeUniswapAllowance$uniswap}
              tokens={tokens}
            />
          </Box>
          <Box p={3} width={[1, null, 0.5]}>
            <Text color="#DC6BE5" mb={2}>
              2. Swap Tokens with Uniswap
            </Text>
            <Uniswap tokens={tokens} note={uniswap_note} />
          </Box>
        </Flex>
      </Nav>
    )
  },
  [
    "address_in_use$web3",
    "eth_selected$web3",
    "auth_selected$web3",
    "user_balances$web3",
    "auth_init$web3",
    "web3_network$web3",
    "ongoing$util",
    "to$uniswap",
    "from$uniswap",
    "to_amount$uniswap",
    "from_amount$uniswap",
    "allowances$uniswap",
    "token_prices$uniswap",
    "input_lock$uniswap"
  ],
  [
    "tracker",
    "connectAuthereum$web3",
    "disconnectAuthereum$web3",
    "hookWeb3$web3",
    "set",
    "changeUniswapAllowance$uniswap",
    "getTokenPrices$uniswap",
    "checkUniswap$uniswap",
    "uniswap_tokens$uniswap"
  ]
)
