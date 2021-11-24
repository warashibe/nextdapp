---
id: troubleshoot
title: Troubleshooting
sidebar_label: Troubleshooting
---

## Always use the Latest Version

Next Dapp is still in alpha and changing rapidly. So the chances are your troubles have been resolved in the latest versions. To update Next Dapp CLI Tools,

```bash
yarn global upgrade nextdapp --latest
```

Plugins can be updated simply by re-adding.

```bash
nextdapp add fb
```
Update the core.

```bash
nextdapp add core
```

---

## `nextdapp add` hangs

There seems to be cases `nextdapp add [plugin]` hangs with the warning below.

```bash
help us prioritize new features and bug fixes by enabling us to collect anonymous statistics about your usage. sharing anonymous usage information is completely voluntary and helps us improve Bit and build a better product.
for more information see analytics documentation - https://docs.bit.dev/docs/conf-analytics
would you like to help Bit with anonymous usage analytics? [yes(y)/no(n)]:  (yes) 
(node:16712) Warning: Accessing non-existent property 'padLevels' of module exports inside circular dependency
(Use `node --trace-warnings ...` to show where the warning was created)
```

If you encounter this, a dirty fix is installing associated bit components outside your app directory and retry `nextdapp add` in your app directory again. For example, if you are stuck installing `fb` plugin, go out of the app directory and do below.

```bash
nextdapp create myapp
cd myapp
bit init
bit import warashibe.nextdapp/fb
```

Then go back to your app directory and retry installing `fb` plugin.

```bash
nextdapp add fb
```

> We manage Next Dapp core plugins on [Bit](https://bit.dev/warashibe/nextdapp).

---

## I can't deploy to Vercel

Sometimes deployment to Vercel fails due to missing dependencies for plugins. Make sure you have installed all the required node packages listed in the plugins docs. For example [**fb plugin**](/next-dapp/docs/plugin-fb) requires `firebase` and `google-auth-library` to be installed to the main app (not to the plugin directory).

---

## Discord Community Channel

If you are stuck using Next Dapp, we have a place for you to come ask questions.

[**Next Dapp Discord**](https://discord.com/invite/MvSsm8x)

You can also search or post issues in the github repositories.

* [**Next Dapp Main Issues**](https://github.com/warashibe/next-dapp/issues)

* [**Next Dapp CLI Tools Issues**](https://github.com/warashibe/nextdapp/issues)
