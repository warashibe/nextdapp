---
id: computed-values
title: Computed Values
sidebar_label: Computed Values
---

See **[bind](/next-dapp/docs/bind)** doc for how to bind `Computed Values` to React Components.

`Computed Values` are basically **[Recoil Selectors](https://recoiljs.org/docs/basic-tutorial/selectors)** and based upon multiple `Global States` which basically are **[Recoil Atoms](https://recoiljs.org/docs/basic-tutorial/atoms)**.

If you install `react@expoerimental` and `react-dom@experimental`, you can even use `async` functions to compute the value with **[React Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html)** (Suspense), which is not officially out to the stable version yet.

```javascript
import { bind } from "nd"

const Counter = bind(({ count1 }) => <span>{count1 || 0}</span>, ["count1"])
const Counter2 = bind(({ count2 }) => <span>{count2 || 0}</span>, ["count2"])

export default bind(
  ({ set, sum, init }) => {
    const fn = init()
    return (
      <div>
        <div onClick={() => fn.add({ num: 1, target: "count1" })}>
          click to add count1: <Counter />
        </div>
        <div onClick={() => fn.add({ num: 1, target: "count2" })}>
          click to add count2: <Counter2 />
        </div>
        <div>sum: {sum}</div>
      </div>
    )
  },
  [
    "count1",
    "count2",
    {
      add: [
        ({ val: { num, target }, get, set }) =>
          set((get(target) || 0) + num, target),
        ["count1", "count2"]
      ],
      sum: { // this is a Computed Value aka a Recoil Selector
        get: atoms => ({ get }) => {
          return (get(atoms.count1) || 0) + (get(atoms.count2) || 0)
        }
      }
    }
  ]
)
```

> Note that `get` used in computed values is different from `get` used in global functions. Computed values are just [Recoil secectors](https://recoiljs.org/docs/api-reference/core/selector), and you need to pass an `atom` to `get` with recoil selectors. It's a part of Recoil grammar. On the other hand, the `get` used in global functions in Next Dapp is a getter function to access global states where you pass a name of a global state as a String value.

