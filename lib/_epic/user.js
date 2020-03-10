import R from "ramdam"
import shortid from "shortid"
import { fb, epic, errlog } from "./util"
let logging = false
import Identicon from "identicon.js"
import { setCookie, parseCookies, destroyCookie } from "nookies"
import conf from "../../src/conf"
const base64url = require("base64url")
const sha256 = require("js-sha256")
const steemconnect = require("steemconnect")
const steem_client = new steemconnect.Client({
  app: conf.steem.app,
  callbackURL: conf.steem.redirect_uri,
  scope: ["login"]
})
import Web3 from "web3"
import { Connect } from "uport-connect"
const userUpdate = async ({ u, set }) => {
  const user = R.isNil(u) ? null : await fb().fsdb.get("users", u.uid)
  logging = false
  set(user, "user")
  set(u, "_user")
  set(true, "user_init")
}

export const changeUser = epic(
  "changeUser",
  async ({ type, val, dispatch, extra, set, to }) => {
    fb()
      .firebase.auth()
      .onAuthStateChanged(async u => {
        if (!logging) await userUpdate({ u, set })
      })
  }
)

export const logout = epic("logout", async ({ type, val, dispatch, extra }) => {
  const auth = await fb().firebase.auth()
  const [err] = await R.err(auth.signOut, auth)()
  errlog(err, err, "ログアウトに失敗しました。もう一度お試し下さい。")
})

export const logout_authereum = epic(
  "logout_authereum",
  async ({ type, val, dispatch, extra }) => {
    const [err] = await R.err(fb().firebase.auth(), "signOut")()
    errlog(err, err, "ログアウトに失敗しました。もう一度お試し下さい。")
  }
)

const link_converter = {
  "twitter.com": (_u, add) =>
    R.mergeLeft(
      {
        username: add.username,
        id_str: add.profile.id_str,
        description: add.profile.description,
        image: add.profile.profile_image_url_https.replace(/_normal/, ""),
        cover: add.profile.profile_banner_url
      },
      _u
    ),

  "facebook.com": (_u, add) =>
    R.mergeLeft(
      {
        name: add.profile.name,
        image: R.hasPath(["profile", "picture", "data", "url"])(add)
          ? add.profile.picture.data.url
          : undefined
      },
      _u
    ),

  "google.com": (_u, add) =>
    R.mergeLeft({ name: add.profile.name, image: add.profile.picture }, _u),

  "alis.to": (_u, add) =>
    R.mergeLeft(
      {
        name: add.user_display_name,
        image: add.icon_image_url,
        description: add.self_introduction,
        username: add.user_id
      },
      _u
    ),
  authereum: (_u, add) =>
    R.mergeLeft(
      {
        address: add.address,
        image: add.image,
        name: add.name
      },
      _u
    ),
  metamask: (_u, add) =>
    R.mergeLeft(
      {
        address: add.address,
        image: add.image,
        name: add.name
      },
      _u
    ),
  uport: (_u, add) =>
    R.mergeLeft(
      {
        id: add.id,
        image: add.image,
        name: add.name
      },
      _u
    ),

  "steemit.com": (_u, add) =>
    R.mergeLeft(
      {
        name: add.name,
        image: add.profile_image,
        description: add.about,
        username: add.id,
        cover: add.cover_image
      },
      _u
    ),

  "github.com": (_u, add) =>
    R.mergeLeft(
      {
        username: add.username,
        name: add.profile.name,
        description: add.profile.bio
      },
      _u
    )
}

// twitter, facebook, google, metamask, alis, uport, 3box
const name_map = {
  uport: "uport",
  metamask: "metamask",
  authereum: "authereum",
  "alis.to": "alis",
  "steemit.com": "steem",
  "twitter.com": "twitter",
  "facebook.com": "facebook",
  "google.com": "google",
  "github.com": "github"
}

const reverse_name_map = R.invertObj(name_map)

