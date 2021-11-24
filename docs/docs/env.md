---
id: env
title: .env
sidebar_label: .env
---

Use `/.env` to define credentials which shouldn't be exposed in the client app. Don't write these credentials in `/nd/conf.js` or `/nd/conf.local.js`. The data in these files will be inlined and exposed in the production app. In `Next.js` apps, there are places only executed on the server side, where you can use credentials without exposing them such as `/pages/api/*`, `getStaticProps`, `getStaticPaths` and `getServerSideProps`.

```text
SECRET=xxx
SECRET2=xxx
```

You can access these values as `procces.env.SECRET` and `process.env.SECRET2`.
