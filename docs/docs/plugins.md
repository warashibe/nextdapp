---
id: plugins
title: Plugins
sidebar_label: Plugins
---

In nDapps, everything, even the core module, is a plugin. Plugins are drop-in enhancements to your app, which give you a wide range of common APIs and architechtures you need to build your own otherwise. The currently available plugins include Firestore database, user management, web3.js blockchain interactions, cryptocurrency wallets, uniswap DEX, CMS and even IPFS based blogging system. You can start integrating these features with one simple command. The APIs are made as simple and consice as possible and plugins are managed with [Bit](https://bit.dev/warashibe/nextdapp) component based repositories rather than NPM / Git due to the installed file sizes being much smaller with Bit. You can also build your own plugins which is pretty much straight forward and simple to do.

---

## Install `bit-bin`

To use plugins, you also need the `bit-bin` node package to be installed globally.

```bash
yarn global add bit-bin
```

or

```bash
npm i bit-bin -g
```


## Adding Plugins

`nextdapp add [plugin_name]`

To add the `util` plugin,

```bash
nextdapp add util
```
Plugins will be installed under /nd/[plugin_name]. In this case `/nd/util`.


### Namespace

Plugins can be namespaced.

`nextdapp add [plugin_name] [namespace]`

```
nextdapp add util my_util
```

In this case, the `util` plugin will be installed at `/nd/my_util` and all the `states` and `functions` will be suffixed by `$my_util`. For instance, `url` becomes `url$my_util` throughout your app. A good reason for doing this is if two plugins have a name conflict.


## Updating Plugins

`nextdapp add [plugin_name]`

To update the installed `util` plugin to a new version, do the same as adding.

```bash
nextdapp add util
```

### Namespace

If you namespaced the plugin, you need to do the same when updating. Otherwise the plugin will be moved to a different location.

```
nextdapp add util my_util
```

## Moving Plugins

In fact, you can simply change the location of the plugin by using a different namespace.

```
nextdapp add util your_util
```

## Removing Plugins

`nextdapp remove [plugin_name]` To remove the installed `util` plugin,

```bash
nextdapp remove util
```

When removing you don't have to worry about namespaces, Next Dapp knows where the `util` plugin is located whether it's namespaced or not.

---

## Predefined States and Functions

What you will get with plugins are predefined `Global States`,  `Global Functions` and sometimes regular functions as well. For instance, the very simple `util` plugin comes with `getURL` function and `url` state. You don't have to do any setups, you can just start using them once the plugin has been installed.

`util` also has a handy regular function called `xNil` to check if the value is either `null` or `undefined`. Regular functions can be imported from `nd/[plugin_name]`.

```javascript
import { useEffect } from "react"
import { bind } from "nd"
import { xNil } from "nd/util"

export default bind(
  ({ url, init }) => {
    const { getURL } = init() // initialize global function as usual
    useEffect(() => {
      getURL() // call the function
    }, [])
    return <div>{ xNil(url) ? url.hostname : "" }</div> // show hostname
  },
  [ "url", "getURL" ] // bind predefined state and function
)
```

## Official Plugins

### Available

* [**util**](/next-dapp/docs/plugin-util) - utilities
* [**fb**](/next-dapp/docs/plugin-fb) - Firestore / Cloud Storage and more
* [**account**](/next-dapp/docs/plugin-account) - Firebase Authentication based user management
* [**web3**](/next-dapp/docs/plugin-web3) - Web3.js Ethereum blockchain interactions

### Coming Soon

* **wallet** - Metamask / Authereum smart contract wallet and more
* **uniswap** - DEX (Decentralized Exchange)
* **dev** - Dev Protocol OSS ecosystem with staking
* **editor** - Markdown and coding editor combined together
* **blog** - CMS (Content Management System)
* **ipfs-blog** - IPFS based P2P blogging



