import path from "path"
import fs from "fs-extra"
import { sync as commandExists } from "command-exists"
import { spawnp } from "./util"
import generateKeys from "./generateKeys"

const msgExit = (msg, code = 0) => {
  console.error(`${code === 0 ? "Success" : "Error"}: ${msg}`)
  process.exit(code)
}

export default async dist => {
  const target_path = path.resolve(dist)
  if (fs.existsSync(target_path)) {
    msgExit("directory exists.", 1)
  } else if (!commandExists("git")) {
    msgExit("git is not installed.", 1)
  } else {
    const code = await spawnp("git", [
      "clone",
      "--depth=1",
      "https://github.com/warashibe/next-dapp-bare.git",
      target_path,
    ])
    if (code !== 0) msgExit(`clone error`)
    fs.copySync(`${target_path}/nd/conf.sample.js`, `${target_path}/nd/conf.js`)
    generateKeys(dist, true)
    msgExit(`A next-dapp project has been created at ${target_path}.`)
  }
}