const _login = async ({ user, provider, set, _add = {} }) => {
  logging = true
  if (R.hasPath(["user", "uid"])(user)) {
    await fb().fsdb.tx("users", user.user.uid, async ({ data, t, ref }) => {
      let _u = data || { uid: user.user.uid, status: "active" }
      _u.links = R.propOr({}, "links")(_u)
      const add = R.mergeLeft(user.additionalUserInfo, _add)
      for (let v of user.user.providerData) {
        if (R.xNil(link_converter[v.providerId])) {
          _u.links[name_map[v.providerId]] = {
            id: v.uid,
            name: v.displayName,
            image: v.photoURL
          }
          if (provider === v.providerId && R.xNil(add)) {
            _u.links[name_map[v.providerId]] = link_converter[v.providerId](
              _u.links[name_map[v.providerId]],
              add
            )
          }
          _u.links[name_map[v.providerId]] = R.pickBy(R.identity)(
            _u.links[name_map[v.providerId]]
          )
          if (provider === v.providerId && R.xNil(add)) {
            for (let k of ["name", "image", "cover", "description"]) {
              if (
                (R.isNil(_u[k]) || R.hasPath(["profile_update", k])) &&
                R.xNil(_u.links[name_map[v.providerId]][k])
              ) {
                _u[k] = _u.links[name_map[v.providerId]][k]
              }
            }
          }
        }
      }
      _u = R.pickBy(R.identity)(_u)
      await fb().fsdb.upsert(_u, "users", _u.uid)
    })
    await userUpdate({ u: user.user, set })
  }
}

const getProvider = provider => {
  return new (fb()).firebase.auth[
    `${provider[0].toUpperCase()}${provider.slice(1)}AuthProvider`
  ]()
}

export const login = epic(
  "login",
  async ({ type, val: { provider }, dispatch, extra, set, state$ }) => {
    if (provider === "uport") {
      await login_with_uport({ set, state$ })
      return
    } else if (provider === "metamask") {
      await login_with_metamask({ set, state$ })
      return
    } else if (provider === "authereum") {
      await login_with_authereum({ set, state$ })
      return
    } else if (provider === "alis") {
      await login_with_alis({ set, state$ })
      return
    } else if (provider === "steem") {
      await login_with_steem({ set, state$ })
      return
    }
    set(true, "processing")
    const _provider = getProvider(provider)
    const auth = await fb().firebase.auth()
    const [err, user] = await R.err(auth.signInWithPopup, auth)(_provider)
    if (R.xNil(err)) {
      alert("something went wrong")
    } else {
      await _login({ user, provider: reverse_name_map[provider], set })
    }
    set(false, "processing")
  }
)

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

const checkUser = async state$ => {
  return await new Promise(res => {
    setInterval(async () => {
      if (state$.value.user_init === false) {
        res(await checkUser(state$))
      } else {
        res(state$.value.user)
      }
    }, 500)
  })
}

