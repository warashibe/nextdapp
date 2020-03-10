# Next Dapp
![alt text](https://next-dapp.warashibe.market/static/cover.png "Next Dapp")

Next Dapp is a web framework to progressively connect web 2.0 with 3.0.

It makes best use of all the good tech about 2.0 with the bleeding edge tech around 3.0 and beyond.

## Project Website
[https://next-dapp.warashibe.market](https://next-dapp.warashibe.market)

## Warnings / Desclaimer
Next Dapps is still in its infancy. Don't use it for production yet.

This README is a work in progress. Stay tuned for further updates.

## Prerequisite

Must-haves.
- git
- [node](https://nodejs.org) version ^10.0.0
- [yarn](https://yarnpkg.com)
- [Firebase project](https://firebase.google.com)
- [Zeit Now](https://zeit.co)

Depending on your needs.
- [Infura](https://beta.steemconnect.com)
- [ALIS App](https://alis.to/me/settings/applications)
- [Steemconnect App](https://beta.steemconnect.com)
- [uPort App](https://beta.steemconnect.com)
- Ethereum EOA private key for uPort

## Installation
- Clone the Next Dapp `git` repository and install the necessary packages using `yarn`.

```bash
git clone https://github.com/warashibe/next-dapp.git
cd next-dapp
yarn
```
- Copy `/src/conf.sample.js` to `/src/conf.js` and edit the file with your own settings.
- Copy `/firebase/functions/conf.sample.js` to `/firebase/functions/conf.js` and edit the file with your own settings.

- Initialize `firebase` and set up `firestore` and `functions`.
```bash
cd firebase
firebase init
firebase deploy --only firestore:rules
cd ..
```
- You need to enable firebase `IAM` and add `Service Account Token Creator` role to the default account for cloud functions.

## Development
Next Dapp is based upon [Next.js](https://nextjs.org/).

Your custom code should go under the `/src` directory. See `/src/pages/examples`.

In each page file, use `binder` to hook Redux states and predefined functions.

A simple example. `/src/pages/example/index.js`
```javascript
import { Box } from "rebass"
import binder from "../../lib/binder"

export default binder(
  props => <Box onClick={props.function1}>{props.state1}</Box>, // React JSX with Rebass
  [ "state1, "state2" ], // Predefined Redux states as props
  [ "function1", "function2" ] // Predefined RxJS functions as props
)

```

Run the dapp locally.
```bash
now dev
```

## Deployment

- Deploy cloud functions onto Firebase first.

```bash
cd firebase
firebase deploy --only functions
cd ..
```

- Deploy your dapp onto [Zeit](https://zeit.co) with one simple command.

```bash
now
```

## API Reference
API documents are coming soon.

## Contributers
[Tomoya Nagasawa](https://github.com/ocrybit)

## LICENSE
MIT
