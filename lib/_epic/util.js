import { ofType } from "redux-observable"
import url from "url"
import R from "ramdam"
import conf from "../../src/conf"
import { epic } from "nd-core"
import {
  tap,
  switchMap,
  mergeMap,
  ignoreElements,
  map,
  distinctUntilChanged
} from "rxjs/operators"
let storage, firebase, fsdb, firestore, FieldValue
const _fb = require("../firestore-short").fb
export const fb = () => {
  if (R.isNil(fsdb))
    ({ storage, firebase, fsdb, firestore, FieldValue } = _fb(conf))

  return { firestore, storage, firebase, fsdb, FieldValue }
}

export const merge = (action$, state$) =>
  action$.pipe(
    ofType("merge$"),
    mergeMap(async ({ type, val, dispatch, extra }) => {
      return { type: "merge", val: { val: val } }
    })
  )

export const _checkHeight = ({
  val: { ids, _default, delay = 0 },
  dispatch,
  set,
  state$
}) => {
  if (R.xNil(window)) {
    let missing = false
    let tries = 0
    const check = () => {
      tries += 1
      setTimeout(() => {
        let _height = window.innerHeight
        const h1 = document.getElementById(ids[0])
        if (R.xNil(h1)) {
          _height -= h1.offsetHeight
          if (ids.length > 1) {
            for (let v of ids.slice(1)) {
              const h = document.getElementById(v)
              if (R.xNil(h)) {
                _height -= h.offsetHeight
              } else {
                missing = true
              }
            }
          }
        } else {
          missing = true
        }
        if (missing === false) {
          set(_height, "height")
        } else {
          if (tries < 5) {
            check()
          }
        }
      }, delay)
    }
    check()
  }
}
export const checkHeight = epic("checkHeight", _checkHeight)

export const init = {
  processing: false,
  ongoing: {},
  tab: "default",
  subtab: "default",
  height: null,
  url: null,
  lang: "en"
}

export const getURL = epic(
  "getURL",
  async ({ type, val, dispatch, extra, set, to }) => {
    if (R.xNil(window)) {
      set(url.parse(window.location.href, true), "url")
    }
  }
)

export const errlog = (err, log, _alert_message) => {
  if (R.xNil(err)) {
    if (R.xNil(log)) console.log(log)
    if (R.xNil(alert)) alert(_alert_message)
  }
  return R.xNil(err)
}
