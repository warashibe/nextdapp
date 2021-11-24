# Next Dapp Docs

This is the official docs for [Next Dapp](https://github.com/warashibe/next-dapp) deployed at [https://warashibe.github.io/next-dapp/](https://warashibe.github.io/next-dapp/) and powered by [Docusaurus v1](https://docusaurus.io).

Your contributions are more than welcome. Here's how.

## How to contribute

1. fork this repo

2. clone your forked repo

```bash
git clone https://github.com/[your github username]/next-dapp-docs.git
```

3. install packages

```bash
cd next-dapp-docs/website
yarn
```

4. run the docs locally

```bash
yarn start
```

5. make changes and commit them to your forked repo

6. create a new pull request at [https://github.com/warashibe/next-dapp-docs/pulls](https://github.com/warashibe/next-dapp-docs/pulls)

7. pray it will be accepted

---

## How to add new pages

The simplest way to add a page is to create a markdown file under [/docs](https://github.com/warashibe/next-dapp-docs/tree/master/docs) directory with an arbitrary file name. Mimic the header format of the other md files in the directory to define `id`, `title` and `sidebar_label`.

For example: 

```md
---
id: api
title: API Reference
sidebar_label: API Refenence
---

Coming Soon...

```

Then Add the doc `id` to [/website/sidebars.json](https://github.com/warashibe/next-dapp-docs/blob/master/website/sidebars.json) in a desired place to include a link in the sidebar. You need to restart the local app to reflext the `sidebar.json` changes.

`[Cntr] + C` to kill the app and `yarn start` to restart the local server.

Other than that, refer to [Create Pages](https://docusaurus.io/docs/en/tutorial-create-pages) in the Docusaurus Docs.
