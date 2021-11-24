import {
  pluck,
  o,
  concat,
  complement,
  isNil,
  mergeLeft,
  when,
  filter
} from "ramda"
const xNil = complement(isNil)
import path from "path"
import fs from "fs-extra"
import { spawn } from "child_process"
import {
  getPre,
  getJSON,
  resolve,
  spawnp,
  getPlugins,
  updatePlugins,
  updateFuncs,
  updateProps,
  modName,
  updateApis,
  updateFunctions
} from "./util"

const makePlugins = () => {
  const dirs = o(pluck("name"), filter(v => v.isDirectory()))(
    fs.readdirSync(resolve("nd/"), { withFileTypes: true })
  )
  let plugins = {}
  for (let v of dirs) {
    const nextdapp_json = resolve(`nd/${v}/nextdapp.json`)
    if (fs.existsSync(nextdapp_json)) {
      plugins[v] = JSON.parse(fs.readFileSync(nextdapp_json, "utf8"))
    }
  }
  return plugins
}
export default async () => {
  const json_path = resolve("nd/.plugins.json")
  let plugins = getPlugins({ json_path })
  console.log(plugins)
  plugins = makePlugins()
  const package_path = resolve("package.json")
  const js_path = resolve("nd/.nextdapp.js")
  const props_path = resolve("nd/.nextdapp-props.js")
  updateFuncs({ plugins, js_path })
  updateProps({ plugins, props_path })
  updatePlugins({ json: plugins, json_path })
  updateApis({ plugins })
  updateFunctions({ plugins })

  process.exit()
}
