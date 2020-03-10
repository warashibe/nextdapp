import { ThemeProvider } from "emotion-theming"
import R from "ramdam"
import binder from "../src/lib/binder"
import preset from "@rebass/preset"
import { Image, Text, Box, Flex } from "rebass"
import { Radio } from "@rebass/forms"

const Address = binder(
  props => {
    let a = props.a
    let connected = props.connected ? (
      <Text color="#4CAF50" display="inline-block" sx={{ fontSize: "12px" }}>
        接続中
      </Text>
    ) : (
      <Text color="#666" display="inline-block" sx={{ fontSize: "12px" }}>
        未接続
      </Text>
    )

    return (
      <ThemeProvider theme={preset}>
        <Box
          as="tr"
          bg={props.index % 2 === 0 ? "#ccc" : "#ddd"}
          onClick={
            R.isNil(props.user)
              ? null
              : () => {
                  props.setWallet({
                    address: a.address,
                    uid: props.user.uid,
                    plus: props.plus,
                    isAuthereum: R.equals(props.auth_selected, a.address)
                  })
                }
          }
          alignItems="center"
          mr={2}
          mb={1}
          mt={"3px"}
          sx={
            R.isNil(props.user)
              ? null
              : { cursor: "pointer", ":hover": { color: "tomato" } }
          }
        >
          {R.isNil(props.user) ? null : (
            <Box as="td" sx={{ textAlign: "center" }}>
              <Flex width={1} justifyContent="center">
                {props.plus || !a.main ? null : (
                  <Radio
                    key={a.address}
                    display="inline-block"
                    checked={a.main === true}
                    ml="8px"
                  />
                )}
              </Flex>
            </Box>
          )}
          <Box as="td" px={3} py={2} sx={{ wordBreak: "break-all" }}>
            <Text>{a.address}</Text>
          </Box>
          <Box as="td" sx={{ whiteSpace: "nowrap" }} px={1} width="90px">
            <Flex justifyContent="center" width={1}>
              {a.authereum || R.equals(a.address, props.auth_selected) ? (
                <Image
                  mr={2}
                  title="Authereum"
                  width="20px"
                  src="/static/images/authereum.png"
                />
              ) : (
                <Image
                  mr={2}
                  title="Metamask"
                  width="20px"
                  src="/static/images/metamask.png"
                />
              )}
              <Text>{connected}</Text>
            </Flex>
          </Box>
          {R.isNil(props.user) ? null : (
            <Box
              as="td"
              onClick={
                props.plus
                  ? null
                  : e => {
                      e.stopPropagation()
                      if (a.core !== true) {
                        props.removeAddress({
                          address: a,
                          uid: props.user.uid
                        })
                      } else {
                        alert("アカウント登録に使用したアドレスです。")
                      }
                    }
              }
              p={2}
              width="50px"
              sx={{
                textAlign: "center",
                ":hover": {
                  opacity: 0.75
                }
              }}
            >
              {a.core !== true ? (
                <Box
                  as="i"
                  className={props.plus ? "fas fa-plus" : "fas fa-times"}
                  width="20px"
                  height="20px"
                  color={props.plus ? "#4CAF50" : "tomato"}
                />
              ) : (
                <Box
                  as="i"
                  className={"fas fa-sign-in-alt"}
                  width="20px"
                  height="20px"
                  color={
                    a.core === true
                      ? "#0077CC"
                      : props.plus
                        ? "#4CAF50"
                        : "tomato"
                  }
                />
              )}
            </Box>
          )}
        </Box>
      </ThemeProvider>
    )
  },
  ["user", "auth_selected"],
  ["setWallet", "removeAddress"]
)

export default Address
