export const socials = [
  {
    key: "github",
    name: "Github",
    bg: "#24292E",
    url: v => `https://github.com/${v.username}`
  },
  {
    key: "alis",
    name: "ALIS",
    bg: "#232538",
    url: v => `https://alis.to/users/${v.username}`
  },
  { key: "uport", name: "uPort", bg: "#5952FF" },
  {
    key: "facebook",
    name: "Facebook",
    bg: "#4267B2"
  },
  { key: "google", name: "Google", bg: "#3A7CEC" },
  {
    key: "twitter",
    name: "Twitter",
    bg: "#1DA1F2",
    url: v => `https://twitter.com/${v.username}`
  },
  {
    key: "steem",
    name: "Steem",
    bg: "#07D6AA",
    url: v => `https://steemit.com/@${v.username}`
  },
  { key: "metamask", name: "MetaMask", bg: "#F6851B" },
  { key: "authereum", name: "Authereum", bg: "#FF4C2F" }
]

export const ethereum_networks = {
  "1": "mainnet",
  "3": "ropsten",
  "4": "rinkby",
  "42": "kovan"
}

export const uniswap_factory = {
  "1": "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95",
  "3": "0x9c83dCE8CA20E9aAF9D3efc003b2ea62aBC08351",
  "4": "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36",
  "42": "0xD3E51Ef092B2845f10401a0159B2B96e8B6c3D30"
}

export let SMENU = [
  {
    text: `Docs`,
    key: `docs`,
    awesome_icon: `fas fa-file`,
    border: true
  },
  {
    text: `Examples`,
    key: `top`,
    awesome_icon: `fas fa-cubes`,
    border: true
  },

  {
    text: `Login`,
    key: `login`,
    awesome_icon: `fas fa-sign-in-alt`,
    target: "_self",
    href: "/examples/login"
  },
  {
    text: `Uniswap`,
    key: `uniswap`,
    icon: `/static/images/uniswap.png`,
    target: "_self",
    href: "/examples/uniswap"
  },
  {
    text: `DEV`,
    key: `dev`,
    icon: `/static/images/dev.png`,
    target: "_self",
    href: "/examples/dev"
  },
  {
    text: `Blog`,
    key: `blog`,
    awesome_icon: `fas fa-book-open`,
    target: "_self",
    href: "/examples/blog"
  },
  {
    text: `Editor`,
    key: `editor`,
    awesome_icon: `fas fa-edit`,
    target: "_self",
    href: "/examples/editor"
  },
  {
    text: `Nav`,
    key: `nav`,
    awesome_icon: `fas fa-list`,
    target: "_self",
    href: "/examples/nav",
    border: true
  },
  {
    text: `Source`,
    key: `source`,
    awesome_icon: `fab fa-github`,
    target: "_blank",
    href: "https://github.com/warashibe/next-dapp"
  }
]
