---
id: nextdapp-cli
title: Next Dapp CLI Tools
sidebar_label: nextdapp
---

## Installation

```bash
yarn global add nextdapp
```

To use plugins, you also need the `bit-bin` node package to be installed globally.

```bash
yarn global add bit-bin
```

---

## Create a Project

```bash
nextdapp create myapp
cd myapp
yarn
```
---

## Add Plugins

Plugins will be installed under `/nd/[plugin_name]`.

```bash
nextdapp add util
```

Plugins can be namespaced. `nextdapp add [plugin_name] [namespace]`

```bash
nextdapp add util my_util
```

In this case, the `util` plugin will be installed at `/nd/my_util` and all the `states` and `functions` will be suffixed by `$my_util`. For instance, `url` becomes `url$my_util` throughout your app. A good reason for doing this is if two plugins have a name conflict.

---

## Update Plugins

```bash
nextdapp add util
```

If you namespaced the plugin, you need to do the same when updating. Otherwise the plugin will be moved to a different location.

```bash
nextdapp add util my_util
```

You can simply change the location of the plugin by using a different namespace.

```bash
nextdapp add util your_util
```

---

## Remove Plugins

When removing you don't have to worry about namespaces, Next Dapp knows where the `util` plugin is located.

```bash
nextdapp remove util
```

## Refresh Plugins

Refresh plugin settings by reading the directory structure and configuration files `/nd/[plugin_name]/nextdapp.json` without installing anything. This is useful when developing your own plugin.

```bash
nextdapp refresh
```
