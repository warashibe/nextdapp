---
id: tracker
title: Tracker
sidebar_label: Tracker
---

By inserting `Tracker` anywhere in your component, you can watch global states (Recoil atoms/selectors) and reactively execute a function when watching states change. This isn't easy to do without external state management libraries and complex setups, but Next Dapp makes it a breeze out of the box.

![](/next-dapp/img/diagram-2.png)

You can insert `Tracker` anywhere in your page components. `Tracker` doesn't render anything to the UI.

```javascript
<Tracker
  name="count_tracker"
  type="any"
  watch={["count1", "count2"]}
  func={({ set, get }) => {
    set(get("count1") * get("count2"), "product")
  }}
  />
```

A tracker `func` and `watch` are required.

`name` is optional but if you want to overwrite a previous `Tracker`, use the same name. If `name` is not given, md5 of the parameters is used to generate a unique name.

You can `watch` state changes in two ways.

type `all`: the function executes after **all** the specified states changed.

type `any`: the function executes when **any** one of the specified states changed.

The function defined as `func` is the same as custome functions explained above. You can change any global states using `set`. The function can be `async` and you can change any global states even if they are not bound to the component.

The example below watches `count1` and `count2` and whenever either of them changes, it executes a function to calculate the product.

```javascript
import { bind, Tracker } from "nd"

const Counter = bind(({ count1 }) => <span>{count1 || 0}</span>, ["count1"])
const Counter2 = bind(({ count2 }) => <span>{count2 || 0}</span>, ["count2"])

export default bind(
  ({ set, init, sum, product }) => {
    const fn = init()
    return (
      <div>
        <div onClick={() => fn.add({ num: 1, target: "count1" })}>
          click to add count1: <Counter />
        </div>
        <div onClick={() => fn.add({ num: 1, target: "count2" })}>
          click to add count2: <Counter2 />
        </div>
        <div>product: {product}</div>
        <Tracker
          name="count_tracker"
          type="any"
          watch={["count1", "count2"]}
          func={({ set, get }) => {
            set(get("count1") * get("count2"), "product")
          }}
        />
      </div>
    )
  },
  [
    "count1",
    "count2",
    "product",
    {
      add: ({ val: { num, target }, get, set }) =>
        set((get(target) || 0) + num, target)
    }
  ]
)
```

In this particular case, the same thing can be achieved with `Computed Values`, but the difference between `Tracker` and `Computed Values` is `Tracker` doesn't have to coumpute anything inside the function. It just so happens to `set` the `product` state but it can do any side effect tasks either synchronously or asynchronously.
