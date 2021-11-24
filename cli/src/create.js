import path from "path"
import fs from "fs-extra"
import { sync as commandExists } from "command-exists"
import { spawnp } from "./util"
import generateKeys from "./generateKeys"
export default async dist => {
  const target_path = path.resolve(dist)
  if (fs.existsSync(target_path)) {
    console.error("Error: directory exists.")
    process.exit()
  } else if (!commandExists("git")) {
    console.error("Error: git is not installed.")
    process.exit()
  } else {
    const app_path = "https://github.com/warashibe/next-dapp-bare.git"
    const code = await spawnp("git", [
      "clone",
      "--depth=1",
      app_path,
      target_path
    ])
    if (code !== 0) {
      console.error(`clone error`)
      process.exit()
    }
    fs.copySync(`${target_path}/nd/conf.sample.js`, `${target_path}/nd/conf.js`)
    console.log(
      `Success: A next-dapp project has been created at ${target_path}.`
    )
    generateKeys(dist, true)
    process.exit()
  }
}
