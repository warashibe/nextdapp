import { Box, Flex, Text, Image } from "rebass"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
export default () => {
  const cover = (
    <Flex color="#03414D" bg="#A0F6D2" width={1} flexWrap="wrap">
      <Flex
        pl={4}
        pr={[4, null, 0]}
        pb={[5, null, 0]}
        order={[2, null, 1]}
        width={[1, null, 2 / 3]}
        justifyContent="center"
        alignItems="center"
      >
        <Box textAlign={["center", null, "left"]}>
          <Box mb={2} as="h1">
            The Bridge between Web 2.0 and 3.0
          </Box>
          <Box lineHeight="150%" fontSize="16px">
            Next Dapp is a web framework to progressively connect web 2.0 with
            3.0.
            <br />
            It makes best use of all the good tech about 2.0 with the bleeding
            edge tech around 3.0 and beyond.
          </Box>
          <Flex justifyContent={["center", null, "flex-start"]} mt={3}>
            <Box
              display="flex"
              as="a"
              href="/examples/login"
              justifyContent="center"
              alignItems="center"
              py={2}
              px={4}
              sx={{
                textDecoration: "none",
                cursor: "pointer",
                ":hover": { opacity: 0.75 }
              }}
              color="white"
              bg="#03414D"
              mx={2}
            >
              Login
            </Box>
            <Box
              display="flex"
              as="a"
              href="/examples/uniswap"
              justifyContent="center"
              alignItems="center"
              py={2}
              px={4}
              sx={{
                textDecoration: "none",
                cursor: "pointer",
                ":hover": { opacity: 0.75 }
              }}
              color="white"
              bg="#03414D"
              mx={2}
            >
              Uniswap
            </Box>

            <Box
              display="flex"
              as="a"
              href="https://github.com/warashibe/next-dapp"
              justifyContent="center"
              alignItems="center"
              py={2}
              px={4}
              target="_blank"
              sx={{
                textDecoration: "none",
                cursor: "pointer",
                ":hover": { opacity: 0.75 }
              }}
              color="white"
              bg="#03414D"
              mx={2}
            >
              Source
            </Box>
            <Flex
              justifyContent="center"
              alignItems="center"
              py={2}
              px={4}
              sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
              color="white"
              bg="#03414D"
              mx={2}
              onClick={() => alert("Comint Soon!")}
            >
              Docs
            </Flex>
          </Flex>
        </Box>
      </Flex>
      <Flex
        width={[1, null, 1 / 3]}
        alignItems="center"
        order={[1, null, 2]}
        justifyContent={["center", null, "flex-start"]}
      >
        <Image src={`/static/images/icon-512x512.png`} />
      </Flex>
    </Flex>
  )
  const features = (
    <Flex color="#03414D" width={1} flexWrap="wrap" p={3}>
      {R.map(v => (
        <Flex
          justifyContent="center"
          width={[1, null, 1 / 3]}
          p={3}
          flexWrap="wrap"
        >
          <Box width={1} as="h2" textAlign="center">
            {v.title}
          </Box>
          <Image src={`/static/images/${v.img}.png`} height="200px" my={2} />
          <Box width={1} textAlign="center" lineHeight="150%">
            {v.desc}
          </Box>
        </Flex>
      ))([
        {
          img: "logins",
          desc:
            "Both 2.0 Social Accounts and 3.0 Decentralized Accounts are built-in with Firebase Authentication.",
          title: "User Management"
        },
        {
          img: "transfer",
          desc:
            "Built-in Authereum smart contract wallets remove insecure private key handling from cryptocurrency management.",
          title: "Money Transfer"
        },
        {
          img: "content",
          desc:
            "Next Dapp connects web 2.0 social contents with decentralized file system based on IPFS.",
          title: "Content Management"
        }
      ])}
    </Flex>
  )
  const why = (
    <Flex color="white" bg="#03414D" width={1} flexWrap="wrap" p={4}>
      <Box textAlign="center" as="h1" width={1}>
        WHY?
      </Box>
      <Box p={3} lineHeight="150%">
        The emerging web 3.0 technologies are all great and exciting, but in
        many cases the UX is not so pleasant. It is ideal and good philosophy to
        go all the way with the web 3.0 tech but in reality there is a huge gap
        between practical use cases and decentralized fantasyies. Next Dapp will
        fill the gap and bring web 3.0 down to the ground where you can quickly
        build next-gen dapps with great UX utilizing the proven technology
        around web 2.0. You will save tens of thousaunds of dollars when
        developing the next killer dapp for your project / startup.
      </Box>
    </Flex>
  )
  const footer = (
    <Flex color="#03414D" bg="#72DFD0" width={1} flexWrap="wrap" p={3}>
      <Box textAlign="center" width={1}>
        <Box
          color="#03414D"
          sx={{ textDecoration: "none" }}
          as="a"
          href="https://warashibe.market/"
          target="_blank"
        >
          © 2020 WARASHIBE
        </Box>
      </Box>
    </Flex>
  )
  const tech = (
    <Flex color="#03414D" width={1} flexWrap="wrap" p={4}>
      <Box textAlign="center" as="h1" width={1} mb={3}>
        Technology Stack
      </Box>
      <Flex flexWrap="wrap" justifyContent="center" width={1}>
        {R.map(v => {
          return (
            <Box
              width="100px"
              as="a"
              href={v.url}
              target="_blank"
              display="block"
              color="#03414D"
              m={3}
              sx={{ textDecoration: "none", ...btn }}
            >
              <Image
                src={`/static/images/${v.key}.png`}
                height="100px"
                mb={2}
              />
              <Box textAlign="center">{v.name}</Box>
            </Box>
          )
        })([
          { key: "react", name: "React", url: "https://reactjs.org/" },
          { key: "redux", name: "Redux", url: "https://redux.js.org/" },
          { key: "nextjs", name: "Next.js", url: "https://nextjs.org/" },
          { key: "rxjs", name: "RxJS", url: "https://rxjs.dev/" },
          { key: "now", name: "ZEIT Now", url: "https://zeit.co/" },
          { key: "ramdajs", name: "Ramda.js", url: "https://ramdajs.com/" },
          { key: "rebass", name: "Rebass", url: "https://rebassjs.org/" },
          {
            key: "firebase",
            name: "Firebase",
            url: "https://firebase.google.com/"
          },
          {
            key: "authereum",
            name: "Authereum",
            url: "https://authereum.com/"
          },
          {
            key: "metamask",
            name: "MetaMask",
            url: "https://metamask.io/"
          },
          {
            key: "uport",
            name: "uPort",
            url: "https://www.uport.me/"
          },
          {
            key: "alis",
            name: "ALIS",
            url: "https://alis.to/"
          },
          {
            key: "steemit",
            name: "STEEM",
            url: "https://steem.com/"
          },
          {
            key: "ethereum",
            name: "Ethereum",
            url: "https://ethereum.org/"
          },
          {
            key: "ipfs",
            name: "IPFS",
            url: "https://ipfs.io/"
          },
          {
            key: "3box",
            name: "3Box",
            url: "https://3box.io/"
          },
          {
            key: "swarm",
            name: "Swarm",
            url: "https://swarm.ethereum.org/"
          },
          {
            key: "orbitdb",
            name: "OrbitDB",
            url: "https://orbitdb.org/"
          }
        ])}
      </Flex>
    </Flex>
  )
  return (
    <Box>
      {cover}
      {features}
      {why}
      {tech}
      {footer}
    </Box>
  )
}
