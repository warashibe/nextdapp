import R from "ramdam"

module.exports = async () => {
  if (R.isNil(window)) {
    return false
  } else {
    let fb = null
    do {
      fb = await new Promise(res => {
        setTimeout(() => {
          if (R.isNil(window.firebase)) {
            res(null)
          } else {
            res(true)
          }
        }, 100)
      })
    } while (R.isNil(fb))
    return true
  }
}
