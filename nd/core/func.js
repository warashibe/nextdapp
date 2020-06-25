import { map, prop, is } from "ramda"
import setter from "./setter"
import { conf, global } from "nd"
export default (arr = [], fn) => () => {
  if (is(Function)(arr)) {
    fn = arr
    arr = fn.props || []
  } else if (is(Array)(arr)) {
    if (is(Function)(arr[1])) {
      fn = arr[1]
      arr = arr[0] || fn.props || []
    } else {
      arr = arr || fn.props || []
    }
  }
  const { binder, set } = setter(arr)
  const values = map(prop("get"))(binder)
  return _val =>
    fn({
      global,
      conf: conf,
      val: _val || {},
      set,
      props: values,
      state$: { values: values }
    })
}
