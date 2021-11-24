---
id: plugin-web3
title: web3 Plugin
sidebar_label: web3
---

`web3` simplifies notoriously complex [web3.js](https://web3js.readthedocs.io/en/v1.2.0/index.html) APIs and connects with Ethereum blockchain.

## Installation

```bash
nextdapp add web3
```


`web3` plugin requires [util](/next-dapp/docs/plugin-util) plugins as well.

```bash
nextdapp add util
```

`web3` node package is also required to be installed to the main app.

```bash
yarn add web3
```

## conf.js / conf.local.js

The ethereum network should be specified in `conf.js` or `conf.local.js`. You can also predefine ERC20 token addresses to use in the app.

```javascript
  ...
  web3: {
    network: "1"
	erc20: {
	  ALIS : "0xea610b1153477720748dc13ed378003941d84fab",
	  DAI : "0x6b175474e89094c44da98b954eedeac495271d0f"
	}
  },
  ...

```

### ethereum networks

*  `1`: mainnet
*  `3`: ropsten
*  `4`: rinkby
*  `42`: kovan

---

## Global States


### `web3_init`

This will be set `true` once `web3` has tried to connect with `web3.js`. It will be `true` even if `web3.js` or an available wallet address is missing.

### `web3_updated`

This will be set to `Date.now()` every time something changes with the wallet state. You can watch `web3_updated` and execute a function with `<Tracker />`.

### `web3_network`

The curently connected ethereum network.

### `web3_address`

The curently connected wallet address.

### `eth_balance`

The ETH balance of the currently selected `web3_address`.

```javascript
/* eth_balance */
{
  network, // current_network
  str, // ETH balance
  wei, // ETH balance in Wei
  address // web3_address
}
```

---

## Global Functions

### `initWeb3()`

This function needs to be executed once to detect `web3.js` and connect with an ethereum wallet such as the [Metamask](https://metamask.io/) browser extension. You can just do this in a component.

`useEffect(() => { initWeb3() }, [])`

### `eth()`

`eth` has two methods to deal with Ethereum native token `ether`.

#### ETH constant methods

`getBalance(address)` : get the balance of `address`. If `address` is omitted, it will be `web3_address`.

`balanceOf(address)` : an alias for `getBalance`

#### ETH transaction methods

`transfer( to, value)` : transfer `value` ETH to `to` address

`sendTransaction({ to, value })` : transfer `value` ETH to `to` address. It's the same as `transfer` but in the web3.js grammar.

```javascript
const ether = eth()
const to = "0xxxxxx..."

// balance
console.log(fromWei(await ether.balanceOf()))

// transfer
const [err, receipt] = await ether.transfer(to, toWei("1"))
```

### `erc20({ address, token })`

This is a handy way to make transactions to ERC20 contracts. You can either pass `address` of the token or predefined token name such as `ALIS`. Once you get the contract instance, you can execute any methods defined in the erc20 abi in consice grammar.

```javascript
const token = erc20({token : "ALIS"})
const my_address = "0xxxxxx..."

// constant method
console.log(await token.balanceOf(my_address))

// transaction method
const [err, receipt] = await token.approve(my_address, 100)
```

#### ERC20 constant methods

`balanceOf(address)` : get the balance of `address`

`totalSupply()` : get the totalSupply of the token

`allowance(owner, spender)` : get the allowance of the `owner` address for `spender` contract

#### ERC20 transaction methods

`approve(spender, amount)` : allow `spender` to move `amount`

`transfer(recipient, amount)` : transfer `amount` to `recipient`

`transferFrom(spender, recipient, amount)` : transfer `amount` from `spender` to `recipient`

#### Transaction Methods

You can pass an object as the last argument to the function to modify the **send options** described in the [web3 docs](https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html?highlight=send#methods-mymethod-send).

Options: `from`, `to`, `value`, `gas`, `gasPrice`, `data`, `nonce`

You can also pass **transaction event listener** [described here](https://web3js.readthedocs.io/en/v1.2.0/callbacks-promises-events.html?highlight=transactionHash#callbacks-promises-events) in the same object.

Event Listeners: `transactionHash`, `confirmation`, `error`

The `transactionHash` is a frequently used listener to immediately get the `hash` right after the transaction is sent (before the transaction is confirmed), so there is a shortcut. You can simply pass a function to get the `hash` as the last argument (after the object above).

```javascript
const [err, receipt] = await token.approve(
  my_address,
  100,
  { gas: 20000 }, // send options
  hash => console.log(hash) // immediately get the transaction hash
)
console.log(receipt) // get the receipt after transaction is confirmed
```

### `contract({abi, address})`

Just like `erc20()`, you can pass an `ABI` of any contract and get the contract instance.

For example, if you pass the [**uniswap_exchange ABI**](https://raw.githubusercontent.com/Uniswap/uniswap-v1/master/abi/uniswap_exchange.json), you can [**swap ETH and tokens**](https://uniswap.org/docs/v1/smart-contracts/exchange/#ethtotokenswapinput).

```javascript
const exchange_address = "0xxxx...."
const exchange_abi = [
  /* ... */
]
const uniswap = contract({ abi: exchange_abi, address: exchange_address })
const min_tokens = 1
const deadline = Date.now() + 1000 * 60 * 15
const [err, receipt] = await uniswap.ethToTokenSwapInput(min_tokens, deadline, {
  value: toWei("0.1")
})
```
---

## Regular Functions

### toWei()

convert eth to wei

```javascript
const [err, receipt] = await token.approve(my_address, toWei("100"))
```
### fromWei()

convert wei to eth

```javascript
console.log(fromWei(await token.getBalance(my_address)))
```

---

## Examples

```javascript
import { bind, Tracker } from "nd"
import { useEffect } from "react"
import { fromWei, toWei } from "nd/web3"
const your_address = "0x1234......"
export default bind(
  ({ init, web3_init, web3_address }) => {
    const { initWeb3, erc20 } = init()
    useEffect(() => { initWeb3() }, [])
    return (
      <div
        onClick={async () => {
          if (web3_init) {
            const token = erc20({
              token: "ALIS"
            })
			console.log(fromWei(await token.getBalance(web3_address)))
            const [err, res] = await token.transfer(
              your_address,
              toWei("100"),
              hash => {
                console.log(hash)
              }
            )
          }
        }}
      >
        transfer 100 ALIS to you
      </div>
    )
  },
  ["initWeb3", "web3_init", "erc20", "web3_address"]
)
```
