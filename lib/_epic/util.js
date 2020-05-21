import R from "ramdam"
import conf from "../../src/conf"
let storage, firebase, fsdb, firestore, FieldValue
const _fb = require("../firestore-short").fb
export const fb = () => {
  if (R.isNil(fsdb))
    ({ storage, firebase, fsdb, firestore, FieldValue } = _fb(conf))

  return { firestore, storage, firebase, fsdb, FieldValue }
}
