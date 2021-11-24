---
id: wallet-app
title: Wallet App Example
sidebar_label: Wallet App Example
---

We will create a very simple crypto wallet app using `web3` plugin. It works on Ropsten Testnet and the wallet will only handle [**WJPY**](https://testnet-wjpy.warashibe.market/) ERC20 stable token. You should be familiar with the [**basic concept of Next Dapp**](/next-dapp/docs/quick-start). We heavily use the simple and easy [**web3 plugin**](/next-dapp/docs/plugin-web3), so refer to it throughout this tutorial.

Also connect Metamask to [Ropsten Testnet](https://ropsten.etherscan.io/) during development.

![](/next-dapp/img/wallet-app-4.png)

## Install Nextdapp CLI Tools Globally

```bash
yarn global add nextdapp bit-bin
```

## Create an App, Install plugins and packages and Run Locally

```
nextdapp create wallet
cd wallet
yarn
nextdapp add util
nextdapp add web3
yarn dev
```

---

## Set up configurations

Write the configurations for web3 plugin in `/nd/conf.js` as shown below. We connect to Ropsten Testnet (`3`) for this app and handle `WJPY` ERC20 token.

> You can use `1` for Mainnet and any erc20 token to replace `WJPY`.

```javascript
const prod = {
  ...,
  
  web3: {
    network: "3",
    erc20: {
      WJPY: "0xF34dd03e5c3225029175c699e7E95137E2870E34"
    }
  }
}
```

## Predefined Styles

For a pleasant presentation, I have predefined some styles to use for the app. We also use some handy utilities from [**web3 plugin**](/next-dapp/docs/plugin-web3). Just copy and paste the code below in the beginning of `/pages/index.js` and don't worry about it for the rest of this tutorial.

```javascript
import { useEffect, Fragment } from "react"
import { bind, Tracker } from "nd"
import { isAddress, fromWei, toWei } from "nd/web3"

const style = {
  container: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center"
  },
  wallet: {
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    width: "300px",
    background: "#eee",
    padding: "20px",
    margin: "30px"
  },
  balance: { marginRight: "5px" },
  sym: { fontSize: "12px", color: "gray" },
  input: { margin: "5px", padding: "5px" },
  btn: {
    margin: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#333",
    color: "white"
  }
}
```
## Connect with wallet and show token balance

Use [**initWeb3()**](/next-dapp/docs/plugin-web3#web3_init) to connect with web3 wallet. This should be executed only once, so use `useEffect` to achieve that.

We define `balance` global state to store the `WJPY` balance of your wallet. Set the initial value to `0` when binding. `{balance: 0}`

[**Tracker**](/next-dapp/docs/tracker) will watch [**web3_address**](/next-dapp/docs/plugin-web3#web3_address) and [**web3_updated**](/next-dapp/docs/plugin-web3#web3_updated) predefined global states to check the `WJPY` balance when either of the states changes.

In the `Tracker` function, use the [**erc20**](http://localhost:3000/next-dapp/docs/plugin-web3#erc20-address-token-) predefined function to get an erc20 contract instance.

```javascript
const token = erc20({ token: "WJPY" })
```

Then simply get the balance with `token.balanceOf` and `set` it to `balance`. You should use `fromWei` to convert wei to eth before setting it.

```javascript
set(fromWei(await token.balanceOf(web3_address)), "balance")
```

A simple `Tracker` that watches `web3_address` and `web3_updatede`, then set a new balance to `balance` when something changes looks like this.

```javascript
<Tracker
  name="getBalance"
  watch={["web3_address", "web3_updated"]}
  func={async ({ get, set }) => {
    const token = erc20({ token: "WJPY" })
    set(fromWei(await token.balanceOf(get("web3_address"))), "balance")
  }}
  />
```
The code so far without the top style definitions.

![](/next-dapp/img/wallet-app-1.png)

```javascript
export default bind(
  ({ init, balance }) => {
    const { erc20, initWeb3 } = init()
    useEffect(() => {
      initWeb3()
    }, [])
    return (
      <div style={style.container}>
        <div style={style.wallet}>
          <div>
            <span style={style.balance}>{balance}</span>
            <span style={style.sym}>WJPY</span>
          </div>
        </div>
        <Tracker
          name="getBalance"
          watch={["web3_address", "web3_updated"]}
          func={async ({ get, set }) => {
            const token = erc20({ token: "WJPY" })
            set(fromWei(await token.balanceOf(get("web3_address"))), "balance")
          }}
        />
      </div>
    )
  },
  ["initWeb3", "erc20", { balance: 0 }]
)
```

## Input fields for recipient address and token amount

We need 2 input fields for recipient address and token amount. The one for token amount should check if the given value is a valid number. Define `to_address` and `send_amount` and update these state with `onChange` events.

![](/next-dapp/img/wallet-app-2.png)

```javascript
export default bind(
  ({ /* ... */ to_address, send_amount }) => {
  
    ...
	
    return (
      <div style={style.container}>
        <div style={style.wallet}>
		
		  ...

          <input
            style={style.input}
            placeholder="address to send"
            value={to_address}
            onChange={e => set(e.target.value, "to_address")}
          />
          <input
            style={style.input}
            placeholder="amount to send"
            value={send_amount}
            onChange={e => {
              if (!Number.isNaN(+e.target.value))
                set(e.target.value, "send_amount")
            }}
          />
		  
		  ...
		  
	    </div>
      </div>
    )
  },
  [ /* ... */ { to_address: "", send_amount: 0 } ]
)		  
```

## Send Button

Last but not least, we need a button to send `transfer` transaction to the blockchain. We will add a simple button below input forms and set `onClick` function. 
Use the handy `isAddress` utility to check, the address is valid and also check the amount is more than 0.

```javascript
if (!(send_amount > 0 && isAddress(to_address))) {
  alert("Enter the right data.")
  return
}
```

Just like we did before, get an erc20 contract instance first.

```javascript
const token = erc20({ token: "WJPY" })
```

then use the `transfer` method like this

```javascript
const [err, receipt] = await token.transfer( to_address, toWei(send_amount) )
```

> Next Dapp adapts Golang style error handling pattern because unlike `try/catch`, handling errors in Golang pattern keeps the linear code flow with `async/await`.

![](/next-dapp/img/wallet-app-3.png)

```javascript
export default bind(
  ({/* ... */}) => {
  
    ...
	
    return (
      <div style={style.container}>
        <div style={style.wallet}>
		
		  ...
		  
          <div
            style={style.btn}
            onClick={async () => {
              if (!(send_amount > 0 && isAddress(to_address))) {
                alert("Enter the right data.")
                return
              }
              const token = erc20({ token: "WJPY" })
              const [err, receipt] = await token.transfer(
                to_address,
                toWei(send_amount),
                hash => set(hash, "tx_hash")
              )
              if (err !== null) {
                alert("something went wrong!")
                return
              }
              alert("successfully sent!")
            }}
          >
            Send
          </div>
		  
		  ...
		  
        </div>
      </div>
    )
  },
  [/* ... */]
)
```

## Get the Transaction Hash Immediately

It takes some time for a transaction to be confirmed but you can get the transaction hash immediately by passing a `function` as the last argument to the `token.transfer` method. We will define `tx_hash` and set the transaction hash to it as soon as it's available.

```javascript
await token.transfer(
  to_address,
  toWei(send_amount),
  hash => set(hash, "tx_hash")
)
```

Also put a link to etherescan so the user can check their transaction. We put this below the `Send` button.

```javascript
{tx_hash !== null ? (
  <div>
    <a href={`https://ropsten.etherscan.io/tx/${tx_hash}`}>
	{tx_hash.slice(1, 20)}...
  </a>
  </div>
) : null}
```

![](/next-dapp/img/wallet-app-4.png)

And that's it! We showed how easy you can build an app to interact with Blockchain using Next Dapp. The code is fairly short and simple if you take out the style definitions.

> In this tutorial We used `erc20` to make token related transactions, but you can use [**contract**](/next-dapp/docs/plugin-web3#contractabi-address) function with any ABI and make any interaction with smart contracts as easy as this tutorial.

## The Complete Code

```javascript
import { useEffect, Fragment } from "react"
import { bind, Tracker } from "nd"
import { isAddress, fromWei, toWei } from "nd/web3"

const style = {
  container: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center"
  },
  wallet: {
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    width: "300px",
    background: "#eee",
    padding: "20px",
    margin: "30px"
  },
  balance: { marginRight: "5px" },
  sym: { fontSize: "12px", color: "gray" },
  input: { margin: "5px", padding: "5px" },
  btn: {
    margin: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#333",
    color: "white"
  }
}

export default bind(
  ({ set, init, balance, to_address, send_amount, tx_hash }) => {
    const { erc20, initWeb3 } = init()
    useEffect(() => {
      initWeb3()
    }, [])
    return (
      <div style={style.container}>
        <div style={style.wallet}>
          <div>
            <span style={style.balance}>{balance}</span>
            <span style={style.sym}>WJPY</span>
          </div>
          <input
            style={style.input}
            placeholder="address to send"
            value={to_address}
            onChange={e => set(e.target.value, "to_address")}
          />
          <input
            style={style.input}
            placeholder="amount to send"
            value={send_amount}
            onChange={e => {
              if (!Number.isNaN(+e.target.value))
                set(e.target.value, "send_amount")
            }}
          />
          <div
            style={style.btn}
            onClick={async () => {
              if (send_amount > 0 && isAddress(to_address)) {
                const token = erc20({ token: "WJPY" })
                const [err, receipt] = await token.transfer(
                  to_address,
                  toWei(send_amount),
                  hash => set(hash, "tx_hash")
                )
                if (err !== null) {
                  alert("something went wrong!")
                } else {
                  alert("successfully sent!")
                }
              } else {
                alert("Enter the right data.")
              }
            }}
          >
            Send
          </div>
          {tx_hash !== null ? (
            <div>
              <a href={`https://ropsten.etherscan.io/tx/${tx_hash}`}>
                {tx_hash.slice(1, 20)}...
              </a>
            </div>
          ) : null}
        </div>
        <Tracker
          name="getBalance"
          watch={["web3_address", "web3_updated"]}
          func={async ({ get, set }) => {
            const token = erc20({ token: "WJPY" })
            set(fromWei(await token.balanceOf(get("web3_address"))), "balance")
          }}
        />
      </div>
    )
  },
  [
    /* predefined functions */
    "erc20",
    "initWeb3",

    /* user defined global state */
    "tx_hash",
    { to_address: "", balance: 0, send_amount: 0 } // set initial values
  ]
)

```
> Using [**Vercel Now**](https://vercel.com), you can deploy your app with one command.

```bash
now
```
