module.exports = {
  id: "your-theme",
  html: {
    title: "Next Dapp | The Bridge between Web 2.0 and 3.0",
    description:
      "Next Dapp is a web framework to progressively connect web 2.0 with 3.0.",
    image: "https://next-dapp.warashibe.market/static/cover.png",
    "theme-color": "#03414D"
  },
  firebase: {
    name: "project-name",
    id: "project-id",
    key: "projectKey",
    sender: "sender-digits",
    region: "us-central1"
  },
  web3: {
    network: "3",
    infura: "https://ropsten.infura.io/v3/xxxxx"
  },
  alis: {
    client_id: "123456789",
    client_secret: "xxxxx",
    redirect_uri: "https://localhost:3000/examples/login"
  },
  steem: {
    redirect_uri: "https://localhost:3000/examples/login",
    app: "next-dapp"
  },
  uport: {
    name_field: "氏名又は名称",
    id_field: "交付番号",
    appName: "暗号資産古物商協会",
    did: "did:ethr:0x62507aa089182659ff595266e3c1de2975a51780",
    privateKey: "xxxxx",
    rpcUrl: "https://mainnet.infura.io/v3/xxxxx",
    verified: "古物商許可証テストネット"
  }
}
