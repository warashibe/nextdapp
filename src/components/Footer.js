import { Box, Flex, Text, Image, Button } from "rebass"
export default () => (
  <Flex id="footer" color="white" bg="#03414D" width={1} flexWrap="wrap" p={3}>
    <Box textAlign="center" width={1}>
      <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
        © 2020 Next Dapp by Warashibe
      </Box>
    </Box>
  </Flex>
)
