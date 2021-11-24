import url from "url"
import { complement, isNil } from "ramda"

export const xNil = complement(isNil)

export const getURL = async ({ set }) => {
  if (xNil(window)) {
    set(url.parse(window.location.href, true), "url")
  }
}
getURL.props = ["url"]
