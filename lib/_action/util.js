import R from "ramdam"
import { ofType } from "redux-observable"
import conf from "../../src/conf"
let storage, firebase, fsdb, firestore, FieldValue

export const fb = () => {
  if (R.isNil(fsdb)) {
    ;({
      storage,
      firebase,
      fsdb,
      firestore,
      FieldValue
    } = new (require("../firestore-short").fb)(conf))
  }
  return { firestore, storage, firebase, fsdb, FieldValue }
}

export const setter = (val, extra) => async dp => {
  if (typeof extra === "string") {
    extra = R.of(extra)
  }
  dp({ type: "setter", val: { field: extra, val: val } })
}
