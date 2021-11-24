---
id: set
title: set
sidebar_label: set
---

`set` can reactively change "Global States". 

There are two places you will get `set`.
* inside `Global Functions`
* inside bound Components

```javascript
import { bind } from "nd"

export default bind(
  ({ init, set }) => { // bound Components will get "set"
    const fn = init() // initialize Global Functions
    return (
      <div onClick={fn.func}>execute func</div>
	  <div
      onClick={() => {
        set((state || 0) + 1, "state") // increment "state"
      }}
    >
	 increment state
    </div>
    )
  },
  [
    "state",
    {
      func: ({ get, set }) => { // Global Functions will get "set
        set((get("state") || 0) + 1, "state") // increment "state"
      }
    }
  ]
)
```

## set ( new_value, state_name )

To set a single `Global State`, use this grammar.

```javascript
set("new_value", state)
```

## set ( object )

To set multiple `Global States`, use this grammar.

```javascript
set({ state1: "new_value1", state2: "new_value2", state3: "new_value3" })
```
