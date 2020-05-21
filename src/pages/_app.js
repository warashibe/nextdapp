import { Fragment } from "react"
import { Provider } from "react-redux"
import withRedux from "next-redux-wrapper"
import { _app, reducer } from "nd-core"
import "normalize.css"
import "draft-js/dist/Draft.css"
import conf from "../conf"
import init from "../lib/init"
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
const { initStore, PostScripts, MyHead } = _app({
  conf,
  init,
  reducer: reducer({ init }),
  links,
  scripts,
  epics
})
export default withRedux(initStore)(({ Component, pageProps, store }) => {
  return (
    <Fragment>
      <MyHead />
      <Provider store={store}>
        <Component {...pageProps} _conf={conf} />
      </Provider>
      <PostScripts />
    </Fragment>
  )
})
