const { parse } = require("url")
const rp = require("request-promise")
const conf = require(`../src/conf`)
console.log(conf)
const steemconnect = require("steemconnect")
const R = require("ramdam")
require("isomorphic-fetch")
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const { query } = parse(req.url, true)
  const client = new steemconnect.Client({
    app: "ocrybit",
    callbackURL: conf.steem.redirect_uri,
    scope: ["login"],
    accessToken: query.code
  })
  try {
    let me = await new Promise((r, e) => {
      client.me((err, res) => {
        if (err != null) {
          e(r)
        } else {
          r(res)
        }
      })
    })
    if (me.account != undefined) {
      let r2 = {}
      try {
        r2 = JSON.parse(me.account.json_metadata).profile
      } catch (e) {
        r2 = {}
      }
      r2.id = me.user
      let func_url = `https://${conf.firebase.region}-${
        conf.firebase.id
      }.cloudfunctions.net/login`
      let href = ""
      if (R.isNotNil(query.uid)) {
        href = `${func_url}?target=steem&uid=${
          R.isArray(query.uid) ? query.uid[0] : query.uid
        }&user_id=${r2.id}&token=${
          query.code
        }&refresh=&name=${encodeURIComponent(
          r2.name || r2.id
        )}&img=${encodeURIComponent(r2.profile_image)}`
      } else {
        href = `${func_url}?target=steem&user_id=${r2.id}&token=${
          query.code
        }&refresh=""&name=${encodeURIComponent(
          r2.name || r2.id
        )}&img=${encodeURIComponent(r2.profile_image)}`
      }
      let token = await fetch(href).then(r => r.json())
      res.end(JSON.stringify({ cred: query.code, user: r2, token: token }))
    } else {
      res.end(JSON.stringify({ e: "no account" }))
    }
  } catch (e) {
    console.log(e)
    res.end(JSON.stringify(e))
  }
}
