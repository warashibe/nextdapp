import { ThemeProvider } from "emotion-theming"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
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

const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
const SelectWallet = binder(
  props => {
    const connectAuth = `${
      R.isNil(props.auth_selected) ? "Connect" : "Disconnect"
    } Authereum`
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
                <option
                  value="eth"
                  selected={props.address_in_use === "eth" ? "selected" : ""}
                >
                  {props.eth_selected}
                </option>
              )}
              {R.isNil(props.auth_selected) ? null : (
                <option
                  value="auth"
                  selected={props.address_in_use === "auth" ? "selected" : ""}
                >
                  {props.auth_selected}
                </option>
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

    return (
      <Box p={3} sx={{ border: "1px solid #FF4C2F", borderRadius: "3px" }}>
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
    )
  },
  ["auth_init", "auth_selected", "user", "eth_selected", "address_in_use"],
  ["switchWallet", "connectAuthereum", "disconnectAuthereum"]
)
export default SelectWallet
