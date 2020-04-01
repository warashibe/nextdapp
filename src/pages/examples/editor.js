import { Box, Flex, Text, Image, Button } from "rebass"
import useEventListener from "@use-it/event-listener"
import React, { useEffect, useMemo, useState } from "react"
import moment from "moment"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import conf from "../../conf"
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
export default binder(
  props => {
    const [height, setHeight] = useState(300)
    const checkHeight = () => {
      let _height = window.innerHeight
      const h1 = document.getElementById("header")
      if (R.xNil(h1)) {
        const h2 = document.getElementById("footer")
        const h3 = document.getElementById("markdown-header")
        if (R.xNil(h1)) _height -= h1.offsetHeight
        if (R.xNil(h2)) _height -= h2.offsetHeight
        if (R.xNil(h3)) _height -= h3.offsetHeight
      } else {
        _height -= 134
      }
      setHeight(_height - 2)
    }
    useEventListener("resize", checkHeight)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
      setMounted(true)
      checkHeight()
    }, [])
    const editor = useMemo(() => withReact(createEditor()), [])
    const [value, setValue] = useState([
      {
        type: "paragraph",
        children: [{ text: "start typing here..." }]
      }
    ])
    const serialize = nodes => nodes.map(n => Node.string(n)).join("\n")
    const onChange = value => setValue(value)
    let __html = ReactHtmlParser(marked(serialize(value)))
    let AceEditor
    if (mounted) {
      AceEditor = require("react-ace").default
      require("brace/theme/monokai")
    }
    let index = 0
    __html = R.map(v => {
      if (
        v.type === "pre" &&
        R.xNil(v.props.children[0]) &&
        v.props.children[0].type === "code"
      ) {
        const text = v.props.children[0].props.children[0]
        const language = R.isNil(v.props.children[0].props.className)
          ? ""
          : v.props.children[0].props.className.split("-")[1]
        if (language !== "") {
          try {
            require(`brace/mode/${language}`)
          } catch (e) {}
        }
        const i = index
        const onChange2 = code => {
          const codes = code.split("\n")
          let incode = false
          let ci = 0
          let ci2 = 0
          let start = null
          let end = null
          for (let c of value) {
            const txt = c.children[0].text
            if (txt.match(/^```/) !== null && txt.match(/^```.*```/) === null) {
              if (incode === false) {
                incode = true
                if (i === ci2) {
                  start = ci
                }
              } else {
                if (i === ci2) {
                  end = ci
                }
                ci2 += 1
                incode = false
              }
            }
            ci += 1
          }
          let new_value =
            R.xNil(start) && R.xNil(end) && end - start > 1
              ? R.remove(start + 1, end - start - 1, value)
              : value
          new_value = R.insertAll(
            start + 1,
            R.map(t => {
              return { type: "paragraph", children: [{ text: t }] }
            })(codes)
          )(new_value)
          setValue(new_value)
        }
        return (
          <AceEditor
            style={{ marginBottom: "16px" }}
            width="100%"
            mode={language}
            value={text}
            theme="monokai"
            maxLines={Infinity}
            onChange={onChange2}
            name={`code_${index++}`}
            editorProps={{ $blockScrolling: true }}
          />
        )
      } else {
        return v
      }
    })(__html)
    const footer = (
      <Flex
        id="footer"
        color="white"
        bg="#198643"
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
    return (
      <ThemeProvider theme={preset}>
        <GithubMarkdown />
        <Flex
          id="header"
          width={1}
          bg="#198643"
          color="white"
          p={3}
          fontSize="18px"
          justifyContent="center"
          fontWeight="bold"
        >
          Warashibe Editor
        </Flex>
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
            <Box width={1} p={3} height={height} sx={{ overflow: "auto" }}>
              <Slate
                editor={editor}
                value={value}
                onChange={onChange}
                placeholder="start typing..."
              >
                <Editable />
              </Slate>
            </Box>
          </Box>
          <Box width={0.5} sx={{ borderLeft: "1px solid #ccc" }}>
            <Box width={1} p={2} textAlign="center" bg="#eee">
              Preview
            </Box>
            <Box
              p={3}
              className="markdown-body"
              height={height}
              sx={{ overflow: "auto" }}
            >
              {__html}
            </Box>
          </Box>
        </Flex>
        {footer}
      </ThemeProvider>
    )
  },
  [],
  []
)
