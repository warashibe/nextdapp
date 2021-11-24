---
id: global-functions
title: Global Functions
sidebar_label: Global Functions
---

See **[bind](/next-dapp/docs/bind)** doc for how to bind `Global Functions` to React Components.

## Arguments

`Global Functions` will alway get `val`, `props`, `set`, `conf` and `global`.

* `val` : arguments passed to the function execution.
* `props` : a snapshot of the Global States bound to the function.
* `set` : a setter for Global States.
* `get` : get current value of any Global State.
* `conf` : the configuration defined in `/nd/conf.js`.
* `global` : non-reactive globally shared object.
* `fn` : fn makes global functions chainable.

## Chain Global Functions

You can execute global functions inside a global function using `fn`.

`props` only gives a snapshot when the first function executes but global states might change during the chain of executions. When you chain functions, use `get` to access the current values of states. 

```javascript
export const add = ({ val, get }) => get("count") + val

export const multiply = ({ val, get, fn }) => fn(add)(3) * get("count2") * val
```

> If you are using `props` to read global states, you might as well rewrite it with `get` because if the ascessing value has changed between the execution of the first function and now, the value won't represent the current state.

## Predefine functions

Globally shared functions can be predefined in `/nd/custom.js`. Export as many as you like.

```javascript
export const add = ({ val, get, set }) => set(get("count") + val, "count")
```