export const check_alis = epic(
  "check_alis",
  async ({ val: { router }, state$, set }) => {
    const code = router.query.code
    router.push(router.pathname, router.pathname, { shallow: true })
    if (R.isNil(code)) {
      return
    }
    set(true, "processing")
    const cookies = parseCookies()
    const alis_verifier = cookies.alis_verifier
    let user = await checkUser(state$)
    let login_url = `/functions/alis-oauth.js?code=${code}&verifier=${
      cookies.alis_verifier
    }`
    await _login_with({ login_url, set, state$, provider: "alis" })
  }
)
const login_with_uport = async ({ set, state$, link = false }) => {
  const uport = new Connect(conf.uport.appname, {
    ethrConfig: {
      rpcUrl: conf.uport.rpcUrl
    }
  })
  const id = shortid.generate()
  const unsub = await fb().fsdb.on("login_read", id, async res => {
    if (R.xNil(res)) {
      unsub()
      await fb().fsdb.delete("login_read", id)
      if (R.xNil(res.token)) {
        const auth = await fb().firebase.auth()
        const [err, user] = await R.err(auth.signInWithCustomToken, auth)(
          res.token
        )
        if (R.xNil(err)) {
          alert("something went wrong")
          set(false, "processing")
          return
        }

        const uid = user.user.uid
        const cert = await fb().fsdb.get("uport", ["uid", "==", uid])
        let add = {
          providerId: "uport",
          uid: uid
        }
        if (R.xNil(cert[0])) {
          add = R.mergeLeft(add, {
            id: cert[0].id,
            name: cert[0].verified[conf.uport.name_field],
            image: `data:image/png;base64,${new Identicon(
              cert[0].did.split(":")[2],
              60
            ).toString()}`
          })
          user.user.providerData.push(add)
          _login({ user, provider: "uport", set, _add: add })
        }
      }
      set(null, "uport")
    }
  })
  let login_url = `/functions/uport-login.js?id=${id}`
  if (link) login_url += `&uid=${state$.value.user.uid}`
  const json = await fetch(login_url).then(r => r.json())
  set(json, "uport")
}
const login_with_authereum = async ({ set, state$ }) => {
  if (R.xNil(window)) {
    set(true, "processing")
    const provider = state$.value.authereum.getProvider()
    await provider.enable()
    const address = await state$.value.authereum.getAccountAddress()
    if (R.xNil(address)) {
      const id = shortid.generate()
      await fb().fsdb.set({ address: address }, "login", id)
      const signature = await web3_authereum.eth.sign(id, address)
      const login_url = `https://${conf.firebase.region}-${
        conf.firebase.id
      }.cloudfunctions.net/login_authereum?data=${id}&signature=${signature}`
      const res = await fetch(login_url).then(response => response.json())
      const auth = await fb().firebase.auth()
      const [err, user] = await R.err(auth.signInWithCustomToken, auth)(
        res.token
      )
      if (R.xNil(err)) {
        alert("something went wrong")
        set(false, "processing")
        return
      }
      const add = {
        address: res.address,
        providerId: "authereum",
        uid: user.user.uid,
        image: `data:image/png;base64,${new Identicon(
          res.address,
          60
        ).toString()}`
      }
      user.user.providerData.push(add)
      _login({ user, provider: "authereum", set, _add: add })
      set(false, "processing")
      if (window != undefined) {
        const Box = require("3box")
        const box = await Box.openBox(res.address, provider)
        let profile = await Box.getProfile(res.address)
        if (R.xNil(profile))
          _login({ user, provider: "authereum", set, _add: profile })
      }
    }
    set(false, "processing")
  }
}
const login_with_metamask = async ({ set, state$ }) => {
  if (R.xNil(window)) {
    set(true, "processing")
    const address = await state$.value.eth_selected
    if (R.xNil(address)) {
      const id = shortid.generate()
      await fb().fsdb.set({ address: address }, "login", id)
      const [err, signature] = await R.err(web3.eth.personal.sign, web3)(
        id,
        address
      )
      if (R.xNil(err)) {
        alert("something went wrong")
        set(false, "processing")
        return
      }
      const login_url = `https://${conf.firebase.region}-${
        conf.firebase.id
      }.cloudfunctions.net/login_metamask?data=${id}&signature=${signature}`
      const res = await fetch(login_url).then(response => response.json())
      const auth = await fb().firebase.auth()
      const [err2, user] = await R.err(auth.signInWithCustomToken, auth)(
        res.token
      )
      if (R.xNil(err2)) {
        alert("something went wrong")
        set(false, "processing")
        return
      }
      const add = {
        address: res.address,
        providerId: "metamask",
        uid: user.user.uid,
        image: `data:image/png;base64,${new Identicon(
          res.address,
          60
        ).toString()}`
      }
      user.user.providerData.push(add)
      _login({ user, provider: "metamask", set, _add: add })
      set(false, "processing")
      if (window != undefined) {
        const Box = require("3box")
        const box = await Box.openBox(res.address, window.web3.currentProvider)
        let profile = await Box.getProfile(res.address)
        if (R.xNil(profile))
          _login({ user, provider: "metamask", set, _add: profile })
      }
    }
  }
}

