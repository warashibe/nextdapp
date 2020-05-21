const CoinGecko = require("coingecko-api")
const CoinGeckoClient = new CoinGecko()
import { fb, errlog } from "./util"
import { epic } from "nd-core"
export const getTokenPrices = epic(
  "getTokenPrices",
  async ({ type, val, dispatch, extra, set, to }) => {
    let data = await CoinGeckoClient.simple.price({
      ids: val.token_ids,
      vs_currencies: val.currencies
    })
    if (data.success) {
      set(data.data, "token_prices")
    }
  }
)

export const init = {
  token_prices: {}
}
