---
id: global-states
title: Global States
sidebar_label: Global States
---


`bind` binds a component to `Global States`. `count` is not a local state. It consists globally.

`set` can change global states and other components get the state changes.

Global states are basically [Recoil Atoms](https://recoiljs.org/docs/basic-tutorial/atoms).


```javascript
import { bind } from "nd"

export default bind(
  ({ set, count }) => (
    <div
      onClick={() => set((count || 0) + 1, "count")}
    >
      add count: {count || 0}
    </div>
  ),
  ["count"]
)
```

This is not easy to do with a bare React App.

```javascript
import { bind } from "nd"

/* Counter component will get the same "count" value as the default component */
const Counter = bind(({ count }) => <span>{count || 0}</span>, ["count"])

export default bind(
  ({ set, count }) => (
    <div
      onClick={() => set((count || 0) + 1, "count")}
    >
      click to add count: <Counter />
    </div>
  ),
  ["count"]
)
```

You can also set an initial value on the fly. It doesn't work if the initial value is a function or an array whose first member is a function. They are recognized as "Global Functions".

```javascript
import { bind } from "nd"

export default bind(
  ({ set, count }) => (
    <div
      onClick={() => set(count + 1, "count")}
    >
      add count: {count}
    </div>
  ),
  [{ "count" : 10 }]
)
```

### Predefine global states

Global states can be predefined and initialized in `/nd/init.js`.

```javascript
export default {
  count1 : 1,
  count2 : 2
}
```

