import { Box, Flex, Text, Image, Button } from "rebass"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import bind from "nd/bind"
import { isFirebase } from "nd-firebase"
import conf from "nd/conf"
import { useEffect } from "react"
import R from "ramdam"
import Nav from "nd/nav/Nav"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import { socials } from "../../lib/const"
const socials_map = R.indexBy(R.prop("key"))(socials)
import Login from "nd/account/Login"
import UPort from "nd/account/UPort"
import { SMENU } from "../../lib/const"
import Footer from "../../components/Footer"

export default bind(
  props => {
    useEffect(() => {
      isFirebase(conf).then(async () => {
        props.tracker({
          global: true,
          tracks: {}
        })
        props.changeUser$account()
        props.hookWeb3$web3()
        props.check_alis$account({ router: props.router })
      })
    }, [])
    const profile = R.isNil(props.user$account) ? null : (
      <Flex p={3} fontColor="#222">
        <Box width="100px">
          <Image src={`${props.user$account.image}`} width={1} />
        </Box>
        <Box flex={1} px={2}>
          <Box mx={2}>
            <Flex my={2} fontWeight="bold" alignItems="center">
              {props.user$account.name}
              {R.hasPath(["user$account", "links", "uport"])(props) ? (
                <Image ml={2} src={`/static/images/uport.png`} height="25px" />
              ) : null}
            </Flex>
            <Box lineHeight="120%" fontSize="14px">
              {props.user$account.description}
            </Box>
            <Box mt={2}>
              {R.compose(
                R.filter(R.xNil),
                R.values,
                R.mapObjIndexed(
                  (v, k) =>
                    R.includes(k)([
                      "google",
                      "facebook",
                      "authereum",
                      "metamask",
                      "uport"
                    ]) ? null : (
                      <Box
                        m={1}
                        as="a"
                        href={
                          R.xNil(socials_map[k].url)
                            ? socials_map[k].url(v)
                            : null
                        }
                        target="_blank"
                      >
                        <Image
                          sx={{ ...btn }}
                          src={`/static/images/${k}.png`}
                          height="20px"
                        />
                      </Box>
                    )
                )
              )(props.user$account.links || {})}
            </Box>
          </Box>
          <Flex width={1} mt={2}>
            <Box p={2} width={0.5}>
              <Box
                textAlign="center"
                p={2}
                sx={{ ...btn, borderRadius: "3px" }}
                width={1}
                onClick={props.logout$account}
                bg="orange"
                color="white"
              >
                Logout
              </Box>
            </Box>
            <Box p={2} width={0.5}>
              <Box
                textAlign="center"
                p={2}
                width={1}
                sx={{ ...btn, borderRadius: "3px" }}
                onClick={() => {
                  if (confirm("Are you sure?")) {
                    props.deleteAccount$account({
                      user: props.user$account
                    })
                  }
                }}
                bg="tomato"
                color="white"
              >
                Delete
              </Box>
            </Box>
          </Flex>
        </Box>
      </Flex>
    )
    const uport_qr = R.xNil(props.uport$account) ? <UPort /> : null
    const logins = R.isNil(props.user$account) ? (
      <Login />
    ) : (
      <Flex textAlign="center">
        <Box p={3} width={1}>
          <Flex width={1} flexWrap="wrap">
            {R.compose(
              R.filter(R.xNil),
              R.map(
                v =>
                  R.includes(v)(["authereum", "metamask"]) ? null : (
                    <Flex
                      width={[1 / 2, null, 1 / 3, 1 / 2, 1 / 3]}
                      color="white"
                      p={2}
                      alignItems="center"
                    >
                      <Box
                        onClick={() =>
                          props.unlinkAccount$account({
                            provider: v,
                            user: props.user$account
                          })
                        }
                        flex={1}
                        p={3}
                        bg={socials_map[v].bg}
                        sx={{ ...btn, borderRadius: "3px" }}
                      >
                        <Image
                          src={`/static/images/${socials_map[v].key}-white.png`}
                          height={["50px"]}
                        />
                        <Text mt={1}>
                          <Box fontSize="18px" fontWeight="bold">
                            {socials_map[v].name}
                          </Box>
                          <Box as="span" fontSize="12px">
                            Unlink
                          </Box>
                        </Text>
                      </Box>
                    </Flex>
                  )
              )
            )(R.keys(props.user$account.links))}
            {R.compose(
              R.map(v => (
                <Flex
                  width={[1 / 2, null, 1 / 3, 1 / 2, 1 / 3]}
                  color="white"
                  p={2}
                  alignItems="center"
                >
                  <Box
                    onClick={() =>
                      props.linkAccount$account({
                        provider: v,
                        user: props.user$account
                      })
                    }
                    flex={1}
                    p={3}
                    bg={socials_map[v].bg}
                    sx={{ ...btn, borderRadius: "3px", opacity: 0.5 }}
                  >
                    <Image
                      src={`/static/images/${socials_map[v].key}-white.png`}
                      height={["50px"]}
                    />
                    <Text mt={1}>
                      <Box fontSize="18px" fontWeight="bold">
                        {socials_map[v].name}
                      </Box>
                      <Box as="span" fontSize="12px">
                        Link
                      </Box>
                    </Text>
                  </Box>
                </Flex>
              )),
              R.filter(
                R.complement(R.includes)(R.__, ["authereum", "metamask"])
              ),
              R.difference(R.__, R.keys(props.user$account.links))
            )(R.pluck("key")(socials))}
          </Flex>
        </Box>
      </Flex>
    )
    const processing =
      !props.user_init$account || props.processing$util ? (
        <Flex
          bg="black"
          sx={{
            zIndex: 100,
            top: 0,
            left: 0,
            position: "absolute",
            opacity: 0.5
          }}
          width="100%"
          height="100%"
          color="white"
          fontSize="50px"
          justifyContent="center"
          alignItems="center"
        >
          <Box>
            <Box as="i" className="fa fa-spin fa-spinner" mr={3} />
            <Box display="inline-block">PROCESSING...</Box>
          </Box>
        </Flex>
      ) : null

    const TMENU = R.isNil(props.user$account)
      ? [
          {
            index: 1,
            text: `User Management Example`,
            key: `login`,
            awesome_icon: "fas fa-user"
          }
        ]
      : [
          {
            index: 1,
            text: `Logout`,
            key: `logout`,
            awesome_icon: "fas fa-sign-out-alt",
            onClick: () => {
              props.logout$account()
            }
          }
        ]
    return (
      <Nav
        side_border_color="#008080"
        side_selected={`login`}
        outerElms={["nav", "footer"]}
        side_width={225}
        side_text_color="#03414D"
        size="sx"
        SMENU={SMENU}
        TMENU={TMENU}
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
        <Flex flexDirection="column">
          <Flex
            flexWrap="wrap"
            sx={{ position: "relative", minHeight: props.innerHeight$nav }}
          >
            {processing}
            <Box width={[1, null, null, 1 / 2]}>{profile}</Box>
            <Box width={[1, null, null, 1 / 2]}>
              {R.xNil(uport_qr) ? uport_qr : logins}
            </Box>
          </Flex>
          <Footer />
        </Flex>
      </Nav>
    )
  },
  [
    "user$account",
    "uport$account",
    "user_init$account",

    "eth_selected$web3",
    "auth_selected$web3",
    "user_addresses$web3",

    "processing$util",

    "innerHeight$nav"
  ],
  [
    "connectAuthereum$web3",
    "disconnectAuthereum$web3",
    "hookWeb3$web3",

    "changeUser$account",
    "login$account",
    "logout$account",
    "deleteAccount$account",
    "linkAccount$account",
    "unlinkAccount$account",
    "check_alis$account"
  ]
)
