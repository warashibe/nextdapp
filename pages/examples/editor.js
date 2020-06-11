import { Box, Flex, Text, Image, Button } from "rebass"
import Nav from "nd/nav/Nav"
import { SMENU } from "../../lib/const"
import useEventListener from "@use-it/event-listener"
import React, { useEffect, useMemo, useState } from "react"
import moment from "moment"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import bind from "nd/bind"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import conf from "nd/conf"
const marked = require("marked")
import ReactHtmlParser from "react-html-parser"
import { createEditor, Node } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"
import GithubMarkdown from "../../lib/css/GithubMarkdown"
import Preview from "nd/editor/Preview"
import Editor from "nd/editor/Editor"
export default bind(
  props => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
      setMounted(true)
    }, [])

    const footer = (
      <Flex
        id="footer"
        color="white"
        bg="#03414D"
        width={1}
        flexWrap="wrap"
        p={3}
      >
        <Box textAlign="center" width={1}>
          <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )
    const TMENU = [
      {
        index: 1,
        text: `WARASHIBE Editor`,
        icon: "/static/images/warashibe.png"
      }
    ]
    return (
      <Nav
        outerElms={["nav", "footer", "markdown-header"]}
        side_border_color="#008080"
        side_selected={`editor`}
        side_width={225}
        side_text_color="#03414D"
        size="sx"
        SMENU={SMENU}
        TMENU={TMENU}
        side_selected_color="#008080"
        pre_title="Next"
        pre_title_color="rgb(240, 236, 212)"
        post_title="Dapp"
        fontSize="18px"
        bg_side="#72DFD0"
        regular_border="#008080"
        selected_border="#3A7CEC"
        bg_top="#03414D"
        title_logo="/static/images/icon-128x128.png"
      >
        <ThemeProvider theme={preset}>
          <GithubMarkdown />
          <Flex width={1}>
            <Box width={0.5} sx={{ borderRight: "1px solid #ccc" }}>
              <Box
                width={1}
                p={2}
                textAlign="center"
                bg="#eee"
                id="markdown-header"
              >
                Markdown
              </Box>
              <Box
                width={1}
                p={3}
                height={props.innerHeight$nav}
                sx={{ overflow: "auto" }}
              >
                <Editor editor_style={{ height: "100%" }} />
              </Box>
            </Box>
            <Box width={0.5} sx={{ borderLeft: "1px solid #ccc" }}>
              <Box width={1} p={2} textAlign="center" bg="#eee">
                Preview
              </Box>
              <Preview
                set={props.set}
                setValue={props.blog_setValue$editor}
                mounted={mounted}
                value={props.blog_editor_value$editor}
                height={props.innerHeight$nav}
              />
            </Box>
          </Flex>
          {footer}
        </ThemeProvider>
      </Nav>
    )
  },
  [
    "blog_editor_value$editor",
    "blog_setValue$editor",
    "innerHeight$editor",
    "innerHeight$nav"
  ],
  []
)
