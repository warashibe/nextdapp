const { R, fs, exists, args, logit, resolve } = require("./dev")
const theme = args[0]
const beautify = require("json-beautify")
console.log()
R.isNil(theme) ? logit("No theme specified") : console.log(`new: ${theme}`)
let current_theme, backup_theme
try {
  current_theme = require("../src/conf")
} catch (e) {
  logit("current theme doesn't exist")
}
R.has("id", current_theme)
  ? console.log(`current: ${current_theme.id}`)
  : logit("current theme id not specified")

try {
  backup_theme = require("../.themes/.backup/src/conf")
  R.has("id", backup_theme)
    ? console.log(`backup: ${backup_theme.id}`)
    : console.log("backup: no id")
} catch (e) {
  console.log("backup: none")
}
const dirs = ["src", "firebase", "static"]
const pth = {
  temp: resolve("../.themes/.temp"),
  temp_package_json: resolve("../.themes/.temp/package.json"),

  default_package_json: resolve("../.themes/default/package.json"),

  package_json: resolve("../package.json"),

  theme: resolve(`../.themes/${theme}`),
  theme_package_json: resolve(`../.themes/${theme}/package.json`),

  theme_current: resolve(`../.themes/${current_theme.id}`),
  backup: resolve(`../.themes/.backup`)
}

for (let v of dirs) {
  pth[`temp_${v}`] = resolve(`../.themes/.temp/${v}`)
  pth[v] = resolve(`../${v}`)
  pth[`theme_${v}`] = resolve(`../.themes/${theme}/${v}`)
}
console.log()
if (R.equals(theme, current_theme.id)) logit("same theme abort")

const existsDirs = async () => {
  for (let v of R.concat(dirs, ["package.json"])) {
    if (!(await exists("../.themes/", theme, v))) return false
  }
  return true
}

const checkSettings = async () => {
  if (!(await existsDirs())) logit("theme dir doesn't exist")
}

const removeTemp = async () => {
  try {
    await fs.remove(pth.temp)
  } catch (e) {
    console.log(e)
  }
  console.log(`temp dir removed...${pth.temp}`)
}

const moveCurrentToTemp = async () => {
  await fs.mkdir(pth.temp)
  for (let v of dirs) {
    try {
      await fs.move(pth[v], pth[`temp_${v}`])
    } catch (e) {
      console.log(e)
    }
  }
  try {
    await fs.move(pth.package_json, pth.temp_package_json)
  } catch (e) {
    console.log(e)
  }
  console.log(`moved current theme to temp...${pth.temp}`)
}

const copyNewToRoot = async () => {
  for (let v of dirs) {
    await fs.copy(pth[`theme_${v}`], pth[v])
  }
  const pkg = await mergePkg()
  await fs.writeFile(pth.package_json, beautify(pkg, null, 2))
  console.log(`moved new theme to root...`)
}

const removeBackup = async () => {
  try {
    await fs.remove(pth.backup)
  } catch (e) {}
  console.log(`remove backup...${pth.backup}`)
}

const moveOldToBackup = async () => {
  await fs.move(pth.theme_current, pth.backup)
  console.log(`backup old theme from...${pth.theme_current} to...${pth.backup}`)
}

const moveTempToTheme = async () => {
  await fs.move(pth.temp, pth.theme_current)
  console.log(`moved current theme to reflext changes...${pth.theme_current}`)
}

const mergePkg = async () => {
  const default_pkg = JSON.parse(
    await fs.readFile(pth.default_package_json, "utf8")
  )
  const theme_pkg = JSON.parse(
    await fs.readFile(pth.theme_package_json, "utf8")
  )
  const dep = R.mergeLeft(theme_pkg.dependencies, default_pkg.dependencies)
  const dep_dev = R.mergeLeft(
    theme_pkg.devDependencies || {},
    default_pkg.devDependencies || {}
  )
  const scripts = R.mergeLeft(
    theme_pkg.scripts || {},
    default_pkg.scripts || {}
  )

  return R.mergeAll([
    theme_pkg,
    { dependencies: dep },
    { devDependencies: dep_dev },
    { scripts: scripts }
  ])
}

const main = async () => {
  await checkSettings()
  await removeTemp()
  await moveCurrentToTemp()
  await copyNewToRoot()
  await removeBackup()
  await moveOldToBackup()
  await moveTempToTheme()
  logit(`\ndone: theme switched to ${theme}`)
}

main()
