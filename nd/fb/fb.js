import sweet from "firestore-sweet"
import { mergeLeft, isNil, complement } from "ramda"
import { xNil } from "nd/util"
class FB {
  constructor(conf = {}) {
    this.conf = conf
    this.firebase = null
    this.storage = null
    this.firestore = null
    this.db = null
    this.init()
  }

  init() {
    try {
      this.firebase = window.firebase
    } catch (e) {}
    try {
      const config = {
        apiKey: this.conf.firebase.key,
        authDomain: `${this.conf.firebase.id}.firebaseapp.com`,
        databaseURL: `https://${this.conf.firebase.id}.firebaseio.com`,
        projectId: this.conf.firebase.id,
        storageBucket: `${this.conf.firebase.id}.appspot.com`,
        messagingSenderId: this.conf.firebase.sender,
        timestampsInSnapshots: true
      }
      require("firebase/firestore")
      try {
        this.firebase.initializeApp(config)
        this.firebase.auth().useDeviceLanguage()
      } catch (e) {}
      try {
        this.storage = this.firebase.storage()
      } catch (e) {}
      try {
        const sweetened = sweet(this.firebase.firestore)
        this.firestore = sweetened.firestore
        this.FieldValue = this.firebase.firestore.FieldValue
        this.db = sweetened
      } catch (e) {
        console.log(e)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export const fb = () => window._fb

export const db = () => window._fb.db

export const initFB = ({ set, conf, global }) =>
  new Promise(async res => {
    if (isNil(window)) {
      res({ err: true, message: "no window", code: 1 })
    } else {
      let isFB = null
      do {
        isFB = await new Promise(res => {
          setTimeout(() => {
            if (isNil(window.firebase)) {
              res({ err: true, message: "no firebase", code: 2 })
            } else {
              window._fb = new FB(conf)
              if (xNil(global)) {
                global.fb = window._fb
                global.db = window._fb.db
              }
              if (xNil(set)) set(true, "isFB")
              res(mergeLeft({ err: false, message: null, code: 0 }, window._fb))
            }
          }, 100)
        })
      } while (isNil(isFB))
      res(isFB)
    }
  })
