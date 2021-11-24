---
id: plugin-util
title: util Plugin
sidebar_label: util
---

`util` has a very simple set of states and functions, but useful utilities are to be added.

## Installation

```javascript
nextdapp add util
```

## Global States

### `url`

represents the current url with [Node.js URL object](https://nodejs.org/api/url.html) if `getURL` is executed.

## Global Functions


### `getURL()`

gets the current page URL, parses it with [Node.js URL object](https://nodejs.org/api/url.html) and sets it to `url`.

## Regular Functions

### `xNil`

`xNil` means isNotNil. Only `null` and `undefined` are `false`.

It's equivalent to `complement(isNil)` in [Ramda](https://ramdajs.com).

```javascript
import { xNil } from "nd/util"

xNil(null) // false
xNil(undefined) // false
```

## Examples

```javascript
import { useEffect } from "react"
import { bind } from "nd"
import { xNil } from "nd/util"

export default bind(
  ({ url, init }) => {
    const { getURL } = init() // initialize global function as usual
    useEffect(() => {
      getURL() // call the function
    }, [])
    return <div>{ xNil(url) ? url.hostname : "" }</div> // show hostname
  },
  [ "url", "getURL" ] // bind predefined state and function
)
```
