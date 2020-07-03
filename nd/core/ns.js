import plugins from "nd/.plugins"
import { hasPath } from "ramda"
export default plugin => name => {
  const suffix = hasPath([plugin, "namespace"])(plugins)
    ? `$${plugins[plugin].namespace}`
    : hasPath([plugin, "core"])(plugins) && plugins[plugin].core
    ? ""
    : `$${plugin}`
  return name + suffix
}
