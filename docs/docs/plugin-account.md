---
id: plugin-account
title: account Plugin
sidebar_label: account
---

`account` enables simple user management based on [Firebase Authentication](https://firebase.google.com/docs/auth).

## Installation

```bash
nextdapp add account
```


`account` plugin requires [util](/next-dapp/docs/plugin-util) and [fb](/next-dapp/docs/plugin-fb) plugins as well.

```bash
nextdapp add util
nextdapp add fb
```

## conf.js / conf.local.js

The configurations for [fb](/next-dapp/docs/plugin-fb#confjs--conflocaljs) plugin are required.

## Firestore Rules

The user data will be automatically saved and updated to `/users/{uid}` document in Firestore when a user logs in. Depending on your needs, you may want to use the Firestore rules like this.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
     allow read: if true;
     allow write: if request.auth.uid == uid;
    }
  }
}
```

## Global States

### `user`

The user data is set to `user` global state when the user is logged in. The data fields are generalized with simple keys. Some fields may be missing depending on the login method.

* `name` : name of the user
* `image` : avatar image
* `about` : user description
* `id` : an unique id (usually numeric) for the service provider
* `username` : username used for the service provider
* `uid` : Firebase Authentication unique user id, Use `uid` to access the user data in Firestore database.

```javascript
/* a sample user object */
{
  "name" : "John Doe",
  "image" : "http://lorempixel.com/",
  "about" : "I don't know who I am.",
  "id" : "1234567890",
  "username" : "johndoe",
  "uid" : "xxxxxxxx-xxxx-1234-5678-xxxxxxxxxxxx"
}
```

### `user_init`

This will be set `true` once `user` status is checked by `watchUser()`. It will be `true`, even if the user is not logged in. You can use `user_init` to show `loading...` screen before your app checks the `user` status.

## Global Functions

### `watchUser({ nodb, cb })`

This function needs to be executed once and it will watch user status changes. If the user logs in, it sets `user` state, and if the user logs out it sets null to `user`. `watchUser()` automatically initializes `firebase` along the way. The one liner

`useEffect(() => { watchUser() }, [])`

works to initialize user management as shown below. Pass `nodb = true` if you don't want to store user data to `Firestore`. You can also use `cb` argument to execute with the `user` object, every time user login state changes.

```javascript
useEffect(() => {
  watchUser({ nodb: true, cb : (new_user) => {
    console.log(new_user)
  })
}), [])
```

### `login({ provider, nodb })`

Login the user. Pass a provider to use. You need to setup each provider in [Firebase Console](https://console.firebase.google.com). The available providers are listed below.

`provider` : `twitter`, `facebook`, `github`, `google`

`login` returns the user object from Firebase Authentication when successful.

```javascript
const [err, new_user] = await login({ provider: 'twitter' })
```

### `logout()`

Logout the user.

### `deleteAccount({ uid })`

Delete the user account. Pass the `uid` from `user` object. It deletes the account from `Firebase Authentication` but only markes the user `{status : "deleted"}` in `Firestore`.

## Examples

```javascript
import { useEffect } from "react"
import { bind } from "nd"
export default bind(
  ({ $, init }) => {
    const fn = init([ "initFB", "watchUser", "login", "logout", "deleteAccount" ])
    useEffect(() => { fn.watchUser() }, [])
    return (
      <div>
        {$.user_init === false ? (
          "loading..."
        ) : $.user === null ? (
          <div onClick={() => fn.login({ provider: "twitter" })}>login</div>
        ) : (
          <div>
		    <div>Hello, {$.user.name}!</div>
            <div onClick={fn.logout}>logout</div>
            <div onClick={() => fn.deleteAccount({ uid: $.user.uid })}>delete</div>
          </div>
        )}
      </div>
    )
  },
  ["user", "user_init"]
)
```
