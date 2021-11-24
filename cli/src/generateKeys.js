const NodeRSA = require("node-rsa")
import fs from "fs-extra"
import path from "path"
import { getPlugins } from "./util"
import { isNil } from "ramda"
export const resolve = to => path.resolve(process.cwd(), to)
export default async (dist, overwrite = false) => {
  const target_path = path.resolve(dist)
  console.log(target_path)
  const key = new NodeRSA({ b: 512 })
  const pub = key.exportKey("public")
  const pri = key.exportKey("private")
  console.log()
  console.log(pub)
  const pub_compact = pub
    .split("\n")
    .slice(1, -1)
    .join("\\n")
  console.log()
  console.log(pri)
  const pri_compact = pri
    .split("\n")
    .slice(1, -1)
    .join("\\n")

  const env_path = path.resolve(target_path, ".env")
  let new_env = []
  let ex = false
  if (fs.existsSync(env_path)) {
    const lines = fs.readFileSync(env_path, `utf8`).split("\n")
    for (let v of lines || []) {
      const split = v.split("=")
      if (split[0] === "RSA_PRIVATE") {
        ex = true
        if (overwrite === false) {
          new_env.push(v)
        }
      } else {
        new_env.push(v)
      }
    }
  }
  if (ex === false || overwrite === true) {
    new_env.push(`RSA_PRIVATE=${pri_compact}`)
  }
  fs.writeFileSync(env_path, new_env.join("\n"))

  const env_json_path = path.resolve(target_path, "firebase/functions/env.json")

  const rsa = {
    public: pub_compact,
    private: pri_compact
  }

  const rsa_public = {
    public: pub_compact
  }

  let new_rsa = {}
  let err_rsa = null
  if (fs.existsSync(env_json_path)) {
    try {
      new_rsa = JSON.parse(fs.readFileSync(env_json_path, `utf8`))
    } catch (e) {
      console.log(e)
      err_rsa = true
    }
  }
  if (err_rsa === null) {
    if (isNil(new_rsa.rsa) || overwrite) {
      new_rsa.rsa = rsa
    }
    fs.writeFileSync(env_json_path, JSON.stringify(new_rsa))
  }

  const runtime_path = path.resolve(
    target_path,
    "firebase/functions/.runtimeconfig.json"
  )

  let new_run_rsa = {}
  let err_run_rsa = null
  if (fs.existsSync(runtime_path)) {
    try {
      new_run_rsa = JSON.parse(fs.readFileSync(runtime_path, `utf8`))
    } catch (e) {
      console.log(e)
      err_run_rsa = true
    }
  }
  if (err_run_rsa === null) {
    if (isNil(new_run_rsa.env)) {
      new_run_rsa.env = {}
    }
    if (isNil(new_run_rsa.env.rsa) || overwrite) {
      new_run_rsa.env.rsa = rsa
    }
    fs.writeFileSync(runtime_path, JSON.stringify(new_run_rsa))
  }

  const conf_json_path = path.resolve(target_path, "nd/conf.auto.json")

  let new_conf_rsa = {}
  let err_conf_rsa = null
  if (fs.existsSync(conf_json_path)) {
    try {
      new_conf_rsa = JSON.parse(fs.readFileSync(conf_json_path, `utf8`))
    } catch (e) {
      console.log(e)
      err_conf_rsa = true
    }
  }
  if (err_conf_rsa === null) {
    if (isNil(new_conf_rsa.rsa) || overwrite) {
      new_conf_rsa.rsa = rsa_public
    }
    fs.writeFileSync(conf_json_path, JSON.stringify(new_conf_rsa))
  }
}
