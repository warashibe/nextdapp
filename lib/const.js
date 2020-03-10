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
