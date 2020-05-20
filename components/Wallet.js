import { ThemeProvider } from "emotion-theming"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
import { Text, Box, Flex } from "rebass"

import Address from "./Address"

const Wallet = binder(
  props => {
    let ex = false

    let ads = R.compose(
      R.addIndex(R.map)((a, i) => {
        let connected = null
        if (R.includes(a.address)([props.eth_selected, props.auth_selected])) {
          ex = true
          connected = true
        }
        return <Address a={a} plus={false} connected={connected} index={i} />
      }),
      R.sortBy(v => v.address)
    )(props.user_addresses)
    let add = R.compose(
      R.map(address => (
        <Address a={{ address }} connected={true} plus={true} />
      )),
      R.filter(
        R.both(
          R.xNil,
          R.complement(R.includes)(
            R.__,
            R.pluck("address", props.user_addresses)
          )
        )
      )
    )([props.eth_selected, props.auth_selected])
    return (
      <ThemeProvider theme={preset}>
        <Box p={3}>
          <Box width={1} sx={{ textAlign: "center" }}>
            <Box display="inline-block" width={1}>
              <Box as="table" width={1}>
                <Box as="thead" sx={{ fontSize: "10px", color: "#555" }}>
                  <Box as="tr" bg="#4CAF50" color="#eee">
                    {R.isNil(props.user) ? null : (
                      <Box as="th" p={2} width="50px">
                        {props.text_use || "Main"}
                      </Box>
                    )}
                    <Box as="th" p={2}>
                      {props.text_address || "Address"}
                    </Box>
                    <Box as="th" p={2} />
                    {R.isNil(props.user) ? null : <Box as="th" p={2} />}
                  </Box>
                </Box>
                <Box as="tbody">
                  {add}
                  {ads}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    )
  },
  ["auth_selected", "eth_selected", "user", "user_addresses"],
  []
)
export default Wallet
