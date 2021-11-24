import { complement, isNil, when, filter } from "ramda"
const xNil = complement(isNil)
import path from "path"
import fs from "fs-extra"
import { exec } from "child_process"
import { sync as commandExists } from "command-exists"
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

const uninstallPlugin = async ({ pre }) => {
  try {
    await spawnp("bit", ["remove", pre, "-s"])
    console.log(`${pre} uninstalled!`)
  } catch (error) {
    console.error(`uninstall error: ${error}`)
    process.exit()
  }
}

const uninstallFunction = async ({ pre }) => {
  const func_path = resolve("firebase/functions")
  try {
    await spawnp("bit", ["remove", pre, "-s"], { cwd: func_path })
    console.log(`${pre} uninstalled!`)
  } catch (error) {
    console.error(`uninstall error: ${error}`)
    process.exit()
  }
}

export default async (name, namespace) => {
  const json_path = resolve("nd/.plugins.json")
  let plugins = getPlugins({ json_path })
  console.log(plugins)
  const pre = getPre(name)
  name = modName(name)
  delete plugins[pre]
  const components_path = resolve(`nd/${pre}`)
  const package_path = resolve("package.json")
  const js_path = resolve("nd/.nextdapp.js")
  const props_path = resolve("nd/.nextdapp-props.js")
  const json = getJSON({ pre, namespace })

  updateFuncs({ plugins, js_path })
  updateProps({ plugins, props_path })
  await uninstallFunction({ pre, namespace })
  await uninstallPlugin({ pre, namespace })
  updatePlugins({ json: plugins, json_path })
  updateApis({ plugins })
  updateFunctions({ plugins })
  process.exit()
}
