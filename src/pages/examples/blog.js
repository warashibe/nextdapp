import { Box, Flex, Text, Image, Button } from "rebass"
import moment from "moment"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import { useEffect } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Status from "../../../components/Status"
import SelectWallet from "../../../components/SelectWallet"
import conf from "../../conf"
const entities = require("entities")
import { connect_to_3box } from "../../../lib/_epic/blog"
import {
  autoCheckUniswap,
  checkUniswapAllowance
} from "../../../lib/_epic/uniswap"

import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"
const showdown = require("showdown")
const converter = new showdown.Converter()
import hljs from "highlight.js"
import cheerio from "cheerio"
const dracula = (
  <style jsx>{`
    /* Dracula Theme v1.2.5
 *
 * https://github.com/dracula/highlightjs
 *
 * Copyright 2016-present, All rights reserved
 *
 * Code licensed under the MIT license
 *
 * @author Denis Ciccale <dciccale@gmail.com>
 * @author Zeno Rocha <hi@zenorocha.com>
 */

    .hljs {
      display: block;
      overflow-x: auto;
      padding: 0.5em;
      background: #282a36;
    }

    .hljs-built_in,
    .hljs-selector-tag,
    .hljs-section,
    .hljs-link {
      color: #8be9fd;
    }

    .hljs-keyword {
      color: #ff79c6;
    }

    .hljs,
    .hljs-subst {
      color: #f8f8f2;
    }

    .hljs-title {
      color: #50fa7b;
    }

    .hljs-string,
    .hljs-meta,
    .hljs-name,
    .hljs-type,
    .hljs-attr,
    .hljs-symbol,
    .hljs-bullet,
    .hljs-addition,
    .hljs-variable,
    .hljs-template-tag,
    .hljs-template-variable {
      color: #f1fa8c;
    }

    .hljs-comment,
    .hljs-quote,
    .hljs-deletion {
      color: #6272a4;
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-literal,
    .hljs-title,
    .hljs-section,
    .hljs-doctag,
    .hljs-type,
    .hljs-name,
    .hljs-strong {
      font-weight: bold;
    }

    .hljs-literal,
    .hljs-number {
      color: #bd93f9;
    }

    .hljs-emphasis {
      font-style: italic;
    }
  `}</style>
)

