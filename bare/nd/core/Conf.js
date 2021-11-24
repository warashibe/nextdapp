import React, { Fragment } from "react"
import {
  type,
  allPass,
  o,
  either,
  equals,
  isNil,
  complement,
  keys,
  map
} from "ramda"
import { bind } from "nd"
const isPlainObject = allPass([
  o(equals("Object"), type),
  complement(isNil),
  either(
    o(equals(Object.prototype), Object.getPrototypeOf),
    o(isNil, Object.getPrototypeOf)
  )
])

export default bind(props => {
  const td = { padding: "10px", backgroundColor: "#eee" }
  const td2 = {
    padding: "10px",
    backgroundColor: "#ddd",
    textAlign: "center"
  }
  const th = {
    padding: "10px",
    backgroundColor: "#ccc",
    textAlign: "center"
  }
  const th2 = {
    padding: "10px",
    backgroundColor: "#222",
    color: "white",
    textAlign: "center"
  }

  let conf = []
  for (let k in props.conf || {}) {
    const v = props.conf[k]
    const isObj = isPlainObject(v)
    const rowSpan = isObj ? keys(v).length : 1
    const first = keys(v)[0]
    conf.push(
      <tr key={first}>
        <th style={th} rowSpan={rowSpan}>
          {k}
        </th>
        {isObj ? (
          <Fragment>
            <td style={td2}>{first}</td>
            <td style={td}>{JSON.stringify(v[first])}</td>
          </Fragment>
        ) : (
          <td colSpan={2} style={td}>
            {JSON.stringify(v)}
          </td>
        )}
      </tr>
    )
    if (isObj)
      conf = conf.concat(
        map(v2 => (
          <tr key={v2}>
            <td style={td2}>{v2}</td>
            <td style={td}>{JSON.stringify(v[v2])}</td>
          </tr>
        ))(keys(v).slice(1))
      )
  }
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "inline-block" }}>
        <table>
          <thead>
            <tr key="nd/conf">
              <th colSpan={3} style={th2}>
                nd/conf
              </th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "left" }}>{conf}</tbody>
        </table>
      </div>
    </div>
  )
})
