import { useState, useEffect, Fragment } from "react"
import useEventListener from "@use-it/event-listener"
import { Box, Flex, Text, Image } from "rebass"
import { getElementOffset, offsetTop } from "../lib/util"
import { isFirebase } from "@nextdapp/firebase"
import conf from "nd/conf"
import R from "ramdam"
import Nav from "nd/nav/Nav"
import bind from "nd/bind"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }

export default bind(
  props => {
    useEffect(() => {
      isFirebase(conf).then(async () => {
        props.changeUser()
      })
    })
    const [scroll, setScroll] = useState("examples")
    useEventListener("scroll", () => {
      const ids = ["examples", "features", "why", "tech"]
      const ot = offsetTop()
      if (props.isTop && ot !== 0) {
        props.set(false, "isTop")
      } else if (props.isTop === false && ot === 0) {
        props.set(true, "isTop")
      }
      const offsets = R.compose(
        R.takeWhile(
          R.compose(
            R.gt(ot + 80),
            key => {
              return getElementOffset(document.getElementById(key)).top
            }
          )
        )
      )(ids)
      const now = offsets.length === 0 ? null : R.last(offsets)
      if (scroll !== now) {
        setScroll(now)
      }
    })
    const cover = (
      <Flex
        id="examples"
        color="#03414D"
        bg="#A0F6D2"
        width={1}
        flexWrap="wrap"
      >
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
            <Flex
              justifyContent={["center", null, "flex-start"]}
              mt={3}
              flexWrap="wrap"
            >
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
                m={2}
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
                m={2}
              >
                Uniswap
              </Box>
              <Box
                display="flex"
                as="a"
                href="/examples/dev"
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
                m={2}
              >
                DEV
              </Box>
              <Box
                display="flex"
                as="a"
                href="/examples/blog"
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
                m={2}
              >
                BLOG
              </Box>
              <Box
                display="flex"
                as="a"
                href="/examples/editor"
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
                m={2}
              >
                Editor
              </Box>
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
      <Flex color="#03414D" width={1} flexWrap="wrap" p={3} id="features">
        {R.map(v => (
          <Flex
            key={v.title}
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
      <Flex color="white" bg="#03414D" width={1} flexWrap="wrap" p={4} id="why">
        <Box textAlign="center" as="h1" width={1}>
          WHY?
        </Box>
        <Box p={3} lineHeight="150%">
          The emerging web 3.0 technologies are all great and exciting, but in
          many cases the UX is not so pleasant. It is ideal and good philosophy
          to go all the way with the web 3.0 tech but in reality there is a huge
          gap between practical use cases and decentralized fantasyies. Next
          Dapp will fill the gap and bring web 3.0 down to the ground where you
          can quickly build next-gen dapps with great UX utilizing the proven
          technology around web 2.0. You will save tens of thousaunds of dollars
          when developing the next killer dapp for your project / startup.
        </Box>
      </Flex>
    )
    const footer = (
      <Flex
        id="footer"
        bg="#03414D"
        color="#72DFD0"
        width={1}
        flexWrap="wrap"
        p={3}
      >
        <Box textAlign="center" width={1}>
          <Box
            color="#72DFD0"
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
      <Flex color="#03414D" width={1} flexWrap="wrap" p={4} id="tech">
        <Box textAlign="center" as="h1" width={1} mb={3}>
          Technology Stack
        </Box>
        <Flex flexWrap="wrap" justifyContent="center" width={1}>
          {R.map(v => {
            return (
              <Box
                key={v.key}
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
            { key: "now", name: "Vercel Now", url: "https://vercel.com/" },
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
            },
            {
              key: "uniswap",
              name: "Uniswap",
              url: "https://uniswap.io/"
            },
            {
              key: "dev",
              name: "Dev Protocol",
              url: "https://devprtcl.com/"
            }
          ])}
        </Flex>
      </Flex>
    )
    const scrollTo = (id, top = 60) => {
      const x = getElementOffset(document.getElementById(id))
      window.scrollTo({ top: x.top - top, behavior: "smooth" })
    }
    const TMENU = [
      {
        index: 1,
        text: `Examples`,
        key: `examples`,
        awesome_icon: `fas fa-list`,
        onClick: () => {
          scrollTo("examples")
        }
      },
      {
        index: 2,
        text: `Features`,
        key: `features`,
        awesome_icon: `fas fa-fire`,
        onClick: () => {
          scrollTo("features", 40)
        }
      },
      {
        index: 3,
        text: `Why`,
        key: `why`,
        awesome_icon: `fas fa-question`,
        onClick: () => {
          scrollTo("why", 40)
        }
      },
      {
        index: 4,
        text: `Tech`,
        key: `tech`,
        awesome_icon: `fas fa-code`,
        onClick: () => {
          scrollTo("tech", 40)
        }
      }
    ]
    const SMENU = [
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
        href: "/examples/editor",
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
    return (
      <Nav
        chosen={scroll}
        side_border_color="#008080"
        side_selected={`top`}
        outerElms={["nav", "footer"]}
        side_width={225}
        side_text_color="#03414D"
        size="sx"
        TMENU={TMENU}
        SMENU={SMENU}
        side_selected_color="#008080"
        pre_title="Next"
        pre_title_color="rgb(240, 236, 212)"
        post_title="Dapp"
        fontSize="18px"
        bg_side="#72DFD0"
        regular_border="#008080"
        selected_border="#3A7CEC"
        bg_top="#03414D"
        title_logo="/static/images/icon-128x128.png"
      >
        {cover}
        {features}
        {why}
        {tech}
        {footer}
      </Nav>
    )
  },
  [],
  ["set", "changeUser"]
)
