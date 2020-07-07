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
  curryN,
  includes
} from "ramda"

import { xNil } from "nd/util"
import { initFB } from "nd/fb"
import { setCookie, parseCookies, destroyCookie } from "nookies"
import { ns } from "nd"
const $ = ns("account")

const NodeRSA = require("node-rsa")
const base64url = require("base64url")
const sha256 = require("js-sha256")
const shortid = require("shortid")
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
  "github.com": "github",
  "alis.to": "alis"
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
    ),
  "alis.to": (_u, add) =>
    mergeLeft(
      {
        name: add.user_display_name,
        image: add.icon_image_url,
        about: add.self_introduction,
        username: add.user_id
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

const getData = async (db, conf, url) => {
  const toRSAPublic = key =>
    `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
  const toRSAPrivate = key =>
    `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return "%" + c.charCodeAt(0).toString(16)
    })
  }
  const key = new NodeRSA({ b: 512 })
  const key2 = new NodeRSA(toRSAPublic(conf.rsa.public))
  const pub = key.exportKey("public")
  const text = "Hello RSA!"
  const encrypted = key2.encrypt(pub, "base64")
  const public_key = key.exportKey("public")
  const id = shortid.generate()
  const encrypted_id = key2.encrypt(id, "base64")
  db.set({ date: Date.now(), public_key: encrypted }, "crypt", id)
  const _getData = async url => {
    return await new Promise(async (res, rej) => {
      let once = false
      let to = null
      let ret = {}
      const unsubscribe = await db.on("crypt", id, async doc => {
        if (doc !== null && xNil(doc.value)) {
          once = true
          ret.data = JSON.parse(key.decrypt(doc.value, "utf8"))
          clearTimeout(to)
          await unsubscribe()
          if (xNil(ret.response)) {
            res(ret)
          }
        }
      })
      to = setTimeout(async () => {
        try {
          await unsubscribe()
          if (xNil(ret.response)) {
            res(ret)
          }
        } catch (e) {}
      }, 20000)
      ret.response = await fetch(
        `${url}&crypt_id=${encodeURIComponent(encrypted_id)}`
      ).then(response => response.json())
      console.log(ret.response)
      if (xNil(ret.data)) {
        res(ret)
      }
    })
  }
  return await _getData(url)
}

const login_with = {
  alis: async ({ conf }) => {
    const code_verifier = get_code_verifier()
    const code_challenge = get_code_challenge(code_verifier)
    const purl = `https://alis.to/oauth-authenticate?client_id=${
      conf.alis.client_id
    }&redirect_uri=${encodeURIComponent(
      conf.alis.redirect_uri
    )}&scope=write&code_challenge=${code_challenge}`
    setCookie(null, "alis_verifier", code_verifier, { path: "/" })
    window.location.href = purl
  }
}

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
  global: { fb, db },
  val: { nodb },
  conf
}) => {
  if (hasPath(["value", "user", "uid"])(props)) {
    login_url += `&uid=${props.user.uid}`
  }
  const _res = await getData(db, conf, login_url)
  if (hasPath(["response", "err"])(_res) && xNil(_res.response.err)) {
    alert(_res.response.err)
    return
  }
  if (hasPath(["data", "err"])(_res) && xNil(_res.data.err)) {
    alert(_res.data.err)
    return
  }
  if (hasPath(["data", "user"])(_res) && xNil(_res.data.user)) {
    const auth = await fb.firebase.auth()
    const [error, user] = await err(auth.signInWithCustomToken, auth)(
      _res.data.token
    )
    if (xNil(error)) {
      alert("something went wrong")
      return
    }
    user.user.providerData.push({
      providerId: reverse_name_map[provider],
      uid: user.uid
    })
    _login({
      global: { db, fb },
      user,
      provider: reverse_name_map[provider],
      set,
      _add: _res.data.user,
      val: { nodb }
    })
  }
  return
}

export const deleteAccount = async ({
  val: { user },
  set,
  global: { db, fb, account_nodb }
}) => {
  if (account_nodb !== true) {
    await db.tx("users", user.uid, async ({ t, ref, data }) => {
      for (let l in data.links || {}) {
        if (includes(l)(["steem", "alis"])) {
          await db.delete(`usermap_${l}`, data.links[l].username)
        }
      }
      return await t.update(ref, { status: "deleted" })
    })
  }
  let _user = fb.firebase.auth().currentUser
  await _user.delete()
}

const checkUser = async props => {
  return await new Promise(res => {
    setInterval(async () => {
      if (props.user_init === false) {
        res(await checkUser(props))
      } else {
        res(props.user)
      }
    }, 500)
  })
}

function get_code_challenge(str) {
  const hash = sha256.arrayBuffer(str)
  return base64url(hash)
}

function get_code_verifier() {
  const buf = Buffer.alloc(32)
  for (let i = 0; i < buf.length; i++) {
    const random_num = Math.floor(Math.random() * 256)
    buf.writeUInt8(random_num, i)
  }
  return base64url(buf)
}

export const check_alis = async ({
  val: { router },
  props,
  set,
  global,
  conf
}) => {
  const code = router.query.code
  if (isNil(code)) return
  const cookies = parseCookies()
  const alis_verifier = cookies.alis_verifier
  let user = await checkUser(props)
  let login_url = `/api/${$()}/alis-oauth?code=${code}&verifier=${
    cookies.alis_verifier
  }`
  console.log(login_url)
  await _login_with({
    conf,
    global,
    login_url,
    set,
    props,
    provider: "alis",
    val: { nodb: false }
  })
  router.replace(router.pathname, router.pathname, { shallow: true })
}
