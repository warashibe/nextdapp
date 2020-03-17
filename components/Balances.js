import { ThemeProvider } from "emotion-theming"
import N from "bignumber.js"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
import { Image, Text, Box, Flex } from "rebass"
import { Radio } from "@rebass/forms"
import Status from "./Status"
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
                (R.hasPath(["allowances", v.key, "allowance"])(props) &&
                  N(+props.allowances[v.key].allowance).gt(
                    Math.pow(2, 100)
                  )) ? (
                  <Box as="td" bg="#4CAF50" color="white" p={2}>
                    <Box as="i" className="fas fa-lock-open" />
                  </Box>
                ) : props.ongoing[
                  `changeAllowance_${v.addr}_${
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
                      props.changeAllowance({
                        _network: props._network,
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
          })(R.concat([{ key: "ETH", img: "ethereum.png" }], props.tokens))}
        </Box>
      </Box>
    </Box>
  )

const Balances = binder(
  props => {
    return (
      <Box mb={3} sx={{ border: "1px solid #4CAF50", borderRadius: "3px" }}>
        <BalanceTable {...props} />
      </Box>
    )
  },
  [
    "user",
    "auth_selected",
    "eth_selected",
    "address_in_use",
    "user_balances",
    "ongoing"
  ],
  []
)

export default Balances
