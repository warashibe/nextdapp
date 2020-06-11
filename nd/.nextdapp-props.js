let props = {}
const mergeProps = (name, obj) => {
  for (const k in obj) {
    props[`${k}$${name}`] = obj[k]
  }
}
mergeProps("core", require("@nextdapp/core").init)
mergeProps("util", require("@nextdapp/util").init)
mergeProps("firebase", require("@nextdapp/firebase").init)
mergeProps("account", require("@nextdapp/account").init)
mergeProps("web3", require("@nextdapp/web3").init)
mergeProps("wallet", require("@nextdapp/wallet").init)
mergeProps("uniswap", require("@nextdapp/uniswap").init)
mergeProps("editor", require("@nextdapp/editor").init)
mergeProps("dev", require("@nextdapp/dev").init)
mergeProps("blog", require("@nextdapp/blog").init)
mergeProps("nav", require("@nextdapp/nav").init)
export default props