const login_with_alis = async ({ set }) => {
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

const _login_with = async ({ set, state$, login_url, provider }) => {
  if (R.hasPath(["value", "user", "uid"])(state$)) {
    login_url += `&uid=${state$.value.user.uid}`
  }
  const res = await fetch(login_url).then(response => response.json())
  if (R.xNil(res.user)) {
    const auth = await fb().firebase.auth()
    if (R.hasPath(["token", "err"])(res) && R.xNil(res.token.err)) {
      alert(res.token.err)
      set(false, "processing")
      return
    }
    const [err, user] = await R.err(auth.signInWithCustomToken, auth)(
      res.token.token
    )
    if (R.xNil(err)) {
      alert("something went wrong")
      set(false, "processing")
      return
    }
    user.user.providerData.push({
      providerId: reverse_name_map[provider],
      uid: user.uid
    })
    _login({ user, provider: reverse_name_map[provider], set, _add: res.user })
    set(false, "processing")
  }
}

const login_with_steem = async ({ set, state$, link = false }) => {
  const [err, code] = await R.p(steem_client, "login")({})
  if (errlog(err, err, "Something went wrong!")) {
    return
  }
  let login_url = `/functions/steem-oauth.js?code=${code}`
  if (link) login_url += `&uid=${state$.value.user.uid}`
  await _login_with({
    login_url: login_url,
    set,
    state$,
    provider: "steem"
  })
}

export const deleteAccount = epic(
  "deleteAccount",
  async ({ type, val: { user }, dispatch, extra, set }) => {
    set(true, "processing")
    await fb().fsdb.tx("users", user.uid, async ({ t, ref, data }) => {
      for (let l in data.links || {}) {
        const fsdb = fb().fsdb
        let err = null
        if (R.includes(l)(["metamask", "authereum"])) {
          ;[err] = await R.err(fsdb.delete)(`wallet`, data.links[l].address)
          if (R.xNil(err)) console.log(err)
        } else if (R.includes(l)(["uport"])) {
          await fsdb.delete(`uport`, data.links[l].id)
        } else if (R.includes(l)(["steem", "alis"])) {
          await fsdb.delete(`usermap_${l}`, data.links[l].username)
        }
      }
      return await t.update(ref, { status: "deleted" })
    })
    let _user = fb().firebase.auth().currentUser
    await _user.delete()
    set(false, "processing")
  }
)

export const linkAccount = epic(
  "linkAccount",
  async ({ type, val: { provider, user }, dispatch, extra, set, state$ }) => {
    if (provider === "uport") {
      set(true, "processing")
      await login_with_uport({ set, state$, link: true })
    } else if (provider === "steem") {
      await login_with_steem({ set, state$, link: true })
      return
    } else if (provider === "alis") {
      set(true, "processing")
      await login_with_alis({ set })
      return
    } else {
      set(true, "processing")
      const _provider = getProvider(provider)
      const currentUser = await fb().firebase.auth().currentUser
      const [err, result] = await R.err(currentUser.linkWithPopup, currentUser)(
        _provider
      )
      if (R.xNil(err)) {
        if (R.xNil(err.code)) {
          alert(err.code)
        } else {
          alert("something went wrong")
        }
        set(false, "processing")
        return
      } else {
        await _login({
          user: result,
          provider: reverse_name_map[provider],
          set
        })
        await userUpdate({ u: result.user, set })
        set(false, "processing")
      }
    }
  }
)
export const unlinkAccount = epic(
  "unlinkAccount",
  async ({ type, val: { provider, user }, dispatch, extra, set }) => {
    set(true, "processing")
    if (R.includes(provider)(["metamask", "authereum"])) {
      await fb().fsdb.delete(`wallet`, user.links[provider].address)
    } else if (R.includes(provider)(["uport"])) {
      await fb().fsdb.delete(`uport`, user.links[provider].id)
    } else if (R.includes(provider)(["steem", "alis"])) {
      await fb().fsdb.delete(
        `usermap_${provider}`,
        user.links[provider].username
      )
    } else {
      const _provider = getProvider(provider)
      const result = await fb()
        .firebase.auth()
        .currentUser.unlink(reverse_name_map[provider])
    }
    await fb().fsdb.tx("users", user.uid, async ({ t, data, ref }) => {
      let links = data.links
      delete links[provider]
      await t.update(ref, { links: links })
    })
    await userUpdate({ u: user, set })
    set(false, "processing")
  }
)

export const init = {
  user: null,
  user_init: false,
  uport: null
}
