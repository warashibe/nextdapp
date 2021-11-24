---
id: global
title: global
sidebar_label: global
---

There is a handy `global` object shared with every `bind` Component and function. The `global` object is not reactive but can be used to pass Class instances and large objects with circular structures. Changing `global` values won't trigger rendering of any components. `React` doesn't have a handy `global` object like this, but you don't want to expose anything to `window` object as it is accessible from the developer console. `global` is an internal object only shared with `Components` and `functions`.

```javascript
import { useEffect } from "react"
import { bind } from "nd"

const Count = bind(({ updated, set, init, global, conf }) => (
  <div>{global.count}</div>
))

export default bind(
  ({ set, init, global, conf }) => {
    useEffect(() => {
      global.count = 10
    }, [])
    return <Count />
  },
  [
    {
      log: ({ global, set, get, conf }) => {
        console.log(global.count)
      }
    }
  ]
)
```
