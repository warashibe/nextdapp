---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

Next Dapp is just a [Next.js](https://nextjs.org) app, but on steroids with [recoil](https://recoiljs.org/) state management library.

Reactive global state management is out of the box, which usually requires  heavy setups with external libraries such as `redux`, `rxjs`, `mobX` and related libraries.

Next Dapp also is a plugin based system, which gives you a jump-start with your dapp development with one command integration with firestore dabase, user management, web3 / blockchain wallets, CMS / blog system and so many more.

We will call Next Dapp powered apps **nDapps** throughout the docs.

## Setup

### Installation

Use `npm` or `yarn` to globally install Next Dapp CLI Tools.

```bash
yarn global add nextdapp
```
To use plugins, you also need the `bit-bin` node package to be installed globally.

```bash
yarn global add bit-bin
```

### Create a Project

```bash
nextdapp create myapp
cd myapp
yarn
```

### Run Locally

```bash
yarn dev
```
Now your local app is running at [http://localhost:3000](http://localhost:3000)


---

## nDapp Tree

Next Dapp is built on top of [Next.js](https://nextjs.org) which is based upon [React](https://reactjs.org). You can develop nDapps in the same way you develop Next.js apps.

```text
.
├── pages/
│   └── index.js
├── public/
│   └── static/
│       ├── images/
│       ├── favicon.ico
│       └── manifest.json
├── nd/
│   ├── core/
│   ├── conf.js
│   ├── conf.local.js
│   ├── .nextdapp.js
│   ├── .nextdapp-props.js
│   └── .plugins.json
├── node_modules/
├── .gitignore
├── .nowignore
├── .bitmap
├── nd.js
├── package.json
├── next.config.js
├── now.json
└── jscofig.json

```

---

## App Development

### Hello, World!

Edit `/pages/index.js` for this tutorial.

```javascript
export default () => <div>Hello, World!</div>
```

### bind / set global states

`bind` binds a component to global states. `count` is not a local state. It consists globally.

`set` can change global states and other components get the state changes.

Global states are basically [recoil atoms](https://recoiljs.org/docs/basic-tutorial/atoms).


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
      add count: count
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

### bind functions

You can also bind functions.

To access global states inside the function, use `get`. 

The functions need to be initialized inside the component with `init()`.

```javascript
import { bind } from "nd"

const Counter = bind(({ count }) => <span>{count || 0}</span>, ["count"])

export default bind(
  ({ init, set, count }) => {
    const fn = init()
    return (
      <div onClick={() => fn.add(1)}>
        click to add count: <Counter />
      </div>
    )
  },
  [
    "count",
    {
      add: ({ val, get, set }) => set((get("count") || 0) + val, "count")
    }
  ]
)
```

### Predefine functions

Globally shared functions can be predefined in `/nd/custom.js`. Export as many as you like.

```javascript
export const add = ({ val, get, set }) =>
  set((get("count") || 0) + val, "count")
```

Pass the predefined function name as a String value. `bind` is smart enough to know which are `states` and which are `functions`.

```javascript
import { bind } from "nd"
const Counter = bind(({ count }) => <span>{count || 0}</span>, ["count"])

export default bind(
  ({ init, set, count }) => {
    const fn = init()
    return (
      <div onClick={() => fn.add(1)}>
        click to add count: <Counter />
      </div>
    )
  },
  [ "count", "add" ]
)
```

### Computed Values

You can also bind computed values which are basically [recoil selectors](https://recoiljs.org/docs/basic-tutorial/selectors) and based upon multiple global states.

Pass a `key : value` object with a `get` function inside the `value` as shown below.

`bind` will figure out it's a computed values.

These states used to compute the value has to be passed to the component as well. In the example below, `sum` uses `count1` and `count2` so both values are bound to the component. `get(count1)` returns the current value of `count1` inside the compute function. See the [recoil docs](https://recoiljs.org/docs/basic-tutorial/selectors) for details.

In the example, `sum` reactively cumputes the sum of `count1` and `count2` as soon as any of them changes.

If you install `react@expoerimental` and `react-dom@experimental`, you can even use `async` functions to compute the value with [React Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html) (Suspense), which is not officially out to the stable version yet.


```javascript
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
      add: ({ val: { num, target }, get, set }) =>
        set((get(target) || 0) + num, target),
      sum: {
        get: atoms => ({ get }) =>
          (get(atoms.count1) || 0) + (get(atoms.count2) || 0)
      }
    }
  ]
)
```

You can mix as many `states`, `functions`, `predefined state names`, `predefined function names` and "selectors (computed values)" as you like in any caotic order as the second argument.

`bind( Component, [ states, functions, selectors ] )`

![](/next-dapp/img/diagram-1.png)

### Tracker

By inserting `Tracker` anywhere in your component, you can watch global states (Recoil atoms/selectors) and reactively execute a function when watching states change. This isn't easy to do without external state management libraries and complex setups, but Next Dapp makes it a breeze out of the box.

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

`name` is optional but if you want to overwrite a previous `Tracker`, use the same name.

You can `watch` state changes in two ways.

type `all`: the function executes after **all** the specified states changed.

type `any`: the function executes when **any** one of the specified states changed.

The function defined as `func` is the same as custome functions explained above. You can change any global states using `set`. The function can be `async` and you can change any global states even if they are not bound to the component.

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
        <div>sum: {sum}</div>
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
        set((get(target) || 0) + num, target),
      sum: {
        get: atoms => ({ get }) => {
          return (get(atoms.count1) || 0) + (get(atoms.count2) || 0)
        }
      }
    }
  ]
)
```

![](/next-dapp/img/diagram-2.png)

### With TypeScript
There is currently no type definition file (.d.ts) for next-dapp specific API, 
but If you want to develop with TypeScript, run

```yarn add --dev typescript @types/react ```

and then add the following to tsconfig.json:
```json
{
  ...,
  "compilerOptions":{
    ...,
    "baseUrl":"./",
    ...,
  },
  ...,
}
```

## Plugins

nDapps get better with a wide range of plugins such as Firestore database, user management, web3 / blockchain integration, CMS with a developer friendly editor and so forth.

---

## Deploy

The best place to deploy your app is [Vercel Now](https://vercel.com).

```bash
now
```
