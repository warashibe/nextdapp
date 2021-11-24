import { useEffect, Fragment } from "react"
import Conf from "nd/core/Conf"
import { bind, Tracker } from "nd"

const Count = bind(
  props => {
    const fn = props.init()
    const btn = {
      display: "inline-block",
      margin: "20px 10px",
      cursor: "pointer",
      backgroundColor: "#222",
      color: "white",
      padding: "10px",
      borderRadius: "3px"
    }
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={btn}
          onClick={() => {
            props.set((props.count || 0) + 1, "count")
          }}
        >
          count: {props.count || 0}
        </div>
        <div
          style={btn}
          onClick={() => {
            props.set((props.count2 || 0) + 1, "count2")
          }}
        >
          count2: {props.count2 || 0}
        </div>
        <div
          style={btn}
          onClick={() => {
            props.set((props.count3 || 0) + 1, "count3")
          }}
        >
          count3: {props.count3 || 0}
        </div>
        <div>SUM [ count + count2 + count3 = {props.sum} ]</div>
        <div>PRODUCT [ count * count2 * count3 = {props.product || 0} ]</div>
        <div>
          {" "}
          <div
            style={btn}
            onClick={() => {
              fn.getSquare()
            }}
          >
            square: {props.square || 0}
          </div>
        </div>
      </div>
    )
  },
  [
    "count",
    "sum",
    "logConf",
    "add",
    "product",
    "count2",
    "count3",
    "square",
    "getSquare"
  ]
)

export default bind(
  ({ set, init, router }) => {
    const fn = init()
    useEffect(() => {
      set({ count: 100 })
      fn.logConf()
    }, [])
    return (
      <Fragment>
        <Count />
        <Conf />
        <Tracker
          name="count_tracker"
          type="any"
          watch={["count", "count2", "count3"]}
          props={["count", "count2", "count3"]}
          func={({ set, props: { count, count2, count3 } }) => {
            set(count * count2 * count3, "product")
          }}
        />
      </Fragment>
    )
  },
  [
    "count",
    "count2",
    "count3",
    "product",
    "square",
    "logConf",
    {
      getSquare: [
        ({ global, set, props: { product } }) => {
          set(product * product, "square")
        },
        ["product"]
      ],
      sum: {
        get: atoms => ({ get }) =>
          (get(atoms.count) || 0) +
          (get(atoms.count2) || 0) +
          (get(atoms.count3) || 0)
      }
    }
  ]
)
