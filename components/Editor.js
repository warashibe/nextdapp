import { Box, Flex, Text, Image, Button } from "rebass"
import binder from "../src/lib/binder"
import React, { useEffect, useMemo, useState } from "react"
import R from "ramdam"
import { createEditor } from "slate"
import { Slate, Editable, withReact } from "slate-react"

export default binder(
  props => {
    const [value, setValue] = useState([
      { type: "paragraph", children: [{ text: "" }] }
    ])
    const editor = useMemo(() => withReact(createEditor()), [])
    useEffect(() => {
      props.set(editor, "blog_editor")
      setValue(
        R.isEmpty(props.init_value) || R.isNil(props.init_value)
          ? [{ type: "paragraph", children: [{ text: "" }] }]
          : props.init_value
      )
      props.set(setValue, "blog_setValue")
    }, [])
    const onChange = _value => {
      setValue(_value)
      props.set(_value, "blog_editor_value")
    }
    return (
      <Slate editor={editor} value={value} onChange={onChange}>
        <Editable style={props.editor_style || {}} />
      </Slate>
    )
  },
  [],
  ["set"]
)
