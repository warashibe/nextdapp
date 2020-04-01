import _app from "../../components/_app/_app"
import reducer from "../../components/_app/reducer"

// global css can only be imported in /pages/_app.js
import "normalize.css"
import "draft-js/dist/Draft.css"
import conf from "../conf"
import init from "../lib/init"
import assoc from "../lib/assoc"
import mod from "../lib/mod"
import * as epics from "../lib/epics"
const links = [
  {
    rel: "stylesheet",
    href: "https://use.fontawesome.com/releases/v5.7.2/css/all.css",
    integrity:
      "sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr",
    crossorigin: "anonymous"
  }
]
const scripts = []
export default _app({
  conf,
  init,
  reducer: reducer({ init, assoc, mod }),
  links,
  scripts,
  epics
})
