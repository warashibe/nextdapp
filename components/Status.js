import { Box, Flex, Text, Image, Button } from "rebass"
import { ThemeProvider } from "emotion-theming"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
import { ethereum_networks, socials } from "../lib/const"
import conf from "../src/conf"
import { Fragment } from "react"
const Status = binder(
  props => {
    const Cbtn = props => {
      return (
        <Fragment>
          <Flex
            p={1}
            width="45px"
            justifyContent="center"
            flexWrap="wrap"
            textAlign="center"
          >
            <Box width={1}>
              <Box as="i" color={props.ccolor} className="fa fa-circle" />
            </Box>
            <Box fontSize={"9px"} color={props.ccolor}>
              {props.msg}
            </Box>
          </Flex>
          <Box flex={[1, null, "auto"]} py={1} textAlign="left" px={2}>
            <Flex alignItems="center" flexWrap="wrap">
              <Box
                width={[1, null, "auto"]}
                fontSize="16px"
                fontWeight="bold"
                color={props.ccolor}
                pr={3}
                display="inline-block"
              >
                {props.name}
              </Box>
              <Box
                display="inline-block"
                fontSize="12px"
                width={[1, null, "auto"]}
              >
                {props.sub}
              </Box>
            </Flex>
            {R.isNil(props.address) ? null : (
              <Fragment>
                <Box
                  color="#666"
                  fontSize="14px"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                  width={1}
                >
                  {props.address}
                </Box>
              </Fragment>
            )}
          </Box>
        </Fragment>
      )
    }
    return (
      <Flex color="#333" width={1} lineHeight="130%">
        <Flex
          width={[1 / 2]}
          alignItems="center"
          bg="#eee"
          p={[1]}
          justifyContent={["flex-start", null, "center"]}
        >
          {R.all(R.xNil)([
            props._network || props.web3_network,
            props.eth_selected
          ]) ? (
            <Cbtn
              ccolor={props.address_in_use === "eth" ? "#4CAF50" : "#E9821C"}
              address={props.eth_selected}
              name="MetaMask"
              sub={
                <Flex>
                  {props.address_in_use !== "eth" ? (
                    <Box
                      sx={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        ":hover": { color: "#FF4C2F" }
                      }}
                      mr={2}
                      onClick={() => {
                        props.switchWallet({ type: "eth" })
                      }}
                    >
                      {props.text_use || `Use`}
                    </Box>
                  ) : null}
                  <Box>
                    {(
                      ethereum_networks[props._network || conf.web3.network] ||
                      ""
                    ).toUpperCase()}
                  </Box>
                </Flex>
              }
              msg={
                props.address_in_use === "eth"
                  ? props.text_using || `USING`
                  : props.text_on || `ON`
              }
            />
          ) : (
            <Cbtn
              ccolor="#FF4C2F"
              name="MetaMask"
              sub={(
                ethereum_networks[props._network || conf.web3.network] || ""
              ).toUpperCase()}
              msg={props.text_off || `OFF`}
            />
          )}
        </Flex>
        <Flex
          width={[1 / 2]}
          alignItems="center"
          bg="#ddd"
          p={[1]}
          justifyContent={["flex-start", null, "center"]}
        >
          {R.isNil(props.auth_selected) ? (
            <Cbtn
              ccolor="#FF4C2F"
              name="Authereum"
              msg={props.text_off || `OFF`}
              sub={
                <Flex>
                  <Box
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      ":hover": { color: "#FF4C2F" }
                    }}
                    mr={2}
                    onClick={() => {
                      props.connectAuthereum({ user: props.user, force: true })
                    }}
                  >
                    {props.text_connect || "Connect"}
                  </Box>
                  <Box
                    as="a"
                    target="_blank"
                    href={`https://${
                      conf.web3.network === "1" ? "" : "ropsten."
                    }authereum.com/signup`}
                    sx={{
                      color: "#222",
                      textDecoration: "underline",
                      cursor: "pointer",
                      ":hover": { color: "#FF4C2F" }
                    }}
                  >
                    {props.text_signup || "Sign up"}
                  </Box>
                </Flex>
              }
            />
          ) : (
            <Cbtn
              address={props.auth_selected}
              ccolor="#4CAF50"
              name="Authereum"
              msg={
                props.address_in_use === "auth"
                  ? props.text_using || `USING`
                  : props.text_on || `ON`
              }
              ccolor={props.address_in_use === "auth" ? "#4CAF50" : "#E9821C"}
              sub={
                <Flex>
                  {props.address_in_use !== "auth" ? (
                    <Box
                      sx={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        ":hover": { color: "#FF4C2F" }
                      }}
                      mr={2}
                      onClick={() => {
                        props.switchWallet({ type: "auth" })
                      }}
                    >
                      {props.text_use || `Use`}
                    </Box>
                  ) : null}
                  <Box
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => {
                      props.disconnectAuthereum({ user: props.user })
                    }}
                  >
                    {props.text_disconnect || `Disconnect`}
                  </Box>
                </Flex>
              }
            />
          )}
        </Flex>
      </Flex>
    )
  },
  ["user", "auth_selected", "eth_selected", "web3_network", "address_in_use"],
  ["connectAuthereum", "disconnectAuthereum", "set", "switchWallet"]
)

export default Status
