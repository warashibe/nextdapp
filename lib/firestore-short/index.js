import sweet from "firestore-sweet"
import R from "ramdam"

class FB {
  constructor(conf = {}) {
    this.conf = conf
    this.firebase = null
    this.storage = null
    this.firestore = null
    this.fsdb = null
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
        this.fsdb = sweetened
      } catch (e) {
        console.log(e)
      }
    } catch (e) {
      console.log(e)
    }
  }
}
let _fb = null
const fb = conf => {
  if (R.isNil(_fb)) _fb = new FB(conf)
  return _fb
}
export { fb }
