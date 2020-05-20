import { Box, Flex, Text, Image, Button } from "rebass"
import { socials } from "../lib/const"
import R from "ramdam"
const socials_map = R.indexBy(R.prop("key"))(socials)
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import binder from "../src/lib/binder"

export default binder(
  props => {
    return (
      <Flex textAlign="center">
        <Box p={3} width={1}>
          <Flex width={1} flexWrap="wrap">
            {R.map(v => (
              <Flex
                width={[1 / 2, null, 1 / 3, 1 / 2, 1 / 3]}
                color="white"
                p={2}
                alignItems="center"
              >
                <Box
                  onClick={() => props.login({ provider: v })}
                  flex={1}
                  p={3}
                  bg={socials_map[v].bg}
                  sx={{ ...btn, borderRadius: "3px" }}
                >
                  <Image
                    src={`/static/images/${socials_map[v].key}-white.png`}
                    height={["50px"]}
                  />
                  <Text mt={1}>
                    <Box fontSize="18px" fontWeight="bold">
                      {socials_map[v].name}
                    </Box>
                    <Box as="span" fontSize="12px">
                      Login with
                    </Box>
                  </Text>
                </Box>
              </Flex>
            ))(R.pluck("key")(socials))}
          </Flex>
        </Box>
      </Flex>
    )
  },
  [],
  ["login"]
)
