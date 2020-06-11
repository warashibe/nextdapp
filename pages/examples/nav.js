import { Box, Flex, Text, Image, Button } from "rebass"
import R from "ramdam"
import Nav from "nd/nav/Nav"
import bind from "nd/bind"
const icons = [
  "cat",
  "dog",
  "fish",
  "spider",
  "crow",
  "otter",
  "dragon",
  "dove",
  "hippo",
  "paw",
  "horse",
  "frog"
]
export default bind(
  props => {
    const tmenu = R.map(i => {
      return {
        index: i,
        text: `${icons[i]}`,
        key: `top-${i}`,
        awesome_icon: `fas fa-${icons[i]}`
      }
    })(R.range(0, 6))

    const smenu = R.map(i => {
      return {
        index: i,
        text: `${icons[i]}`,
        key: `side-${i}`,
        awesome_icon: `fas fa-${icons[i]}`
      }
    })(R.range(0, 12))
    return (
      <Nav
        size="sx"
        side_width={220}
        side_height={45}
        chosen={`top-3`}
        TMENU={tmenu}
        SMENU={smenu}
        side_selected="side-3"
        side_selected_color="#A2C856"
        pre_title="Next Dapp"
        pre_title_color="white"
        post_title="Nav"
        fontSize="22px"
        bg_side="#378F3A"
        selected_border="#A2C856"
        regular_border="#006132"
        bg_top="#11803E"
        title_logo="/static/images/icon-128x128.png"
      >
        <Box p={3}>Nav example</Box>
      </Nav>
    )
  },
  [],
  []
)
