const path = require("path")
const withOffline = require("next-offline")
const R = require("ramdam")

const nextConfig = {
  target: "serverless",
  transformManifest: manifest => ["/"].concat(manifest),
  generateInDevMode: true,
  generateSw: false,
  workboxOpts: {
    swDest: "public/static/service-worker.js",
    swSrc: __dirname + "/lib/sw.js"
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    R.compose(
      R.forEach(
        v =>
          (config.resolve.alias[v] = path.resolve(
            __dirname,
            `node_modules/${v}`
          ))
      ),
      R.reduce(R.concat, ["next-redux-wrapper", "react-redux"]),
      R.filter(R.xNil),
      R.pluck("peer"),
      R.values
    )(require("./nd/.plugins"))
    return config
  }
}

module.exports = withOffline(nextConfig)
