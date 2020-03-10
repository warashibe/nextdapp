import R from "ramdam"
export default ({ init, assoc = {}, mod = {} }) => {
  const red = R.mapObjIndexed((v, k, obj) => {
    if (typeof v === "string") {
      return R.assoc(v)
    } else {
      return R.assocPath(v)
    }
  })(assoc)

  return (state = init, action = { type: null, val: {} }) => {
    let reds = {}
    if (!R.isNil(assoc[action.type])) {
      reds = R.mapObjIndexed(v => {
        return v(action.val)
      })(red)
    } else {
      if (action.type != undefined && action.type.match(/^@@/) != null) {
        return state
      }
      try {
        reds = R.mergeLeft(mod, {
          setter: ({ val: { field, val } }) =>
            R.assocPath(R.is(Array, field) ? field : R.of(field), val),
          set: ({ val: { field, val } }) =>
            R.assocPath(R.is(Array, field) ? field : R.of(field), val)
        })
      } catch (e) {
        console.log(e)
      }
    }
    return (R.isNotNil(reds[action.type])
      ? reds[action.type](action)
      : R.identity)(state)
  }
}
