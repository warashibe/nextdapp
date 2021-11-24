---
id: todo-app
title: Todo App Example
sidebar_label: Todo App Example
---

We will create a very simple todo app using Next Dapp global states. We use [Ramda](https://ramdajs.com) throughout the app for concise data manipulations. Hopefully, it's clear and easy enough to understand even if you don't know Ramda.

![](/next-dapp/img/todo-app-5.png)

## Create an App and Run Locally

```
nextdapp create todo
cd todo
yarn
yarn dev
```

---

## Define `todos` global state

For this app, we only use one global state. Define it with an initial value in `/nd/init.js`. Each todo should have a `task` field and a unique `key` to identify.

```javascript
export default {
  todos: [{ task: "Add Todos to This List", key: 1 }]
}
```

> Anything you `export default` from `/nd/init.js` will be global states the app can watch and track.
> Under the hood, Next Dapp uses [Recoil Atoms](https://recoiljs.org/docs/basic-tutorial/atoms) to manage global states.

## Predefined Styles

For a pleasant presentation, I have predefined some styles to use for the app. Just copy and paste them somewhere above the app components in `/pages/index.js`. We also use some `Ramda` functions without any explanation. This part is irrelevant for the app, so please refer to the [Ramda Documentation](https://ramdajs.com/docs/) if you need to figure out what the functions do.

```javascript
import { o, map, addIndex, sortBy } from "ramda"

const btn = {
  width: "50px",
  cursor: "pointer",
  backgroundColor: "#ddd",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "5px"
}

const style = {
  container: { display: "flex", justifyContent: "center" },
  todos: {
    display: "flex",
    width: "300px",
    flexDirection: "column",
    margin: "20px"
  },
  newTask: { width: "300px", display: "flex", marginBottom: "10px" },
  input: { width: "250px", padding: "5px 10px" },
  add: { ...btn },
  todo: { width: "300px", display: "flex", margin: "2px 0" },
  task: {
    width: "250px",
    padding: "5px 10px",
    display: "flex",
    alignItems: "center",
    background: "#eee"
  },
  emptyBtn: {
    width: "50px",
    backgroundColor: "#ddd",
    padding: "5px"
  },
  btn: { ...btn }
}
```

## `bind` and show `todos`

You can bind any global states to a react Component with `bind`. Just pass the name of the global states as the second argument as shown below. If you pass a name of a non-defined state, a new global state will be created on the fly. However, use `/nd/init.js` to define it whenever possible so you can give it a initial value.

![](/next-dapp/img/todo-app-1.png)

```javascript
import { bind } from "nd"

export default bind(
  ({ todos }) => (
    <div style={style.container}>
      <div style={style.todos}>{map(v => <div>{v.task}</div>)(todos)}</div>
    </div>
  ),
  ["todos"]
)
```

## A New Task `input` form

The app should be able to add new tasks. Define an `input` and a `button` to add new tasks. For this, we only use a react local `state` since the input value is only accessed locally within the component. This is a standard react way to use `input` form. We also check if the input value is blank with `isBlank`. Leave the acutual part to add a task blank for now. We will fill the `/* add task to the todo list */` part soon. Right now if you click the `Add` button, it resets the `input` form with `setNewTask`.

![](/next-dapp/img/todo-app-2.png)

```javascript
import { useState } from "react"

const isBlank = val => /^\s*$/.test(val)

const NewTask = ({ init }) => {
  const [newTask, setNewTask] = useState("")
  return (
    <div style={style.newTask}>
      <input
        style={style.input}
        value={newTask}
        onChange={e => {
          setNewTask(e.target.value)
        }}
      />
      <div
        style={style.add}
        onClick={() => {
          if (!isBlank(newTask)) {
            /* add task to the todo list */
            setNewTask("")
          }
        }}
      >
        Add
      </div>
    </div>
  )
}

export default bind(
  ({ todos }) => (
    <div style={style.container}>
      <div style={style.todos}>
        <NewTask />
        {map(v => <div>{v.task}</div>)(todos)}
      </div>
    </div>
  ),
  ["todos"]
)

```

## Add Todo Global Function

Define `addTodo` global function in `custom.js`. Global functions will automatically get handy arguments such as `set`, `set`, `val`.

`val` : The values passed to the functions will be accessible via `val`.

`set` : can change the value of any global state. `set(new_value, state_name)` is the stardard way, but you can also do `set(object)` to set multiple states at once.

`get` : You can access any Global States using `get`. We use `Date.now()` to assign an unique key to new tasks.

```javascript
import { findIndex, propEq, append, assocPath } from "ramda"

export const addTodo = ({ get, val: { newTask }, set }) =>
  set(append({ task: newTask, key: Date.now() })(get("todos")), "todos")
```

> The Functions you `export` from `/nd/custom.js` will be global functions that can be bound to any component.
> Functions don't have to be predefined indeed. There is a direct way to bind define and bind on the spot. [See Quick Start](/next-dapp/docs/quick-start#bind-functions) for how it's done.

Now bind the `addTodo` function to the `NewTask` component by just passing the name of the function. Global functions need to be initialized in side the component with `init`.

See the line `const fn = init()`.

![](/next-dapp/img/todo-app-3.png)

```javascript
const NewTask = bind(
  ({ init }) => {
    const fn = init()
    const [newTask, setNewTask] = useState("")
    return (
      <div style={style.newTask}>
        <input
          style={style.input}
          value={newTask}
          onChange={e => {
            setNewTask(e.target.value)
          }}
        />
        <div
          style={style.add}
          onClick={() => {
            if (!isBlank(newTask)) {
              fn.addTodo({ newTask })
              setNewTask("")
            }
          }}
        >
          Add
        </div>
      </div>
    )
  },
  ["addTodo"]
)
```

## Todo Component

Let's defined a Component for each todo item. We need two sub Components to show done/undone tasks. Make a `Done` button and define a `onClick` function which marks a task `Done`. Leave the function blank for now.

![](/next-dapp/img/todo-app-4.png)

```javascript
const TodoDone = ({ todo }) => (
  <div style={style.todo}>
    <s style={style.task}>{todo.task}</s>
    <div style={style.emptyBtn} />
  </div>
)

const TodoUndone = ({ todo }) => (
  <div style={style.todo}>
    <div style={style.task}>{todo.task}</div>
    <div
      style={style.btn}
      onClick={() => {
        /* mark done */
      }}
    >
      Done
    </div>
  </div>
)

const Todo = ({ todo, todos }) =>
  todo.done ? <TodoDone todo={todo} /> : <TodoUndone todo={todo} />

export default bind(
  ({ todos }) => (
    <div style={style.container}>
      <div style={style.todos}>
        <NewTask />
        {map(v => <Todo todo={v} />)(todos)}
      </div>
    </div>
  ),
  ["todos"]
)
```

## Mark Done Global Function

Define `markDone` function in the same way you define `addTodo` in `/nd/custom.js`.

```javascript
export const markDone = ({ get, val: { todo }, set }) => {
  const todos = get("todos")
  const index = findIndex(propEq("key", todo.key))(todos)
  set(assocPath([index, "done"], true)(todos), "todos")
}
```

And reflect it in the `TodoUndone` component.

```javascript
const TodoUndone = bind(
  ({ init, todo }) => {
    const fn = init()
    return (
      <div style={style.todo}>
        <div style={style.task}>{todo.task}</div>
        <span style={style.btn} onClick={() => fn.markDone({ todo })}>
          Done
        </span>
      </div>
    )
  },
  ["markDone"]
)
```

Now you can cross out tasks by clicking `Done` button. Let's sort the tasks so done tasks come below undone tasks.

```javascript
export default bind(
  ({ todos, set }) => (
    <div style={style.container}>
      <div style={style.todos}>
        <NewTask />
        {o(
          map(v => <Todo todo={v} />),
          sortBy(v => (v.done ? 1 : 0))
        )(todos)}
      </div>
    </div>
  ),
  ["todos"]
)
```

And that's it. You have created your first nDapp with Next Dapp!

![](/next-dapp/img/todo-app-5.png)

## The Complete Code

If you remove the style definitions, the app code is quite short and simple.

### `/nd/init.js`

```javascript
export default {
  todos: [{ task: "Add Todos to This List", key: 1 }]
}
```

### `/nd/custom.js`

```javascript
import { findIndex, propEq, append, assocPath } from "ramda"

export const markDone = ({ get, val: { todo }, set }) => {
  const todos = get("todos")
  const index = findIndex(propEq("key", todo.key))(todos)
  set(assocPath([index, "done"], true)(todos), "todos")
}

export const addTodo = ({ get, val: { newTask }, set }) =>
  set(append({ task: newTask, key: Date.now() })(get("todos")), "todos")
```

### `/pages/index.js`

```javascript
import { bind } from "nd"
import { useState } from "react"
import { o, map, addIndex, sortBy } from "ramda"

const btn = {
  width: "50px",
  cursor: "pointer",
  backgroundColor: "#ddd",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "5px"
}

const style = {
  container: { display: "flex", justifyContent: "center" },
  todos: {
    display: "flex",
    width: "300px",
    flexDirection: "column",
    margin: "20px"
  },
  newTask: { width: "300px", display: "flex", marginBottom: "10px" },
  input: { width: "250px", padding: "5px 10px" },
  add: { ...btn },
  todo: { width: "300px", display: "flex", margin: "2px 0" },
  task: {
    width: "250px",
    padding: "5px 10px",
    display: "flex",
    alignItems: "center",
    background: "#eee"
  },
  emptyBtn: {
    width: "50px",
    backgroundColor: "#ddd",
    padding: "5px"
  },
  btn: { ...btn }
}

const isBlank = val => /^\s*$/.test(val)

const NewTask = bind(
  ({ init }) => {
    const fn = init()
    const [newTask, setNewTask] = useState("")
    return (
      <div style={style.newTask}>
        <input
          style={style.input}
          value={newTask}
          onChange={e => {
            setNewTask(e.target.value)
          }}
        />
        <div
          style={style.add}
          onClick={() => {
            if (!isBlank(newTask)) {
              fn.addTodo({ newTask })
              setNewTask("")
            }
          }}
        >
          Add
        </div>
      </div>
    )
  },
  ["addTodo"]
)

const TodoDone = ({ todo }) => (
  <div style={style.todo}>
    <s style={style.task}>{todo.task}</s>
    <div style={style.emptyBtn} />
  </div>
)

const TodoUndone = bind(
  ({ init, todo }) => {
    const fn = init()
    return (
      <div style={style.todo}>
        <div style={style.task}>{todo.task}</div>
        <span style={style.btn} onClick={() => fn.markDone({ todo })}>
          Done
        </span>
      </div>
    )
  },
  ["markDone"]
)

const Todo = ({ todo, todos }) =>
  todo.done ? <TodoDone todo={todo} /> : <TodoUndone todo={todo} />

export default bind(
  ({ todos, set }) => (
    <div style={style.container}>
      <div style={style.todos}>
        <NewTask />
        {o(
          map(v => <Todo todo={v} />),
          sortBy(v => (v.done ? 1 : 0))
        )(todos)}
      </div>
    </div>
  ),
  ["todos"]
)
```

> We didn't use the powerful [**Tracker**](/next-dapp/docs/tracker) and [**Computed Values**](/next-dapp/docs/computed-values) in this tutorial. But Next Dapp has more tricks up it's sleeves. Check out the [Quick Start](/next-dapp/docs/quick-start) for what it's capable of.

> Using [**Vercel Now**](https://vercel.com), you can deploy your app with one command.

```bash
now
```
