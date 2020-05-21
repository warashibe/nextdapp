import { binder } from "nd-core"
import { connect } from "react-redux"
import { withRouter } from "next/router"
export default binder((states, funcs, Component) => {
  return withRouter(
    connect(
      states,
      funcs
    )(Component)
  )
})
