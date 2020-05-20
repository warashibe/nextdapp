import { Box, Flex, Text, Image, Button } from "rebass"
import { socials } from "../lib/const"
import R from "ramdam"
const socials_map = R.indexBy(R.prop("key"))(socials)
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import binder from "../src/lib/binder"

export default binder(
  props => {
    return (
      <Flex justifyContent="center" flexWrap="wrap" px={3}>
        <Box width={1} textAlign="center">
          <Image mt={2} width="300px" src={props.uport.qr} />
        </Box>
        <Box textAlign="center" mb={3} width={1}>
          Scan QR Code with your uPort App.
        </Box>
        <Box textAlign="center" mb={3} width={1}>
          You need a crypto-antique certificate for testnet. Get one{" "}
          <Box
            as="a"
            target="_blank"
            href="https://testnet-ssi.warashibe.market/"
          >
            here
          </Box>
          .
        </Box>
        <Flex width={1} px={3} justifyContent="center" alignItems="flex-start">
          <Flex
            flex={1}
            color="white"
            height="38px"
            mx={2}
            bg={socials_map["uport"].bg}
            sx={{ ...btn, borderRadius: "3px" }}
            onClick={() => {
              props.set(null, "uport")
            }}
            justifyContent="center"
            alignItems="center"
          >
            Back
          </Flex>
          <Box
            sx={{ ...btn }}
            as="a"
            href="https://play.google.com/store/apps/details?id=com.uportMobile&hl=ja"
            target="_blank"
            mx={2}
          >
            <Image src="/static/images/android.svg" />
          </Box>
          <Box
            sx={{ ...btn }}
            as="a"
            href="https://itunes.apple.com/jp/app/uport-id/id1123434510?mt=8"
            target="_blank"
            mx={2}
          >
            <Image src="/static/images/apple.svg" />
          </Box>
        </Flex>
      </Flex>
    )
  },
  ["uport"],
  ["set"]
)
