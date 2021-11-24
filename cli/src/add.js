import { concat, complement, isNil, mergeLeft, when, filter } from "ramda"
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
  updateFunctions,
  modName,
  modFuncName,
  updateApis
} from "./util"

const installPlugin = async ({ name, namespace }) => {
  try {
    let param = ["import", name, "--override"]
    if (xNil(namespace)) {
      param = concat(param, ["-p", `nd/${namespace}`])
    }
    await spawnp("bit", param)
    console.log(`${name} installed!`)
  } catch (error) {
    console.error(`install error: ${error}`)
    process.exit()
  }
}

const installFunction = async ({ func_name, namespace }) => {
  console.log("installing functions..." + func_name)
  const func_path = resolve("firebase/functions")
  try {
    let param = ["import", func_name, "--override"]
    if (xNil(namespace)) {
      param = concat(param, ["-p", `nd/${namespace}`])
    }
    await spawnp("bit", param, { cwd: func_path })
    console.log(`${func_name} installed!`)
  } catch (error) {
    console.error(`install error: ${error}`)
    process.exit()
  }
}

export default async (_name, namespace = null) => {
  const json_path = resolve("nd/.plugins.json")
  let plugins = getPlugins({ json_path })
  console.log(plugins)
  const pre = getPre(_name)
  const name = modName(_name)
  const func_name = modFuncName(_name)
  const components_path = resolve(`nd/${pre}`)
  const package_path = resolve("package.json")
  const js_path = resolve("nd/.nextdapp.js")
  const props_path = resolve("nd/.nextdapp-props.js")
  await installPlugin({ name, namespace })
  const json = getJSON({ pre, namespace })
  if (xNil(json.functions)) {
    await installFunction({ func_name, namespace })
  }
  const core = json.core || false

  plugins[pre] = mergeLeft(
    { name: name, key: pre, core: core, namespace: namespace },
    json
  )

  updateFuncs({ plugins, js_path })
  updateProps({ plugins, props_path })
  updatePlugins({ json: plugins, json_path })
  updateApis({ plugins })
  updateFunctions({ plugins })
  process.exit()
}
