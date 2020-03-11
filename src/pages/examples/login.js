import { Box, Flex, Text, Image, Button } from "rebass"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Wallet from "../../../components/Wallet"
import { checkBalance, checkWallet } from "../../../lib/_epic/web3"
import { socials } from "../../../lib/const"
const socials_map = R.indexBy(R.prop("key"))(socials)
export default binder(
  props => {
    useEffect(() => {
      isFirebase().then(async () => {
        props.tracker({
          global: true,
          tracks: {
            wallet: {
              dep: ["user"],
              func: checkWallet
            }
          }
        })
        props.changeUser()
        props.hookWeb3()
        props.check_alis({ router: props.router })
      })
    }, [])
    const profile = R.isNil(props.user) ? null : (
      <Flex p={3} fontColor="#222">
        <Box width="100px">
          <Image src={`${props.user.image}`} width={1} />
        </Box>
        <Box flex={1} px={2}>
          <Box mx={2}>
            <Flex my={2} fontWeight="bold" alignItems="center">
              {props.user.name}
              {R.hasPath(["user", "links", "uport"])(props) ? (
                <Image ml={2} src={`/static/images/uport.png`} height="25px" />
              ) : null}
            </Flex>
            <Box lineHeight="120%" fontSize="14px">
              {props.user.description}
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
              )(props.user.links || {})}
            </Box>
          </Box>
          <Flex width={1} mt={2}>
            <Box p={2} width={0.5}>
              <Box
                textAlign="center"
                p={1}
                sx={{ ...btn }}
                width={1}
                onClick={props.logout}
                bg="orange"
                color="white"
              >
                Logout
              </Box>
            </Box>
            <Box p={2} width={0.5}>
              <Box
                textAlign="center"
                p={1}
                width={1}
                sx={{ ...btn }}
                onClick={() => {
                  if (confirm("Are you sure?")) {
                    props.deleteAccount({
                      user: props.user
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
    const uport_qr = R.xNil(props.uport) ? (
      <Flex justifyContent="center" flexWrap="wrap" px={3}>
        <Box width={1} textAlign="center">
          <Image mt={2} width="300px" src={props.uport.qr} />
        </Box>
        <Box textAlign="center" mb={3} width={1}>
          Scan QR Code with your uPort App.
        </Box>
        <Box textAlign="center" mb={3} width={1}>
          You need a crypto-antique certificate for testnet. Get one{" "}
          <Box
            as="a"
            target="_blank"
            href="https://testnet-ssi.warashibe.market/"
          >
            here
          </Box>
          .
        </Box>
        <Flex width={1} px={3} justifyContent="center" alignItems="flex-start">
          <Flex
            flex={1}
            color="white"
            height="38px"
            mx={2}
            bg={socials_map["uport"].bg}
            sx={{ ...btn, borderRadius: "3px" }}
            onClick={() => {
              props.set(null, "uport")
            }}
            justifyContent="center"
            alignItems="center"
          >
            Back
          </Flex>
          <Box
            sx={{ ...btn }}
            as="a"
            href="https://play.google.com/store/apps/details?id=com.uportMobile&hl=ja"
            target="_blank"
            mx={2}
          >
            <Image src="/static/images/android.svg" />
          </Box>
          <Box
            sx={{ ...btn }}
            as="a"
            href="https://itunes.apple.com/jp/app/uport-id/id1123434510?mt=8"
            target="_blank"
            mx={2}
          >
            <Image src="/static/images/apple.svg" />
          </Box>
        </Flex>
      </Flex>
    ) : null
    const logins = R.isNil(props.user) ? (
      <Flex textAlign="center">
        <Box p={3} width={1}>
          <Flex width={1} flexWrap="wrap">
            {R.map(v => (
              <Flex
                width={[1 / 2, 1 / 3, null, 1 / 4, 1 / 5]}
                color="white"
                p={2}
                alignItems="center"
              >
                <Box
                  onClick={() => props.login({ provider: v })}
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
                      Login with
                    </Box>
                  </Text>
                </Box>
              </Flex>
            ))(R.pluck("key")(socials))}
          </Flex>
        </Box>
      </Flex>
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
                      width={[1 / 2, 1 / 3, null, 1 / 4, 1 / 5]}
                      color="white"
                      p={2}
                      alignItems="center"
                    >
                      <Box
                        onClick={() =>
                          props.unlinkAccount({ provider: v, user: props.user })
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
            )(R.keys(props.user.links))}
            {R.compose(
              R.map(v => (
                <Flex
                  width={[1 / 2, 1 / 3, null, 1 / 4, 1 / 5]}
                  color="white"
                  p={2}
                  alignItems="center"
                >
                  <Box
                    onClick={() =>
                      props.linkAccount({ provider: v, user: props.user })
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
              R.difference(R.__, R.keys(props.user.links))
            )(R.pluck("key")(socials))}
          </Flex>
        </Box>
      </Flex>
    )
    const processing =
      !props.user_init || props.processing ? (
        <Flex
          bg="black"
          sx={{
            zIndex: 100,
            top: 0,
            left: 0,
            position: "fixed",
            opacity: 0.75
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
    const footer = (
      <Flex
        color="white"
        color="#03414D"
        bg="#A0F6D2"
        width={1}
        flexWrap="wrap"
        p={3}
      >
        <Box textAlign="center" width={1}>
          <Box color="#03414D" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )

    return (
      <Box sx={{ position: "relative" }}>
        {processing}
        <Flex flexWrap="wrap">
          <Box
            p={3}
            textAlign="center"
            color="#03414D"
            bg="#A0F6D2"
            width={1}
            mb={3}
          >
            Connect MetaMask to Ropsten Testnet or login with Authereum Ropsten
          </Box>
          <Box width={[1, 1, 0.5]}>{R.xNil(uport_qr) ? uport_qr : logins}</Box>
          <Box width={[1, 1, 0.5]}>
            {profile}
            <Wallet />
            <Box width={1} px={3} mb={3}>
              <Box
                sx={{ ...btn }}
                p={2}
                textAlign="center"
                bg="#FF4C2F"
                color="white"
                onClick={() => {
                  props[
                    R.isNil(props.auth_selected)
                      ? "connectAuthereum"
                      : "disconnectAuthereum"
                  ]({ user: props.user })
                }}
              >
                {R.isNil(props.auth_selected) ? "Connect" : "Disconnect"}{" "}
                Authereum
              </Box>
            </Box>
          </Box>
        </Flex>
        {footer}
      </Box>
    )
  },
  [
    "user",
    "eth_selected",
    "auth_selected",
    "user_addresses",
    "uport",
    "user_init",
    "processing"
  ],
  [
    "tracker",
    "changeUser",
    "connectAuthereum",
    "disconnectAuthereum",
    "login",
    "logout",
    "hookWeb3",
    "deleteAccount",
    "linkAccount",
    "unlinkAccount",
    "check_alis",
    "set"
  ]
)
