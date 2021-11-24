---
id: build-plugins
title: Building Your Own Plugins
sidebar_label: Building Plugins
---

Next Dapp utilizes [**Bit**](https://bit.dev/) for plugin management instead of NPM / Git due to its light-weighted nature of component based packaging.

## Set up Bit

Install `bit-bin` (Bit CLI Tools) globally if you haven't done so.

```bash
yarn global add bit-bin
```

You also need to sign up for [**Bit**](https://bit.dev/) and [**create a collection**](https://bit.dev/~create-collection) to manage your own plugins. 

Log in to bit via your command line terminal as well.


```bash
bit login
```

## Create a Bare Minimum Plugin

The easiest way to get started is to create an App and set up a are minimum plugin inside the new project.

```bash
nextdapp create myapp
cd myapp
yarn
```

Create a directory with your plugin name under `/nd/[plugin_name]`.

```bash
mkdir nd/myplugin
```

You at least need two files in your plugin directory. You will export states, functions and components from `index.js` and define them in `nextdapp.json` to tell Next Dapp what your plugin exports. As long as you export things in `index.js`, the file structure of the plugin directory has no restrictions.

* `nd/[plugin_name]/index.js`
* `nd/[plugin_name]/nextdapp.json`


## Define Global States

You can define global states for your plugin by exporting `init` from `index.js`.

```javascript
export const init = {
  my_state_1: 1,
  my_state_2: 2,
  my_state_3: 0
}
```

## Define Global Functions

You can also export [global functions](/next-dapp/docs/global-functions) for your plugin from `index.js`.

```javascript
export const myfunc = ({ get, set }) => {
  set(get("my_state_1") + get("my_state_2"), "my_state_3")
}
```

> You don't have to define everything in `index.js`. Use other files and export things into `index.js`, then export those from `index.js`. See how other plugins chain up `export` into `index.js` for your reference.

## `nextdapp.json`

Define the states and the functions you exported from `index.js` in `nextdapp.json`.

### `core`

If the `core` is set `true`, your plugin is considered to be a core plugin and the states and functions are not going to be suffixed with your plugin name. So `my_state_1` stays `my_state_1`, `myfunc` stays `myfunc` and so on.

If the `core` is set `false`, your states and functions will be namespaced and suffixed with your plugin name, thus, `my_state_1` becomes `my_state_1$myplugin`, `myfunc` becomes `myfunc$myplugin` and so on.

The reason for namespacing is that plugins install global states and functions so the shared names always have risk of name collisions with other plugins.

> You are free to use `"core": true` for your convenience, but try not to use the names in the Next Dapp official plugins. There are ways to avoid name collisions even if your plugins are labeled `core`, we will explain that later.

```json
{
  "core": true,
  "props: [ "my_state_1", "my_state_2", "my_state_3" ],
  "funcs: [ "myfunc" ]
}
```

## Refresh Plugins

Once you export and define states and functions, go back to the app root directory and refresh plugins. Refreshing plugins doesn't install or uninstall anything but just reads the directory tree and update plugins according to the current `nextdapp.json` files.

```bash
nextdapp refresh
```

## Try Out Your Own Plugin

Let's see if your plugin is actually installed. Modify `/pages/index.js`.

```javascript
import { useEffect } from "react"
import { bind } from "nd"

export default bind(
  ({ my_state_1, my_state_2, my_state_3, init }) => {
    const { myfunc } = init()
    useEffect(() => {
	  /* myfunc() adds my_state_1 and my_state2 and set it to my_state_3 */
      myfunc() 
    }, [])
    return (
      <div>
        {my_state_1} : {my_state_2} : {my_state_3}
      </div>
    )
  },
  ["my_state_1", "my_state_2", "my_state_3", "myfunc"] /* bind plugin defined stuff */
)
```

If you see `1 : 2 : 3`, it all works!


## Share Your Plugin

Now that you have built your first plugin, let's share it with the world!

Assuming you have set up a collection on [Bit](https://bit.dev/~create-collection) to upload your Next Dapp plugins, first `add` the plugin directory.

```bash
bit add nd/myplugin
```

Then `tag` your newly added component with a version.

> If you use node packages in your plugin, there might be errors due to dependency issues, you can use `--ignore-missing-dependencies` flag for now.

```bash
bit tag myplugin 0.0.1 --ignore-missing-dependencies
```

Finally, `export` your collection with `[your_bit_username].[your_bit_collection]`

```bash
bit export ocrybit.nextdapp
```

## Install Your Plugin from Bit

To install your plugin from Bit, `add` `[your_bit_username].[your_bit_collection]/[plugin_name]`.

```
nextdapp add ocrybit.nextdapp/myplugin
```

If your collection is public, other people can install your plugin in the same way.


## Make Your Plugin Namespace Proof

As explained [here](/next-dapp/docs/nextdapp-cli#add-plugins), plugins can be namespaced at installation, which may break the state names used in your plugin. For example if you set `"core": true`, and somebody installs your plugin with a namespace, `my_state_1` becomes `my_state_1$namespace` and your plugin won't work anymore. So to protect the plugins from such cases we have `ns` name wrapper.

First instantiate the wrapper with the plugin name. Then wrap all the state names with it. `ns` automatically resolves the names for you regardless of how they are namespaced. If somebody namespaces your plugin with `great_plugin`, `$("my_state_1")` resolves to `my_state_1$great_plugin` and your function continues to work fine.

```javascript
import {ns} from "nd"
const $ = ns("myplugin")

export const myfunc = ({ get, set }) => {
  set(get($("my_state_1")) + get($("my_state_2")), $("my_state_3"))
}
```
> As long as you plan to use your plugins privately, you may not need to worry about namespaces and wrap everything with `ns / $`.
