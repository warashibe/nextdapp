import { is, has, assocPath, isNil, forEach } from "ramda"
import { useRecoilCallback, atom, useRecoilState } from "recoil"
import { atoms } from "nd"

const bind_states = arr => {
  let obj = {}
  forEach(v => {
    if (!has(v)(atoms)) {
      atoms[v] = atom({
        key: v,
        default: null
      })
    }
    const hook = useRecoilState(atoms[v])
    obj[v] = { set: hook[1], get: hook[0] }
  })(arr)
  return obj
}
export default _states => {
  const binder = bind_states(_states)
  const cb = useRecoilCallback(
    ({ snapshot: { getPromise }, set }) => async ({ name, val }) => {
      name = is(Array)(name)
        ? name.length === 1
          ? name[0]
          : name.length === 0
            ? null
            : name
        : name
      if (is(Array)(name)) {
        if (!has(name[0])(atoms))
          atoms[name[0]] = atom({ key: name[0], default: {} })
        set(
          atoms[name[0]],
          assocPath(name.slice(1), val)(await getPromise(atoms[name[0]]))
        )
      } else {
        const states = isNil(name) ? val : { [name]: val }
        for (const k in states) {
          if (!has(k)(atoms)) atoms[k] = atom({ key: k, default: null })
          set(atoms[k], states[k])
        }
      }
    }
  )
  const set = (val, name) => cb({ val, name })
  return { binder, set }
}
