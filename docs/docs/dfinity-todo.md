---
id: dfinity-todo
title: DFINITY Example
sidebar_label: DFINITY Example
---

## Installation

NextDapp can initialize and deploy DFINITY apps in a matter of minutes. The dfinity template includes a simple todo app you can set up and deploy with 6 lines of commands.

### Create an App

```
nextdapp create todo --template dfinity
cd todo
yarn
```

### Deploy Canisters

Make sure you have `dfx` installed.

```
dfx start --background
dfx deploy
```

### Run the App Locally

```
yarn dev
```

Now your dapp is running at [localhost:3000](http://localhost:3000).

## Source Code

Let's look at some core files.

### Motoko Smart Contract

Our motoko smart contract at `/src/todo/main.mo` extends the todo example from [this DFINITY tutorial](https://smartcontracts.org/docs/developers-guide/tutorials/multiple-actors.html).

```motoko
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

actor Todos {

  stable var todos : [ToDo] = [];
  stable var nextId : Nat = 1;

  type ToDo = {
    id : Nat;
    description : Text;
    completed : Bool;
  };

  func add(todos : [ToDo], description : Text, id : Nat) : [ToDo] {
    let todo : ToDo = {
      id = id;
      description = description;
      completed = false;
    };
    Array.append(todos, [todo])
  };

  public query func getTodos() : async [ToDo] {
    todos;
  };

  public func addTodo (description : Text) : async () {
    todos := add(todos, description, nextId);
    nextId += 1;
  };

  public func markDone(id : Nat) : async () {
    todos := Array.map<ToDo,ToDo>(todos, func (todo : ToDo) : ToDo {
      if (todo.id == id) {
        return {
          id = todo.id;
          description = todo.description;
          completed = true;
        };
      };
      todo
    })
  };

  public func removeTodo(id : Nat) : async () {
    todos := Array.filter<ToDo>(todos, func (todo : ToDo) : Bool {
        return todo.id != id;
    })
  };

};
```

### dfx.json

You can assign arbitrary canister names. NextDapp will read from this file and link to the right canisters.

```json
{
  "canisters": {
    "todo": {
      "main": "src/todo/main.mo",
      "type": "motoko"
    },
    "todo_assets": {
      "dependencies": ["todo"],
      "source": ["out"],
      "type": "assets"
    }
  },
  "defaults": {
    "build": {
      "args": "",
      "packtool": ""
    }
  },
  "dfx": "0.8.3",
  "networks": {
    "local": {
      "bind": "127.0.0.1:8000",
      "type": "ephemeral"
    }
  },
  "version": 1
}
```

### index.js

This is the single page todo app located at `/pages/index.js`.

```jsx
import { useState, useEffect } from "react"
import { isNil, map } from "ramda"
import { bind } from "nd"
import { Box, Flex } from "rebass"
import { Input } from "@rebass/forms"

import dfx from "nd/dfx"

const style = {
  add: {
    bg: "#eee",
    p: 2,
    justifyContent: "center",
    alignItems: "center",
    width: "50px",
    cursor: "pointer",
    ":hover": { opacity: 0.75 },
  },
  task: {
    bg: "#eee",
    my: 1,
    px: 3,
    py: 2,
    cursor: "pointer",
    ":hover": { opacity: 0.75 },
  },
  remove: {
    ml: 1,
    bg: "#eee",
    my: 1,
    px: 3,
    py: 2,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    width: "35px",
    ":hover": { opacity: 0.75 },
  },
}

export default () => {
  const [task, setTask] = useState("")
  const [todos, setTodos] = useState([])
  const [deleting, setDeleting] = useState(null)
  const [checking, setChecking] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    ;(async () => setTodos(await dfx("todo").getTodos()))()
  }, [])

  return (
    <Flex justifyContent="center">
      <Box maxWidth="600px" p={3}>
        <Flex mb={2}>
          <Input
            disabled={adding ? "disabled" : ""}
            value={task}
            onChange={e => setTask(e.target.value)}
            flex={1}
          />
          <Flex
            sx={style.add}
            onClick={async () => {
              if (!adding && !/^\s*$/.test(task)) {
                setAdding(true)
                await dfx("todo").addTodo(task)
                setTodos(await dfx("todo").getTodos())
                setTask("")
                setAdding(false)
              }
            }}
          >
            {adding ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              <Box as="i" className="fas fa-plus" />
            )}
          </Flex>
        </Flex>
        {map(v => (
          <Flex width={1}>
            <Box
              flex={1}
              sx={style.task}
              onClick={async () => {
                if (!v.completed) {
                  await dfx("todo").markDone(v.id)
                  setTodos(await dfx("todo").getTodos())
                }
              }}
            >
              <Box
                color={v.completed ? "red" : "black"}
                as={v.completed ? "s" : ""}
              >
                {v.description}
              </Box>
            </Box>
            <Flex
              width="50px"
              sx={style.remove}
              onClick={async () => {
                if (isNil(deleting)) {
                  setDeleting(v.id)
                  await dfx("todo").removeTodo(v.id)
                  setTodos(await dfx("todo").getTodos())
                  setDeleting(null)
                }
              }}
            >
              {deleting === v.id ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                <Box as="i" className="fas fa-times" />
              )}
            </Flex>
          </Flex>
        ))(todos)}
      </Box>
    </Flex>
  )
}

```
The only thing you need to pay attention to here is how to connect to canisters.

Import `nd/dfx`.

```jsx
import dfx from "nd/dfx"
```

Then, use it like below to connect to a DFINITY canister (`todo`) and execute a function (`getTodos`).

```jsx
await dfx("todo").getTodos()
```
The rest is the same as how non-dfinity NextDapp apps work.

## Deploy to DFINITY Mainnet

Make sure you have enough cycles. 

> Note that this todo app is not suitable to be deployed without implementeng some access control logics, as there is only one todo list shared with everyone.

```bash
dfx deploy --network ic
```
