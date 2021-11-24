import path from "path"
import fs from "fs-extra"

export default () => {
  const json_path = path.resolve(process.cwd(), "nd/.plugins.json")
  if (!fs.existsSync(json_path)) {
    console.error(`Error: ${json_path} not found.`)
    process.exit()
  } else {
    const plugins = JSON.parse(fs.readFileSync(json_path, "utf-8"))
    for (let k in plugins) {
      console.log(`@nextdapp/${k}`)
    }
  }
}
