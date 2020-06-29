import {
  is,
  propOr,
  apply,
  isNil,
  hasPath,
  pickBy,
  identity,
  mergeLeft,
  invertObj,
  curryN
} from "ramda"

import { xNil } from "nd/util"
import { initFB } from "nd/fb"

const err = (fn, ctx) => async (...args) => {
  let ret = null
  let err = null
  try {
    ret = await fn.apply(ctx || this, args)
  } catch (e) {
    err = e
  }
  return [err, ret]
}

const logAlert = (obj, log, _alert_message) => {
  if (xNil(obj)) {
    if (xNil(log)) console.log(log)
    if (xNil(alert)) alert(_alert_message)
  }
  return xNil(err)
}

let logging = false
let conf, steem_client

const name_map = {
  "twitter.com": "twitter",
  "facebook.com": "facebook",
  "google.com": "google",
  "github.com": "github"
}

const reverse_name_map = invertObj(name_map)

const link_converter = {
  "twitter.com": (_u, add) =>
    mergeLeft(
      {
        username: add.username,
        id: add.profile.id_str,
        about: add.profile.description,
        image: add.profile.profile_image_url_https.replace(/_normal/, "")
      },
      _u
    ),
  "facebook.com": (_u, add) =>
    mergeLeft(
      {
        name: add.profile.name,
        image: hasPath(["profile", "picture", "data", "url"])(add)
          ? add.profile.picture.data.url
          : undefined
      },
      _u
    ),
  "google.com": (_u, add) =>
    mergeLeft({ name: add.profile.name, image: add.profile.picture }, _u),
  "github.com": (_u, add) =>
    mergeLeft(
      {
        username: add.username,
        name: add.profile.name,
        about: add.profile.bio
      },
      _u
    )
}

const userUpdate = async ({ u, set, global: { db, account_nodb } }) => {
  const user = isNil(u)
    ? null
    : account_nodb
    ? { uid: u.uid, name: u.displayName }
    : await db.get("users", u.uid)
  logging = false
  set({ user: user, user_init: true })
}

export const watchUser = async ({
  val: { nodb = false, cb },
  set,
  conf,
  global
}) => {
  global.account_nodb = nodb
  initFB({ set, global, conf }).then(fb => {
    fb.firebase.auth().onAuthStateChanged(async u => {
      if (!logging) await userUpdate({ u, set, global })
      if (is(Function)(cb)) cb(u)
    })
  })
}
watchUser.props = ["user", "user_init"]

export const logout = async ({ val, global: { fb } }) => {
  const auth = await fb.firebase.auth()
  const [error] = await err(auth.signOut, auth)()
  logAlert(error, error, "something went wrong")
  return [error]
}

const user_fields = ["name", "image", "about", "uid", "username", "id"]

const _login = async ({
  user,
  provider,
  set,
  _add = {},
  global,
  val: { nodb }
}) => {
  logging = true
  if (hasPath(["user", "uid"])(user)) {
    await global.db.tx("users", user.user.uid, async ({ data, t, ref }) => {
      let _u = data || { uid: user.user.uid, status: "active" }
      _u.links = propOr({}, "links")(_u)
      const add = mergeLeft(user.additionalUserInfo, _add)
      for (let v of user.user.providerData) {
        if (xNil(link_converter[v.providerId])) {
          _u.links[name_map[v.providerId]] = {
            id: v.uid,
            name: v.displayName,
            image: v.photoURL
          }
          if (provider === v.providerId && xNil(add)) {
            _u.links[name_map[v.providerId]] = link_converter[v.providerId](
              _u.links[name_map[v.providerId]],
              add
            )
          }
          _u.links[name_map[v.providerId]] = pickBy(identity)(
            _u.links[name_map[v.providerId]]
          )
          if (provider === v.providerId && xNil(add)) {
            for (let k of user_fields) {
              if (
                (isNil(_u[k]) || hasPath(["profile_update", k])) &&
                xNil(_u.links[name_map[v.providerId]][k])
              ) {
                _u[k] = _u.links[name_map[v.providerId]][k]
              }
            }
          }
        }
      }
      _u = pickBy(identity)(_u)
      if (nodb !== true) await global.db.upsert(_u, "users", _u.uid)
    })
    await userUpdate({ u: user.user, set, global })
  }
}

const getProvider = ({ provider, fb }) => {
  return new fb.firebase.auth[
    `${provider[0].toUpperCase()}${provider.slice(1)}AuthProvider`
  ]()
}

const login_with = {}

export const login = async ({
  val: { provider, nodb = false },
  set,
  props,
  conf,
  global
}) => {
  if (xNil(login_with[provider])) {
    return await login_with[provider]({
      set,
      props,
      conf,
      global,
      val: { nodb }
    })
  }
  const _provider = getProvider({ provider: provider, fb: global.fb })
  const auth = await global.fb.firebase.auth()
  const [error, user] = await err(auth.signInWithPopup, auth)(_provider)
  if (xNil(error)) {
    alert("something went wrong")
  } else {
    await _login({
      user,
      provider: reverse_name_map[provider],
      set,
      global,
      val: { nodb }
    })
  }
  return [error, user]
}

const _login_with = async ({
  set,
  props,
  login_url,
  provider,
  global: { fb },
  val: { nodb }
}) => {
  if (hasPath(["value", "user", "uid"])(props)) {
    login_url += `&uid=${props.user.uid}`
  }
  const res = await fetch(login_url).then(response => response.json())
  if (xNil(res.user)) {
    const auth = await fb.firebase.auth()
    if (hasPath(["token", "err"])(res) && xNil(res.token.err)) {
      alert(res.token.err)
      return
    }
    const [error, user] = await err(
      auth.signInWithCustomToken,
      auth
    )(res.token.token)
    if (xNil(err)) {
      alert("something went wrong")
      return
    }
    user.user.providerData.push({
      providerId: reverse_name_map[provider],
      uid: user.uid
    })
    _login({
      user,
      provider: reverse_name_map[provider],
      set,
      _add: res.user,
      val: { nodb }
    })
  }
}

export const deleteAccount = async ({
  val: { user },
  set,
  global: { db, fb, account_nodb }
}) => {
  if (account_nodb !== true) {
    await db.tx("users", user.uid, async ({ t, ref, data }) => {
      return await t.update(ref, { status: "deleted" })
    })
  }
  let _user = fb.firebase.auth().currentUser
  await _user.delete()
}
