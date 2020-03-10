const { parse } = require("url")
const rp = require("request-promise")
const conf = require(`../src/conf`)
const client_id = conf.alis.client_id
const client_secret = conf.alis.client_secret
const base64 = new Buffer(client_id + ":" + client_secret).toString("base64")
require("isomorphic-fetch")
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const { query } = parse(req.url, true)
  try {
    let r = JSON.parse(
      await rp({
        url: "https://alis.to/oauth2/token",
        headers: {
          Authorization: "Basic " + base64,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        form: {
          grant_type: "authorization_code",
          code: query.code,
          redirect_uri: conf.alis.redirect_uri,
          code_verifier: query.verifier
        }
      })
    )
    console.log(r)
    try {
      let op = {
        url: "https://alis.to/oauth2api/me/info",
        headers: {
          Authorization: r.access_token,
          "Content-Type": "application/json; charset=utf-8"
        }
      }
      let func_url = `https://${conf.firebase.region}-${
        conf.firebase.id
      }.cloudfunctions.net/login`
      let r2 = JSON.parse(unescape(await rp(op)))
      let href = ""
      if (query.uid != undefined) {
        href = `${func_url}?uid=${query.uid}&user_id=${r2.user_id}&token=${
          r.access_token
        }&refresh=${r.refresh_token}&name=${encodeURIComponent(
          r2.user_display_name
        )}&img=${encodeURIComponent(r2.icon_image_url)}`
      } else {
        href = `${func_url}?user_id=${r2.user_id}&token=${
          r.access_token
        }&refresh=${r.refresh_token}&name=${encodeURIComponent(
          r2.user_display_name
        )}&img=${encodeURIComponent(r2.icon_image_url)}`
      }
      let token = await fetch(href).then(r => r.json())
      res.end(JSON.stringify({ cred: r, user: r2, token: token }))
    } catch (e) {
      console.log(e)
      res.end(JSON.stringify(e))
    }
  } catch (e) {
    console.log(e)
    res.end(JSON.stringify(e))
  }
}
