const functions = require("firebase-functions")
const R = require("ramdam")
const uuid = require("uuid/v4")
const admin = require("firebase-admin")
admin.initializeApp()
const sweet = require("firestore-sweet")
const fsdb = sweet(admin.firestore)
const conf = require("./conf")
const util = require("ethereumjs-util")
const Web3 = require("web3")
const validateContractSignature = require("is-valid-signature")
const provider = new Web3.providers.HttpProvider(conf.web3.infura)
const web3 = new Web3(provider)
const { Credentials } = require("uport-credentials")
const Resolver = require("did-resolver").Resolver
const getResolver = require("ethr-did-resolver").getResolver
const providerConfig = { rpcUrl: conf.uport.rpcUrl }
const credentials = new Credentials({
  appName: conf.uport.appName,
  did: conf.uport.did,
  privateKey: conf.uport.privateKey,
  resolver: new Resolver(getResolver(providerConfig))
})

exports.login_uport = functions.https.onRequest(async (req, res) => {
  const jwt = req.body.access_token
  const auth = await credentials.authenticateDisclosureResponse(jwt)
  const cert = auth[conf.uport.verified]
  const id = cert[conf.uport.id_field]
  if (R.isNil(cert)) {
    await fsdb.set(
      { token: null, err: "certificate doesn't exist" },
      "login_read",
      req.query.id
    )
    res.send(JSON.stringify({ success: true }))
    return
  } else {
    const exist = await fsdb.get("uport", id)
    let uid = req.query.uid || null
    if (R.xNil(uid) && R.xNil(exist) && exist.uid !== uid) {
      await fsdb.set(
        { token: null, err: "uid exists" },
        "login_read",
        req.query.id
      )
      res.send(JSON.stringify({ success: true }))
      return
    }
    if (R.xNil(exist)) {
      uid = exist.uid
    } else {
      if (R.isNil(uid)) {
        uid = uuid()
      }
      await fsdb.set(
        {
          verified: cert,
          name: conf.uport.verified,
          uid: uid,
          id: id,
          did: auth.did
        },
        "uport",
        id
      )
    }
    const token = await admin.auth().createCustomToken(uid)

    await fsdb.set({ token: token }, "login_read", req.query.id)

    res.send(JSON.stringify({ success: true }))
  }
})

exports.login_metamask = functions.https.onRequest(async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  const { signature, data } = req.query
  let uid = req.query.uid
  const login = await fsdb.get("login", data)
  if (R.isNil(login)) {
    res.send({ err: "no data" })
    return
  }
  const address = login.address
  const msg = new Buffer(data)
  const resp = util.fromRpcSig(signature)
  const prefix = new Buffer("\x19Ethereum Signed Message:\n")
  const prefixedMsg = web3.utils.sha3(
    Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
  )
  const pubKey = util.ecrecover(
    util.toBuffer(prefixedMsg),
    resp.v,
    resp.r,
    resp.s
  )
  const addrBuf = util.pubToAddress(pubKey)
  const addr = util.bufferToHex(addrBuf)
  if (R.isNil(addr) || addr !== address) {
    res.send({ verified: false, err: "signature is invalid" })
  } else {
    const wallet = await fsdb.get("wallet", address)
    if (R.has("uid")(wallet) && R.isNotNil(uid)) {
      res.send({ err: "account already in use" })
    } else {
      let set = false
      if (R.isNil(uid)) {
        if (R.has("uid")(wallet)) {
          uid = wallet.uid
        } else {
          uid = uuid()
          set = true
        }
      } else {
        set = true
      }
      if (set)
        fsdb.set(
          {
            uid: uid,
            address: address,
            authereum: false,
            main: true
          },
          "wallet",
          address
        )
      const customToken = await admin.auth().createCustomToken(uid)
      res.send({
        verified: true,
        err: null,
        address: address,
        uid: uid,
        token: customToken
      })
    }
  }
})

exports.login_authereum = functions.https.onRequest(async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  const { signature, data } = req.query
  let uid = req.query.uid
  const login = await fsdb.get("login", data)
  if (R.isNil(login)) {
    res.send({ err: "no data" })
    return
  }
  const address = login.address
  const verified = await validateContractSignature(
    address,
    web3.utils.utf8ToHex(data),
    signature,
    provider
  )
  if (verified === false) {
    res.send({ verified, err: "signature is invalid" })
  } else {
    const wallet = await fsdb.get("wallet", address)
    if (R.has("uid")(wallet) && R.isNotNil(uid)) {
      res.send({ err: "account already in use" })
    } else {
      let set = false
      if (R.isNil(uid)) {
        if (R.has("uid")(wallet)) {
          uid = wallet.uid
        } else {
          uid = uuid()
          set = true
        }
      } else {
        set = true
      }
      if (set)
        fsdb.set(
          {
            uid: uid,
            address: address,
            authereum: true,
            main: true
          },
          "wallet",
          address
        )
      const customToken = await admin.auth().createCustomToken(uid)
      res.send({
        verified,
        err: null,
        address: address,
        uid: uid,
        token: customToken
      })
    }
  }
})

exports.login = functions.https.onRequest(async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  let err = null
  try {
    const user_id = req.query.user_id
    const target = req.query.target || "alis"
    let uid = req.query.uid
    const dbname = `usermap_${target}`
    const user = await fsdb.get(dbname, user_id)
    if (R.has("uid")(user) && R.isNotNil(uid)) {
      res.send({ err: "account already in use" })
    } else {
      let set = false
      if (R.isNil(uid)) {
        if (R.has("uid")(user)) {
          uid = user.uid
        } else {
          uid = uuid()
          set = true
        }
      } else {
        set = true
      }
      if (set)
        fsdb.set(
          {
            uid: uid,
            token: decodeURIComponent(req.query.token),
            refresh: decodeURIComponent(req.query.refresh)
          },
          dbname,
          user_id
        )
      const customToken = await admin.auth().createCustomToken(uid)
      res.send(JSON.stringify({ err: null, token: customToken, uid: uid }))
    }
  } catch (e) {
    console.log(e)
    res.send({ err: e.toString() })
  }
})