export default binder(
  props => {
    const blogger_address = props.router.query.address
    useEffect(() => {
      isFirebase().then(async () => {
        props.tracker({
          global: true,
          tracks: {
            user: {
              any: ["address_in_use", "eth_selected", "auth_selected"],
              func: connect_to_3box,
              args: { access: "public", blogger_address: blogger_address }
            }
          }
        })
        props.hookWeb3()
      })
    }, [])

    const footer = (
      <Flex color="white" bg="teal" width={1} flexWrap="wrap" p={3}>
        <Box textAlign="center" width={1}>
          <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )
    let __html = props.blog_new_body
    if (props.blog_mode === "preview") {
      try {
        try {
          __html = converter.makeHtml(props.blog_new_body || "")
        } catch (e) {
          console.log(e)
        }
        try {
          const $ = cheerio.load(`<div id="outerHTML">${__html}</div>`)
          $("code").each(function() {
            let language
            try {
              const classes = $(this)
                .attr("class")
                .split(" ")
              for (let v of classes) {
                if (v.match(/language-/) !== null) {
                  language = v
                    .split("-")
                    .slice(1)
                    .join("-")
                }
              }
            } catch (e) {}
            $(this).addClass("hljs")
            try {
              $(this).html(
                R.isNil(language)
                  ? hljs.highlightAuto(entities.decodeHTML($(this).html()))
                      .value
                  : hljs.highlight(
                      language,
                      entities.decodeHTML($(this).html())
                    ).value
              )
            } catch (e) {
              console.log(e)
            }
          })
          __html = $("#outerHTML").html()
        } catch (e) {
          console.log(e)
        }
      } catch (e) {
        console.log(e)
      }
    }
    return (
      <ThemeProvider theme={preset}>
        {dracula}
        <Flex
          width={1}
          bg="teal"
          color="white"
          p={3}
          fontSize="18px"
          justifyContent="center"
          fontWeight="bold"
        >
          IPFS Blog Example
        </Flex>
        <Flex flexWrap="wrap">
          <Status />
          <Box p={3} width={[1, null, 0.5]}>
            <SelectWallet />
            {props.blog_mine !== true ? (
              <Box
                flex={1}
                mt={3}
                textAlign="center"
                p={2}
                bg={"teal"}
                color="white"
              >
                {props.blog_address}
              </Box>
            ) : (
              <Flex width={1}>
                <Box
                  flex={1}
                  mt={3}
                  textAlign="center"
                  onClick={() => {
                    props.blogSwitchAccess({
                      access: "public",
                      blogger_address: blogger_address
                    })
                  }}
                  sx={{ ...btn }}
                  p={2}
                  bg={props.blog_access === "public" ? "teal" : "#666"}
                  color="white"
                >
                  Public
                </Box>
                <Box
                  flex={1}
                  mt={3}
                  textAlign="center"
                  bg={props.blog_access === "private" ? "teal" : "#666"}
                  onClick={() => {
                    props.blogSwitchAccess({
                      access: "private",
                      blogger_address: blogger_address
                    })
                  }}
                  sx={{ ...btn }}
                  p={2}
                  color="white"
                >
                  Private
                </Box>
              </Flex>
            )}
            {R.isNil(props.blog_space) ? (
              <Flex
                color="teal"
                p={4}
                justifyContent="center"
                alignItems="center"
              >
                <Box as="i" className="fa fa-spin fa-sync" mr={2} />{" "}
                Connecting...
              </Flex>
            ) : (
              <React.Fragment>
                {props.blog_mine !== true ? null : (
                  <React.Fragment>
                    {props.blog_access === "private" ? (
                      <Box pt={3} px={2} textAlign="center" lineHeight="150%">
                        <Box color="teal">
                          No one in the world can view your private data but
                          you. Not even the platform owners. It's encrypted and
                          saved onto IPFS where only you can access with your
                          private key.
                        </Box>
                      </Box>
                    ) : (
                      <Box pt={3} px={2} textAlign="center" lineHeight="150%">
                        <Box>Share your public articles at</Box>
                        <Box
                          target="_blank"
                          href={`${conf.blog.root}?address=${
                            props.blog_address
                          }`}
                          as="a"
                          color="teal"
                          textDecoration="none"
                        >
                          {conf.blog.root}
                          ?address=
                          {props.blog_address}
                        </Box>
                      </Box>
                    )}
                    {props.blog_ready === false ? (
                      <Box p={3} color="#FF4C2F" textAlign="center">
                        Your account is in the process of syncing with 3box. It
                        takes some time to get recognized if your account is
                        new. Come back in 30 mins or try reloading the page.
                      </Box>
                    ) : (
                      <Box
                        mt={3}
                        textAlign="center"
                        onClick={() => {
                          props.createArticle()
                        }}
                        sx={{ ...btn }}
                        p={2}
                        bg="teal"
                        color="white"
                      >
                        Create Article
                      </Box>
                    )}
                  </React.Fragment>
                )}
                <Box
                  as="table"
                  width={1}
                  key={`articles_${props.blog_updated}`}
                >
                  <Box as="tbody">
                    {R.addIndex(R.map)((v, i) => {
                      return (
                        <Box
                          key={`article_${v.id}`}
                          color={
                            props.blog_selected_article === v.id
                              ? "white"
                              : "#333"
                          }
                          bg={
                            props.blog_selected_article === v.id
                              ? "#232538"
                              : i % 2 === 0
                                ? "#eee"
                                : "#ddd"
                          }
                          as="tr"
                          onClick={() => {
                            props.blogLoadArticle({
                              id: v.id,
                              thread_address: v.address
                            })
                          }}
                          sx={{ ...btn }}
                          mt={3}
                        >
                          <Box as="td" p={2}>
                            {v.title || "No Title"}
                          </Box>
                        </Box>
                      )
                    })(props.blog_articles)}
                  </Box>
                </Box>
              </React.Fragment>
            )}
          </Box>
          <Box p={3} width={[1, null, 0.5]}>
            {R.isNil(props.blog_thread) ? null : (
              <React.Fragment>
                {props.blog_mine !== true ? null : (
                  <Box mb={2}>
                    {R.addIndex(R.map)((v, i) => {
                      return (
                        <Box
                          display="inline-block"
                          m={1}
                          py={1}
                          px={2}
                          textAlign="center"
                          bg={props.blog_history_cursor === i ? "teal" : "#666"}
                          color="white"
                          sx={{ ...btn }}
                          onClick={() => {
                            props.blogLoadHistory({ index: i })
                          }}
                        >
                          {i + 1}
                        </Box>
                      )
                    })(props.blog_post_history)}
                  </Box>
                )}
                {props.blog_mode === "preview" ? (
                  <Box>
                    <Box
                      as="h1"
                      mb={2}
                      pb={1}
                      sx={{ borderBottom: "2px solid #999" }}
                    >
                      {props.blog_new_title}
                    </Box>
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: __html
                      }}
                    />
                  </Box>
                ) : (
                  <React.Fragment>
                    <Input
                      mb={3}
                      placeholder="title"
                      defaultValue={props.blog_new_title}
                      value={
                        R.xNil(props.blog_new_title_lock)
                          ? props.blog_new_title_lock
                          : null
                      }
                      onClick={e => {
                        props.set(null, "blog_new_title_lock")
                      }}
                      onChange={e => {
                        props.set(null, "blog_new_title_lock")
                        props.set(e.target.value, "blog_new_title")
                      }}
                    />
                    <Textarea
                      mb={3}
                      height="300px"
                      defaultValue={props.blog_new_body}
                      value={
                        R.xNil(props.blog_new_body_lock)
                          ? props.blog_new_body_lock
                          : null
                      }
                      placeholder="markdown"
                      onClick={e => {
                        props.set(null, "blog_new_body_lock")
                      }}
                      onChange={e => {
                        props.set(null, "blog_new_body_lock")
                        props.set(e.target.value, "blog_new_body")
                      }}
                    />
                  </React.Fragment>
                )}
                {props.blog_mine !== true ? null : (
                  <Flex width={1}>
                    <Box
                      flex={1}
                      textAlign="center"
                      onClick={() => {
                        props.postBlog({
                          title: props.blog_new_title,
                          body: props.blog_new_body
                        })
                      }}
                      sx={{ ...btn }}
                      p={2}
                      bg="teal"
                      color="white"
                    >
                      SAVE
                    </Box>
                    <Box
                      flex={1}
                      textAlign="center"
                      onClick={() => {
                        props.blogSwitchModes({
                          mode: props.blog_mode === "edit" ? "preview" : "edit"
                        })
                      }}
                      sx={{ ...btn }}
                      p={2}
                      bg="#4CAF50"
                      color="white"
                    >
                      {props.blog_mode === "edit" ? "PREVIEW" : "EDIT"}
                    </Box>
                    <Box
                      flex={1}
                      textAlign="center"
                      onClick={() => {
                        props.blogDeleteArticle({
                          id: props.blog_selected_article
                        })
                      }}
                      sx={{ ...btn }}
                      p={2}
                      bg="#CB3837"
                      color="white"
                    >
                      DELETE
                    </Box>
                  </Flex>
                )}
              </React.Fragment>
            )}
          </Box>
        </Flex>
        {footer}
      </ThemeProvider>
    )
  },
  [
    "web3_block",
    "address_in_use",
    "eth_selected",
    "auth_selected",
    "user_balances",
    "auth_init",
    "web3_network",
    "blog_new_title",
    "blog_articles",
    "blog_new_body",
    "blog_new_title_lock",
    "blog_new_body_lock",
    "ongoing",
    "blog_space",
    "blog_thread",
    "blog_post_history",
    "blog_history_cursor",
    "blog_selected_article",
    "blog_access",
    "blog_mode",
    "blog_address",
    "blog_mine",
    "blog_ready",
    "blog_updated"
  ],
  [
    "blogSwitchModes",
    "blogSwitchAccess",
    "blogLoadArticle",
    "blogDeleteArticle",
    "createArticle",
    "tracker",
    "connectAuthereum",
    "disconnectAuthereum",
    "hookWeb3",
    "postBlog",
    "set",
    "merge",
    "switchWallet",
    "blogLoadHistory"
  ]
)
