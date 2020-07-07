const functions = require("firebase-functions")
const admin = require("firebase-admin")
const sweet = require("firestore-sweet")
const R = require("ramda")
const xNil = R.complement(R.isNil)
const uuid = require("uuid/v4")
admin.initializeApp()
const db = sweet(admin.firestore)
const NodeRSA = require("node-rsa")

const toRSAPublic = key =>
  `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`

const toRSAPrivate = key =>
  `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`

const getKey = () => {
  const key = new NodeRSA(toRSAPrivate(process.env.RSA_PRIVATE))
  key.importKey(toRSAPublic(process.env.RSA_PUBLIC), "public")
  return key
}

const sendCrypt = async (key, crypt_id, _data) => {
  let decrypted = null
  let err = null
  try {
    decrypted = key.decrypt(crypt_id, "utf8")
    const data = await new Promise(async res => {
      let once = false
      let to = null
      const unsubscribe = await db.on("crypt", decrypted, async data => {
        if (data !== null) {
          if (once === false) {
            res(data)
            once = true
            await unsubscribe()
          }
        }
      })
      to = setTimeout(async () => {
        try {
          await unsubscribe()
        } catch (e) {}
      }, 10000)
    })
    const public_key = key.decrypt(data.public_key, "utf8")
    const key2 = new NodeRSA(public_key)
    const obj = key2.encrypt(JSON.stringify(_data), "base64")
    await db.update({ value: obj }, "crypt", decrypted)
  } catch (e) {
    console.log(e)
    err = true
  }
  setTimeout(async () => {
    try {
      await db.delete("crypt", decrypted)
    } catch (e) {}
  }, 3000)
  return err
}
exports.crypt = functions.https.onRequest(async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )

  const key = getKey()
  const crypt_id = req.query.crypt_id
  const err = sendCrypt(key, crypt_id, { token: 3 })
  res.send({ err })
})

const verifyRequest = (key, req) => {
  const signature = decodeURIComponent(req.query.signature)
  const data = decodeURIComponent(req.query.data)
  const json_raw = key.decrypt(data, "utf8")
  const json = JSON.parse(json_raw)
  const verify = key.verify(json_raw, signature, "utf8", "base64")
  return { json, verify }
}

const sender = (key, res, json) => {
  const json_raw = JSON.stringify(json)
  const obj = key.encrypt(json_raw, "base64")
  const sign = key.sign(json_raw, "base64", "utf8")
  res.send({ data: obj, signature: sign })
}

exports.login = functions.https.onRequest(async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  const key = getKey()
  const { json, verify } = verifyRequest(key, req)
  console.log(json)
  const { crypt_id, token, refresh, user: _user } = json
  console.log(token)
  console.log(refresh)
  let uid = json.uid || null
  const target = json.target || "alis"
  const { user_id, user_display_name: name, icon_image_url: img } = _user
  if (verify === false) {
    sender(key, res, { err: "signature invalid" })
    return
  }
  if (R.isNil(crypt_id)) {
    await sendCrypt(key, crypt_id, { err: "crypt_id not found" })
    sender(key, res, { err: "crypt_id not found" })
    return
  }
  let err = null
  try {
    const dbname = `_usermap_${target}`
    const user = await db.get(dbname, user_id)
    if (R.has("uid")(user) && xNil(uid)) {
      await sendCrypt(key, crypt_id, { err: "account already in use" })
      sender(key, res, { err: "account already in use" })
    } else {
      if (R.isNil(uid)) {
        if (R.has("uid")(user)) {
          uid = user.uid
        } else {
          uid = uuid()
        }
      }
      db.upsert(
        {
          uid: uid,
          token: token,
          refresh: refresh,
          login: Date.now()
        },
        dbname,
        user_id
      )
      const cred = {
        token: await admin.auth().createCustomToken(uid),
        user: _user
      }
      const err = await sendCrypt(key, crypt_id, cred)
      sender(key, res, { err: err })
    }
  } catch (e) {
    console.log(e)
    await sendCrypt(key, crypt_id, { err: e.toString() })
    sender(key, res, { err: e.toString() })
  }
})
