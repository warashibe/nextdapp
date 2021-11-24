import sweet from "firestore-sweet"
import { mergeLeft, isNil, complement } from "ramda"
import { xNil } from "nd/util"
const NodeRSA = require("node-rsa")
const shortid = require("shortid")

export const getData = async (db, conf, url) => {
  const toRSAPublic = key =>
    `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
  const toRSAPrivate = key =>
    `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
  function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return "%" + c.charCodeAt(0).toString(16)
    })
  }
  const key = new NodeRSA({ b: 512 })
  const key2 = new NodeRSA(toRSAPublic(conf.rsa.public))
  const pub = key.exportKey("public")
  const text = "Hello RSA!"
  const encrypted = key2.encrypt(pub, "base64")
  const public_key = key.exportKey("public")
  const id = shortid.generate()
  const encrypted_id = key2.encrypt(id, "base64")
  db.set({ date: Date.now(), public_key: encrypted }, "crypt", id)
  const _getData = async url => {
    return await new Promise(async (res, rej) => {
      let once = false
      let to = null
      let ret = {}
      const unsubscribe = await db.on("crypt", id, async doc => {
        if (doc !== null && xNil(doc.value)) {
          once = true
          ret.data = JSON.parse(key.decrypt(doc.value, "utf8"))
          clearTimeout(to)
          await unsubscribe()
          if (xNil(ret.response)) {
            res(ret)
          }
        }
      })
      to = setTimeout(async () => {
        try {
          await unsubscribe()
          if (xNil(ret.response)) {
            res(ret)
          }
        } catch (e) {}
      }, 20000)
      ret.response = await fetch(
        `${url}&crypt_id=${encodeURIComponent(encrypted_id)}`
      ).then(response => response.json())
      console.log(ret.response)
      if (xNil(ret.data)) {
        res(ret)
      }
    })
  }
  return await _getData(url)
}

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
        apiKey: this.conf.fb.key,
        authDomain: `${this.conf.fb.id}.firebaseapp.com`,
        databaseURL: `https://${this.conf.fb.id}.firebaseio.com`,
        projectId: this.conf.fb.id,
        storageBucket: `${this.conf.fb.id}.appspot.com`,
        messagingSenderId: this.conf.fb.sender,
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
