// react & nextjs
import React from "react"
import Head from "next/head"

// redux
import { Provider } from "react-redux"
import withRedux from "next-redux-wrapper"
import { createStore, applyMiddleware } from "redux"
import thunkMiddleware from "redux-thunk"
import { createEpicMiddleware, combineEpics } from "redux-observable"

// global packages
import "isomorphic-fetch"

//misc
import R from "ramdam"

export default ({
  conf,
  init,
  reducer,
  links,
  scripts,
  epics,
  fonts,
  plugins
}) => {
  const epicMiddleware = createEpicMiddleware()
  const initStore = (initialState = init) => {
    const store = createStore(
      reducer,
      initialState,
      applyMiddleware(thunkMiddleware, epicMiddleware)
    )
    epicMiddleware.run(combineEpics(...R.values(epics)))
    return store
  }
  const { css, js } = R.compose(
    R.evolve({
      js: R.map(v => {
        let obj = R.isString(v) ? { src: v } : v
        if (R.includes("integrity")(R.keys(obj))) obj.crossorigin = "anonymous"
        return obj
      }),
      css: R.map(v => {
        let obj = R.isString(v) ? { href: v } : v
        if (R.includes("integrity")(R.keys(obj))) obj.crossorigin = "anonymous"
        obj.rel = "stylesheet"
        obj.type = "text/css"
        return obj
      })
    }),
    R.reduce(
      (acc, v) => {
        return R.evolve(
          { js: R.concat(R.__, v.js || []), css: R.concat(R.__, v.css || []) },
          acc
        )
      },
      { js: [], css: [] }
    ),
    R.values
  )(plugins)
  links = R.concat(links, css)
  scripts = R.concat(scripts, js)
  return withRedux(initStore)(({ Component, pageProps, store }) => {
    return (
      <React.Fragment>
        <Head>
          <meta key="charset" charset="utf-8" />
          <title key="title">{conf.html.title}</title>
          <meta
            key="description"
            name="description"
            content={conf.html.description}
          />
          <link
            key="shortcut-icon"
            rel="shortcut icon"
            href={`/static/favicon.ico`}
            type="image/x-icon"
          />
          <link
            key="icon"
            rel="icon"
            href={`/static/favicon.ico`}
            type="image/x-icon"
          />
          <link
            key="icon-192"
            rel="icon"
            sizes="192x192"
            href="/static/images/icon-192x192.png"
          />
          <link
            key="apple-touch-icon"
            rel="apple-touch-icon"
            href="/static/images/icon-192x192.png"
          />
          <link key="manifest" rel="manifest" href="/static/manifest.json" />
          <meta
            key="theme-color"
            name="theme-color"
            content={conf.html["theme-color"]}
          />

          <meta
            key="twitter:card"
            property="twitter:card"
            content="summary_large_image"
          />
          <meta
            key="twitter:title"
            property="twitter:title"
            content={conf.html.title}
          />
          <meta
            key="twitter:description"
            property="twitter:description"
            content={conf.html.description}
          />

          <meta
            key="twitter:image"
            property="twitter:image"
            content={conf.html.image}
          />
          <meta key="og:title" property="og:title" content={conf.html.title} />
          <meta
            key="og:description"
            property="og:description"
            content={conf.html.description}
          />
          <meta key="og:image" property="og:image" content={conf.html.image} />
          {R.addIndex(R.map)((v, i) => <link key={`css-${i}`} {...v} />)(links)}
          {R.addIndex(R.map)((v, i) => (
            <link
              key={`font-${i}`}
              href={`https://fonts.googleapis.com/css?family=${v}`}
              rel="stylesheet"
              type="text/css"
            />
          ))(fonts || [])}
        </Head>
        <Provider store={store}>
          <Component {...pageProps} _conf={conf} />
        </Provider>
        <script src="https://www.gstatic.com/firebasejs/7.8.0/firebase.js" />
        {R.map(v => <script {...v} />)(scripts)}
      </React.Fragment>
    )
  })
}
