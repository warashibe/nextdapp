import { hasPath, complement, isNil } from "ramda"
const xNil = complement(isNil)
const { parse } = require("url")
require("isomorphic-fetch")
const toParams = params =>
  Object.keys(params)
    .map(key => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    })
    .join("&")

import conf from "nd/conf"
const NodeRSA = require("node-rsa")
const toRSAPublic = key =>
  `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
const toRSAPrivate = key =>
  `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`

export default async (req, res) => {
  const key = new NodeRSA(toRSAPublic(conf.rsa.public))
  key.importKey(
    toRSAPrivate(process.env.RSA_PRIVATE.replace(/\\n/g, "\n")),
    "private"
  )
  const { client_id } = conf.alis
  const base64 = new Buffer(
    client_id + ":" + process.env.ALIS_CLIENT_SECRET
  ).toString("base64")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const { query } = parse(req.url, true)
  try {
    const r = await fetch("https://alis.to/oauth2/token", {
      headers: {
        Authorization: "Basic " + base64,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      body: toParams({
        grant_type: "authorization_code",
        code: query.code,
        redirect_uri: conf.alis.redirect_uri,
        code_verifier: query.verifier
      })
    }).then(r => r.json())
    if (xNil(r.error_message)) {
      res.end(JSON.stringify(r))
    } else {
      try {
        let op = {
          headers: {
            Authorization: r.access_token,
            "Content-Type": "application/json; charset=utf-8"
          }
        }
        let user = JSON.parse(
          unescape(
            await fetch("https://alis.to/oauth2api/me/info", op).then(r =>
              r.text()
            )
          )
        )
        const json_str = JSON.stringify({
          uid: query.uid,
          token: r.access_token,
          refresh: r.refresh_token,
          user: user,
          crypt_id: query.crypt_id
        })
        const obj = key.encrypt(json_str, "base64")
        const sign = key.sign(json_str, "base64", "utf8")
        const base_url = hasPath(["functions", "base_url"])(conf)
          ? conf.functions.base_url
          : `https://${conf.fb.region}-${conf.fb.id}.cloudfunctions.net`
        const href = `${base_url}/login?data=${encodeURIComponent(
          obj
        )}&signature=${encodeURIComponent(sign)}`
        const reg = await fetch(href).then(r => r.json())
        const json_str_reg = key.decrypt(reg.data, "utf8")
        const verify = key.verify(json_str_reg, reg.signature, "utf8", "base64")
        const json = JSON.parse(json_str_reg)
        if (verify) {
          res.end(JSON.stringify(json))
        } else {
          res.end(JSON.stringify({ err: "signature invalid" }))
        }
      } catch (e) {
        console.log(e)
        res.end(JSON.stringify(e))
      }
    }
  } catch (e) {
    console.log(e)
    res.end(JSON.stringify(e))
  }
}
