import R from "ramdam"
import { fb, epic } from "./util"
import conf from "../../src/conf"
const mainnet_genesis =
  "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"
const testnet_genesis =
  "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"

export const hookVeChain = epic("hookVeChain", async ({ val, set }) => {
  if (window.connex != undefined) {
    console.log(window.connex.thor.genesis)
    set(
      window.connex.thor.genesis.id === mainnet_genesis ? "W" : "T",
      "vechain_network"
    )
  }
})

export const init = {
  vechain_network: null
}
