import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import R from "ramdam"
import { withRouter } from "next/router"

export default (actions = {}) => (Component, states = [], dispatches = []) => {
  actions.epic$ = obj => async dispatch => {
    obj.dispatch = dispatch
    return await dispatch(obj)
  }
  const mapStateToProps = R.isNilOrEmpty(states)
    ? null
    : state => R.pickAll(states)(state)

  const mapDispatchToProps = R.isNilOrEmpty(dispatches)
    ? null
    : dispatch =>
        R.reduce(
          (acc, v) => {
            acc[v] = bindActionCreators(
              R.isNil(actions[v])
                ? (obj = {}, extra = {}) => {
                    return actions.epic$({
                      type: `${v}` + "$",
                      val: obj,
                      extra: extra
                    })
                  }
                : actions[v],
              dispatch
            )
            return acc
          },
          {},
          dispatches
        )
  return withRouter(connect(mapStateToProps, mapDispatchToProps)(Component))
}
