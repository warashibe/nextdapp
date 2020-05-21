import { ThemeProvider } from "emotion-theming"
import N from "bignumber.js"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import { Image, Text, Box, Flex } from "rebass"
import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"

const Uniswap = binder(
  props => {
    const token_addrs = R.indexBy(R.prop("key"))(props.tokens)
    const token_keys = R.indexBy(R.prop("addr"))(props.tokens)
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

    const isSwappable =
      !R.any(R.equals(0))([
        +props.uniswap_from_amount,
        +props.uniswap_to_amount
      ]) &&
      R.hasPath(["user_balances", props.uniswap_from, "balance"])(props) &&
      N(+props.uniswap_from_amount).lte(
        props.user_balances[props.uniswap_from].balance
      ) &&
      (props.uniswap_from === "ETH" ||
        (R.hasPath(["uniswap_allowances", props.uniswap_from, "allowance"])(
          props
        ) &&
          N(+props.uniswap_from_amount).lte(
            props.uniswap_allowances[props.uniswap_from].allowance
          )))

    return (
      <ThemeProvider theme={preset}>
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
                  ? `Rate: 1 ${props.uniswap_from} = ${getPrice(props)[0]} ${
                      props.uniswap_to
                    } = ${getPrice(props)[1]} USD`
                  : "Rate: -"}
              </Text>

              <Box as="table" width={1} mb={R.xNil(props.note) ? 3 : 0}>
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
                        )(props.tokens)}
                      </Select>
                    </Box>
                    <Box
                      as="td"
                      width="40px"
                      textAlign="center"
                      rowSpan={2}
                      sx={{ ...btn }}
                      onClick={() => {
                        props.set({
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
                        onChange={e => props.set(e.target.value, "uniswap_to")}
                      >
                        {R.compose(
                          R.map(v => {
                            return <option value={v}>{v}</option>
                          }),
                          R.filter(v => v !== props.uniswap_from),
                          R.concat(["ETH"]),
                          R.pluck("key")
                        )(props.tokens)}
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
                              _network: props._network,
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
                              _network: props._network,
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
          {R.xNil(props.note) ? (
            <Text lineHeight="150%" color="#DC6BE5">
              {props.note}
            </Text>
          ) : null}
        </Box>
      </ThemeProvider>
    )
  },
  [
    "address_in_use",
    "eth_selected",
    "auth_selected",
    "user_balances",
    "ongoing",
    "uniswap_to",
    "uniswap_from",
    "uniswap_to_amount",
    "uniswap_from_amount",
    "uniswap_allowances",
    "token_prices",
    "input_lock"
  ],
  ["set", "getTokenPrices", "checkUniswap", "uniswap_tokens"]
)

export default Uniswap
