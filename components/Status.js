import { Box, Flex, Text, Image, Button } from "rebass"
import { ThemeProvider } from "emotion-theming"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
import { ethereum_networks, socials } from "../lib/const"
import conf from "../src/conf"

const Status = binder(
  props => {
    return (
      <Box
        p={3}
        textAlign="center"
        color="#333"
        bg="#eee"
        width={1}
        mb={3}
        lineHeight="180%"
      >
        {R.all(R.xNil)([
          props._network || props.web3_network,
          props.eth_selected
        ]) ? (
          <React.Fragment>
            <Box as="i" color="#4CAF50" className="fa fa-circle" mr={1} />
            MetaMask Connected to{" "}
            {ethereum_networks[
              props._network || props.web3_network
            ].toUpperCase()}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box as="i" color="#FF4C2F" className="fa fa-circle" mr={1} />
            Connect MetaMask to{" "}
            {(
              ethereum_networks[props._network || conf.web3.network] || ""
            ).toUpperCase()}
          </React.Fragment>
        )}{" "}
        <Box as="br" display={["block", "none"]} />
        {R.xNil(props.auth_selected) ? (
          <React.Fragment>
            <Box
              as="i"
              color="#4CAF50"
              className="fa fa-circle"
              mr={1}
              ml={[0, 3]}
            />
            Authereum Connected
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box
              as="i"
              color="#FF4C2F"
              className="fa fa-circle"
              mr={1}
              ml={[0, 3]}
            />
            Authereum Not Connected
          </React.Fragment>
        )}
      </Box>
    )
  },
  ["user", "auth_selected", "eth_selected", "web3_network"],
  []
)

export default Status
