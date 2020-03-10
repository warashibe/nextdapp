const withOffline = require("next-offline")
const nextConfig = {
  target: "serverless",
  transformManifest: manifest => ["/"].concat(manifest),
  generateInDevMode: true,
  generateSw: false,
  workboxOpts: {
    swDest: "static/service-worker.js",
    swSrc: __dirname + "/lib/sw.js"
  }
}

module.exports = withOffline(nextConfig)
