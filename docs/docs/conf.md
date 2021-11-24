---
id: conf
title: conf
sidebar_label: conf
---

Just like `global`, configurations defined in `/nd/conf.js` will be passed internally. See how they are passed everywhere in the example above. You can use `/nd/conf.local.js` or any file you like to define a different set of the configurations for local development as shown below. When deploying the production app, just don't include `/nd/conf.local.js`.

```javascript
import { mergeAll } from "ramda"
let local = {}

try {
  local = require("nd/conf.local") // overwrite with local configurations
} catch (e) {}

const prod = {
  id: "next-dapp",
  html: {
    title: "Next Dapp | The Bridge between Web 2.0 and 3.0",
    description:
      "Next Dapp is a web framework to progressively connect web 2.0 with 3.0.",
    image: "https://picsum.photos/1000/500",
    "theme-color": "#03414D"
  }
}
module.exports = mergeAll([prod, local])
```

