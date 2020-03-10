const { Credentials } = require("uport-credentials")
const message = require("uport-transports").message.util
const transports = require("uport-transports").transport
const decodeJWT = require("did-jwt").decodeJWT
const { parse } = require("url")
const rp = require("request-promise")
const conf = require(`../src/conf`)
const R = require("ramdam")
require("isomorphic-fetch")
console.log(conf)
const Resolver = require("did-resolver").Resolver
const getResolver = require("ethr-did-resolver").getResolver
const providerConfig = { rpcUrl: conf.uport.rpcUrl }
const credentials = new Credentials({
  appName: conf.uport.appName,
  did: conf.uport.did,
  privateKey: conf.uport.privateKey,
  resolver: new Resolver(getResolver(providerConfig))
})

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const { query } = parse(req.url, true)
  let callbackUrl = `https://us-central1-${
    conf.firebase.id
  }.cloudfunctions.net/login_uport?id=${query.id}`
  if (R.xNil(query.uid)) {
    callbackUrl += `&uid=${query.uid}`
  }
  let obj = {
    notifications: true,
    verified: [conf.uport.verified],
    callbackUrl: callbackUrl
  }
  console.log(obj)
  const requestToken = await credentials.createDisclosureRequest(obj)
  const uri = message.paramsToQueryString(message.messageToURI(requestToken), {
    callback_type: "post"
  })
  const qr = transports.ui.getImageDataURI(uri)
  res.end(JSON.stringify({ qr: qr, uri: uri }))
}
