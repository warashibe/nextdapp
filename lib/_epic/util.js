import { ofType } from "redux-observable"
import url from "url"
import R from "ramdam"
import conf from "../../src/conf"
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

export const epic = (name, func) => (action$, state$) =>
  action$.pipe(
    ofType(`${name}$`),
    tap(async ({ type, val, dispatch, extra }) => {
      const set = (val, field) => {
        ;(state$.value.dp || dispatch)({
          type: "set",
          val: { val: val, field: field }
        })
      }
      const to = (type, val, extra) => {
        ;(state$.value.dp || dispatch)({ type: type, val: val, extra: extra })
      }

      func({ type, val, dispatch, extra, set, action$, state$, name, to })
    }),
    ignoreElements()
  )

export const set = (action$, state$) =>
  action$.pipe(
    ofType("set$"),
    mergeMap(async ({ type, val, dispatch, extra }) => {
      return { type: "set", val: { val: val, field: extra } }
    })
  )

export const merge = (action$, state$) =>
  action$.pipe(
    ofType("merge$"),
    mergeMap(async ({ type, val, dispatch, extra }) => {
      return { type: "merge", val: { val: val } }
    })
  )

export const tracker = epic("tracker", ({ val, dispatch, set, state$ }) => {
  let track = state$.value.track
  if (val.global !== true) {
    track = R.pickBy((v, k) => R.includes(k)(["global", val.id]))(track)
  }
  for (let k in val.tracks) {
    const id = val.global ? "global" : val.id
    track[id] = R.propOr({}, id)(track)
    track[id][k] = val.tracks[k]
  }
  set(track, "track")
  set(dispatch, "dp")
})

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

export const track = (action$, state$) =>
  action$.pipe(
    map(() => state$.value),
    distinctUntilChanged((p, q) => {
      const eq = R.equals(p, q)
      if (!eq) {
        if (state$.value.dp != undefined) {
          const set = (val, field) => {
            state$.value.dp({ type: "set", val: { val: val, field: field } })
          }
          const to = (type, val, extra) => {
            state$.value.dp({ type: type, val: val, extra: extra })
          }

          state$.value.dp({ type: "set", val: { val: 6, field: "tester2" } })
          const diff = R.pickBy((v, k) => {
            return v !== p[k]
          })(q)
          const before = R.pickAll(R.keys(diff))(p)
          let track = state$.value.track
          const diff_keys = R.keys(diff)
          for (const k in track) {
            for (const k2 in track[k]) {
              track[k][k2].changed = R.pathOr([], [k, k2, "changed"])(track)
              let go = false
              const intersect = R.intersection(
                track[k][k2].dep || track[k][k2].any || [],
                diff_keys || []
              )

              if (R.xNil(track[k][k2].dep)) {
                track[k][k2].changed = R.uniq(
                  R.concat(track[k][k2].changed, intersect)
                )
                go =
                  track[k][k2].changed.length !== 0 &&
                  R.compose(
                    R.isEmpty,
                    R.symmetricDifference(track[k][k2].changed)
                  )(track[k][k2].dep)
              } else if (R.xNil(track[k][k2].any)) {
                go = intersect.length !== 0
              }
              if (go) {
                track[k][k2].changed = []
                if (R.isNotNil(track[k][k2].func)) {
                  track[k][k2].func({
                    set: set,
                    to: to,
                    state$,
                    action$,
                    val: track[k][k2].args
                  })
                }
              }
            }
          }
          set(track, "track")
        }
      }
      return eq
    }),
    ignoreElements()
  )

export const init = {
  track: {},
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
