import { Box, Flex, Text, Image, Button } from "rebass"

import binder from "../src/lib/binder"
import React, { useEffect, useMemo, useState } from "react"
import R from "ramdam"

const serialize = nodes => nodes.map(n => Node.string(n)).join("\n")
import { Node } from "slate"
import ReactHtmlParser from "react-html-parser"
const marked = require("marked")
export default props => {
  const value = props.value || []
  let __html = ReactHtmlParser(marked(serialize(value)))
  let AceEditor
  if (props.mounted) {
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
        props.setValue(new_value)
        props.set(new_value, "blog_editor_value")
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
  return (
    <Box
      p={3}
      className="markdown-body"
      height={props.height}
      sx={{ overflow: "auto" }}
    >
      {__html}
    </Box>
  )
}
