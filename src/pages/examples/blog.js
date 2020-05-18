import { Box, Flex, Text, Image, Button } from "rebass"
import Nav from "../../../components/Nav"
import { SMENU } from "../../lib/const"
import useEventListener from "@use-it/event-listener"
import moment from "moment"
import N from "bignumber.js"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import binder from "../../lib/binder"
const isFirebase = require("../../../lib/firestore-short/isFirebase")
import React, { useEffect, useMemo, useState } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Status from "../../../components/Status"
import SelectWallet from "../../../components/SelectWallet"
import conf from "../../conf"
const entities = require("entities")
import { connect_to_3box } from "../../../lib/_epic/blog"
import { _checkHeight } from "../../../lib/_epic/util"
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
import Dracula from "../../lib/css/Dracula"
import GithubMarkdown from "../../lib/css/GithubMarkdown"

import { Node } from "slate"
const serialize = nodes => nodes.map(n => Node.string(n)).join("\n")

const getElementOffset = element => {
  if (R.isNil(element)) {
    return { top: 0, left: 0 }
  }
  var de = document.documentElement
  var box = element.getBoundingClientRect()
  var top = box.top + window.pageYOffset - de.clientTop
  var left = box.left + window.pageXOffset - de.clientLeft
  return { top: top, left: left }
}
const offsetTop = () => {
  var supportPageOffset = window.pageXOffset !== undefined
  var isCSS1Compat = (document.compatMode || "") === "CSS1Compat"
  var scrollTop = supportPageOffset
    ? window.pageYOffset
    : isCSS1Compat
      ? document.documentElement.scrollTop
      : document.body.scrollTop
  return scrollTop
}

import Editor from "../../../components/Editor"

import ReactHtmlParser from "react-html-parser"
const marked = require("marked")
import Preview from "../../../components/Preview"

export default binder(
  props => {
    const checkHeight = () => {
      props.checkHeight({
        ids: ["footer", "nav", "blog_title", "blog_btn_save"],
        _default: 170
      })
    }
    const blogger_address = props.router.query.address
    const blogger_list_id = props.router.query.list
    const blogger_article_id = props.router.query.article
    const [mounted, setMounted] = useState(false)
    const share_root = R.xNil(props.url)
      ? props.url.protocol + "//" + props.url.host + props.url.pathname
      : conf.blog.root
    useEventListener("resize", checkHeight)
    useEffect(() => {
      props.set(props.router, "router")
      setMounted(true)
      checkHeight()
      setTimeout(checkHeight, 1000)
      isFirebase().then(async () => {
        props.tracker({
          global: true,
          tracks: {
            user: {
              any: ["address_in_use", "eth_selected", "auth_selected"],
              func: connect_to_3box,
              args: {
                access: "public",
                blogger_address: blogger_address,
                article_id: blogger_article_id,
                dir_id: blogger_list_id
              }
            },
            height: {
              any: ["blog_selected_article", "tab"],
              func: _checkHeight,
              args: {
                ids: ["footer", "nav", "blog_title", "blog_btn_save"],
                _default: 170,
                delay: 500
              }
            }
          }
        })
        props.getURL()
        if (R.xNil(blogger_address) && false) {
          props.connect_to_3box_public({
            blogger_address,
            dir_id: blogger_list_id,
            article_id: blogger_article_id
          })
        } else {
          props.hookWeb3({ _network: "1" })
        }
      })
    }, [])

    const footer = (
      <Flex
        id="footer"
        color="white"
        bg="#03414D"
        width={1}
        flexWrap="wrap"
        p={3}
      >
        <Box textAlign="center" width={1}>
          <Box color="white" sx={{ textDecoration: "none" }} as="a" href="/">
            © 2020 Next Dapp by Warashibe
          </Box>
        </Box>
      </Flex>
    )
    let __html = ""
    let content_table = []
    try {
      try {
        __html = marked(serialize(props.blog_editor_value || []))
        if (
          props.subtab === "toc" ||
          props.tab === "full_preview" ||
          props.blog_mine !== true
        ) {
          try {
            const $ = cheerio.load(`<div id="outerHTML">${__html}</div>`)
            $("pre").each(function() {
              $(this)
                .find("code")
                .each(function() {
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
                        ? hljs.highlightAuto(
                            entities.decodeHTML($(this).html())
                          ).value
                        : hljs.highlight(
                            language,
                            entities.decodeHTML($(this).html())
                          ).value
                    )
                  } catch (e) {
                    console.log(e)
                  }
                })
            })
            let i = 0
            $("h1,h2").each(function(e) {
              $(this).attr("id", `title-${++i}`)
              content_table.push({
                tagname: this.name,
                index: i,
                title: $(this).text()
              })
            })
            __html = $("#outerHTML").html()
          } catch (e) {
            console.log(e)
          }
        }
      } catch (e) {
        console.log(e)
      }
    } catch (e) {
      console.log(e)
    }

    let tmenu = []
    if (R.xNil(props.address_in_use) && props.blog_mine) {
      const address = props[`${props.address_in_use}_selected`]
      tmenu.push({
        index: 1,
        text: address,
        key: "address",
        icon: `/static/images/${
          { eth: "metamask", auth: "authereum" }[props.address_in_use]
        }.png`
      })
    } else if (props.blog_mine === false) {
      tmenu.push({
        index: 1,
        text: blogger_address,
        key: "address",
        awesome_icon: "fas fa-newspaper"
      })
    }

    let smenu = [
      {
        text: "Articles",
        key: "default",
        awesome_icon: "fas fa-newspaper",
        onClick: props => () => {
          props.set(null, "blog_selected_article")
          props.set("default", "tab")
        }
      }
    ]
    if (R.isNil(blogger_address)) {
      smenu.push({
        text: "Connection",
        key: "connection",
        awesome_icon: "fas fa-satellite-dish",
        onClick: props => () => {
          props.set("connection", "tab")
        }
      })
      smenu.push({
        text: "Info",
        key: "info",
        awesome_icon: "fas fa-info",
        onClick: props => () => {
          props.set("info", "tab")
        }
      })
    } else {
      smenu.push({
        text: "Edit Yours",
        key: "edit",
        target: "_self",
        href: "/examples/blog",
        awesome_icon: "fas fa-edit"
      })
    }
    smenu[smenu.length - 1].border = true
    smenu = R.concat(smenu, SMENU)
    let main = null
    if (props.tab === "info") {
      main = (
        <Flex flexWrap="wrap" width={1}>
          <Box lineHeight="150%" p={4} width={1}>
            <Box mb={2} color="#232538">
              [Breaking Changes] You can access your articles written on the
              previous version at
            </Box>
            <Box
              display="block"
              p={3}
              color="white"
              bg="#BF731C"
              sx={{
                borderRadius: "3px",
                ...btn,
                wordBreak: "break-all"
              }}
              as="a"
              target="_blank"
              href={`https://next-dapp-ri4hh3s26.now.sh/examples/blog`}
            >
              <Box color="white" sx={{ textDecoration: "none" }}>
                v0.2 [https://next-dapp-ri4hh3s26.now.sh/examples/blog]
              </Box>
            </Box>
            <Box
              mt={3}
              display="block"
              p={3}
              color="white"
              bg="#BF731C"
              sx={{
                borderRadius: "3px",
                ...btn,
                wordBreak: "break-all"
              }}
              as="a"
              target="_blank"
              href={`https://next-dapp-adc2h9t9w.now.sh/examples/blog`}
            >
              <Box color="white" sx={{ textDecoration: "none" }}>
                v0.1 [https://next-dapp-adc2h9t9w.now.sh/examples/blog]
              </Box>
            </Box>
          </Box>
        </Flex>
      )
    } else if (
      props.tab === "default" &&
      R.isNil(props.blog_selected_article)
    ) {
      main = (
        <Flex flexWrap="wrap">
          {props.blog_mine !== true ? null : (
            <Flex width={1}>
              <Box
                flex={1}
                textAlign="center"
                onClick={() => {
                  if (props.blog_3box_status === 3) {
                    props.blogSwitchAccess({
                      access: "public",
                      blogger_address: blogger_address
                    })
                  }
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
                textAlign="center"
                bg={props.blog_access === "private" ? "teal" : "#666"}
                onClick={() => {
                  if (props.blog_3box_status === 3) {
                    props.blogSwitchAccess({
                      access: "private",
                      blogger_address: blogger_address
                    })
                  }
                }}
                sx={{ ...btn }}
                p={2}
                color="white"
              >
                Private
              </Box>
            </Flex>
          )}

          <Box p={3} width={[1, null, 0.5]}>
            {props.blog_3box_status < 0 ? (
              <Flex
                color="#CB3837"
                p={4}
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
              >
                <Box as="i" className="fa fa-exclamation" mr={2} />
                Something went wrong. Try again in a few minutes.
              </Flex>
            ) : props.blog_3box_status !== 3 ? (
              <Flex
                color="teal"
                p={4}
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
              >
                <Flex width={1} justifyContent="center" mb={3}>
                  {R.map(v => (
                    <Flex
                      as="i"
                      className="fas fa-circle"
                      fontSize="25px"
                      color={props.blog_3box_status >= v ? "teal" : "#999"}
                      m={3}
                    />
                  ))([0, 1, 2])}
                </Flex>
                <Box as="i" className="fa fa-spin fa-sync" mr={2} />
                {
                  [
                    "connecting to 3Box ...",
                    "connecting to a space ...",
                    "finishing up ..."
                  ][props.blog_3box_status]
                }
              </Flex>
            ) : (
              <React.Fragment>
                {props.blog_mine === true ? (
                  <Box
                    textAlign="center"
                    onClick={() => {
                      props.createArticleList()
                    }}
                    sx={{ ...btn }}
                    p={2}
                    bg="teal"
                    color="white"
                  >
                    Create List
                  </Box>
                ) : (
                  <Box textAlign="center" p={2} bg="teal" color="white">
                    Select List
                  </Box>
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
                          key={`dir_${v.id}`}
                          color={
                            props.blog_selected_dir === v.id ? "white" : "#333"
                          }
                          bg={
                            props.blog_selected_dir === v.id
                              ? "#232538"
                              : i % 2 === 0
                                ? "#eee"
                                : "#ddd"
                          }
                          as="tr"
                          onClick={() => {
                            if (
                              v.id === null ||
                              v.id !== props.blog_edit_list_name
                            )
                              props.blogLoadDir({
                                id: v.id,
                                thread_address: v.address
                              })
                          }}
                          sx={{ ...btn }}
                          mt={3}
                        >
                          <Box as="td" p={2}>
                            {v.id != null &&
                            v.id === props.blog_edit_list_name ? (
                              <Input
                                p={1}
                                onChange={e => {
                                  props.set(
                                    e.target.value,
                                    "blog_edit_list_name_value"
                                  )
                                }}
                                value={props.blog_edit_list_name_value}
                                bg="white"
                                color="#333"
                                m={0}
                              />
                            ) : (
                              v.title || v.id
                            )}
                          </Box>
                          {props.blog_mine ===
                          false ? null : props.blog_mine === true &&
                          R.xNil(v.id) ? (
                            <Box
                              width="50px"
                              as="td"
                              bg={
                                v.id === props.blog_edit_list_name
                                  ? "#BF731C"
                                  : "#198643"
                              }
                              sx={{ ...btn }}
                              textAlign="center"
                              onClick={e => {
                                e.stopPropagation()
                                if (v.id === props.blog_edit_list_name) {
                                  if (
                                    /^\s*$/.test(
                                      props.blog_edit_list_name_value
                                    ) === false
                                  ) {
                                    props.blogChangeListTitle({
                                      id: v.id,
                                      title: props.blog_edit_list_name_value
                                    })
                                  } else {
                                    props.set(
                                      {
                                        blog_edit_list_name_value: "",
                                        blog_edit_list_name: null
                                      },
                                      null
                                    )
                                  }
                                } else {
                                  props.set(
                                    {
                                      blog_edit_list_name: v.id,
                                      blog_edit_list_name_value: v.title || ""
                                    },
                                    null
                                  )
                                }
                              }}
                            >
                              <Box
                                color="white"
                                as="i"
                                className={`far fa-${
                                  v.id === props.blog_edit_list_name
                                    ? "save"
                                    : "edit"
                                }`}
                              />
                            </Box>
                          ) : (
                            <Box as="td" />
                          )}
                        </Box>
                      )
                    })(
                      R.concat(
                        [
                          {
                            title: "Default",
                            id: null,
                            date: null,
                            address: null
                          }
                        ],
                        props.blog_dirs || []
                      )
                    )}
                  </Box>
                </Box>
                {props.blog_mine !== true ? null : (
                  <React.Fragment>
                    {props.blog_access === "private" ? (
                      <Box
                        mt={3}
                        p={3}
                        lineHeight="150%"
                        bg="#BF731C"
                        color="white"
                        sx={{ borderRadius: "3px" }}
                      >
                        No one in the world can view your private data but you.
                        Not even the platform owners. It's encrypted and saved
                        onto IPFS where only you can access with your private
                        key.
                      </Box>
                    ) : (
                      <Box mt={3} lineHeight="150%">
                        <Box mb={2} color="#232538">
                          Share your public articles on this list at
                        </Box>
                        <Box
                          display="block"
                          p={3}
                          color="white"
                          bg="#BF731C"
                          sx={{
                            borderRadius: "3px",
                            ...btn,
                            wordBreak: "break-all"
                          }}
                          as="a"
                          target="_blank"
                          href={`${share_root}?address=${props.blog_address}${
                            R.xNil(props.blog_selected_dir)
                              ? `&list=${props.blog_selected_dir}`
                              : ""
                          }`}
                        >
                          <Box color="white" sx={{ textDecoration: "none" }}>
                            {share_root}
                            ?address=
                            {props.blog_address}
                            {R.xNil(props.blog_selected_dir)
                              ? `&list=${props.blog_selected_dir}`
                              : ""}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </Box>
          <Box p={3} width={[1, null, 0.5]}>
            {props.blog_ready === false ? (
              <Box
                p={3}
                color="white"
                bg="#BF731C"
                sx={{ borderRadius: "3px" }}
                lineHeight="150%"
              >
                Your account is in the process of syncing with 3box. It takes
                some time to get recognized if your account is new. Come back in
                30 mins or try reloading the page if it gets stuck.
              </Box>
            ) : props.blog_mine === true ? (
              <Box
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
            ) : (
              <Box textAlign="center" p={2} bg="teal" color="white">
                Select Article
              </Box>
            )}
            {props.blog_ready === true &&
            props.blog_mine &&
            props.blog_selected_dir !== null &&
            (props.blog_articles || []).length === 0 ? (
              <Box
                textAlign="center"
                onClick={() => {
                  if (confirm("Are you sure?")) {
                    props.blogDeleteList({ id: props.blog_selected_dir })
                  }
                }}
                sx={{ ...btn }}
                p={2}
                bg="#CB3837"
                color="white"
              >
                Delete List
              </Box>
            ) : (
              <Box as="table" width={1} key={`articles_${props.blog_updated}`}>
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
                          {v.title || v.id}
                        </Box>
                      </Box>
                    )
                  })(props.blog_articles || [])}
                </Box>
              </Box>
            )}
          </Box>
        </Flex>
      )
    } else if (props.tab === "connection") {
      main = (
        <Flex flexWrap="wrap">
          <Status _network="1" />
          <Box p={3} width={1}>
            <SelectWallet />
          </Box>
        </Flex>
      )
    } else if (props.tab === "full_preview" || props.blog_mine !== true) {
      main = (
        <React.Fragment>
          <GithubMarkdown />
          <Dracula />
          <Flex color="#333">
            <Box width={[1, null, null, 3 / 4]}>
              <Box px={4}>
                <Box py={4} sx={{ borderBottom: "1px solid #ddd" }}>
                  <Box
                    fontSize={["20px", "25px", "30px"]}
                    fontWeight="bold"
                    fontFamily="'Kosugi', sans-serif"
                  >
                    {props.blog_new_title}
                  </Box>
                </Box>
              </Box>
              <Box
                p={[3, null, 4]}
                className="markdown-body"
                dangerouslySetInnerHTML={{
                  __html: __html
                }}
              />
            </Box>
            <Box width={[1 / 4]} display={["none", null, null, "block"]}>
              <Box width={1} sx={{ top: 80, position: "sticky" }}>
                <Box sx={{ borderLeft: "3px solid #9FC555" }} p={2}>
                  {R.map(v => {
                    return (
                      <Box
                        as="a"
                        display="block"
                        color="#666"
                        sx={{
                          textDecoration: "none",
                          ":hover": {
                            color: "#A2C856"
                          }
                        }}
                        href={`#title-${v.index}`}
                        onClick={e => {
                          e.preventDefault()
                          const x = getElementOffset(
                            document.getElementById(`title-${v.index}`)
                          )
                          window.scrollTo({
                            top: x.top - 65,
                            behavior: "smooth"
                          })
                        }}
                        p={1}
                        ml={v.tagname === "h1" ? 0 : 3}
                        fontSize={v.tagname === "h1" ? "14px" : "12px"}
                      >
                        {v.title}
                      </Box>
                    )
                  })(content_table)}
                </Box>
              </Box>
            </Box>
          </Flex>

          {props.blog_mine === true ? (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                props.set("default", "tab")
              }}
              sx={{ ...btn }}
              p={2}
              bg="#BF731C"
              color="white"
              id="blog_btn_save"
            >
              BACK TO EDIT
            </Box>
          ) : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                props.set({ tab: "default", blog_selected_article: null }, null)
                if (props.blog_mine === false) {
                  let url = `${
                    props.router.pathname
                  }?address=${blogger_address}`
                  if (R.xNil(props.blog_selected_dir)) {
                    url += `&list=${props.blog_selected_dir}`
                  }
                  props.router.replace(url, url, {
                    shallow: true
                  })
                }
              }}
              sx={{ ...btn }}
              p={2}
              bg="#BF731C"
              color="white"
              id="blog_btn_save"
            >
              BACK TO LIST
            </Box>
          )}
        </React.Fragment>
      )
    } else {
      main = (
        <React.Fragment>
          <Flex flexWrap="wrap">
            <Box width={[1, null, 0.5]} sx={{ borderLeft: "1px solid #ddd" }}>
              {R.isNil(props.blog_thread) ? null : (
                <React.Fragment>
                  <React.Fragment>
                    <Input
                      id="blog_title"
                      sx={{ border: "1px solid #999", borderRadius: 0 }}
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
                    <Box height={props.height} sx={{ overflow: "auto" }} p={3}>
                      <Editor
                        editor_style={{ height: "100%" }}
                        key={`editor-${props.blog_history_cursor}-${
                          props.blog_updated
                        }`}
                        init_value={props.blog_editor_value}
                      />
                    </Box>
                  </React.Fragment>
                </React.Fragment>
              )}
            </Box>
            <Box width={[1, null, 0.5]} sx={{ borderLeft: "1px solid #ddd" }}>
              <Flex width={1} flexWrap="wrap">
                {R.map(v => {
                  const bg = v.key === props.subtab ? "teal" : "#999"
                  return (
                    <Box
                      textAlign="center"
                      width={1 / 3}
                      bg={bg}
                      color="white"
                      p={2}
                      sx={{ ...btn }}
                      onClick={() => props.set(v.key, "subtab")}
                    >
                      {v.name}
                    </Box>
                  )
                })([
                  { key: "default", name: "Preview" },
                  { key: "toc", name: "ToC" },
                  { key: "history", name: "History" }
                ])}
              </Flex>
              {props.subtab === "default" ? (
                <Preview
                  set={props.set}
                  setValue={props.blog_setValue}
                  mounted={mounted}
                  value={props.blog_editor_value}
                  height={props.height}
                />
              ) : props.subtab === "history" ? (
                <Box p={3} height={props.height} sx={{ overflow: "auto" }}>
                  {R.addIndex(R.map)((v, i) => {
                    return (
                      <Flex
                        display="inline-block"
                        width={1}
                        py={1}
                        px={2}
                        textAlign="center"
                        bg={
                          props.blog_history_cursor ===
                          props.blog_post_history.length - i - 1
                            ? "teal"
                            : i % 2 === 0
                              ? "#777"
                              : "#555"
                        }
                        color="white"
                        sx={{ ...btn }}
                        onClick={() => {
                          props.blogLoadHistory({
                            index: props.blog_post_history.length - i - 1
                          })
                        }}
                      >
                        <Flex width="50px" justifyContent="center">
                          {props.blog_post_history.length - i}
                        </Flex>
                        <Flex flex={1}>
                          {moment(v.timestamp * 1000).format(
                            "YYYY MM/DD HH:mm:ss"
                          )}
                        </Flex>
                      </Flex>
                    )
                  })(R.reverse(props.blog_post_history))}
                </Box>
              ) : (
                <Box p={3} height={props.height} sx={{ overflow: "auto" }}>
                  <Box color="teal" fontWeight="bold" mb={2}>
                    Table of Content
                  </Box>
                  <Box sx={{ borderLeft: "3px solid teal" }} ml={3} p={2}>
                    {R.map(v => {
                      return (
                        <Box
                          display="block"
                          color="#666"
                          sx={{
                            textDecoration: "none",
                            ":hover": {
                              color: "teal"
                            }
                          }}
                          p={1}
                          ml={v.tagname === "h1" ? 0 : 3}
                          fontSize={v.tagname === "h1" ? "18px" : "16px"}
                        >
                          {v.title}
                        </Box>
                      )
                    })(content_table)}
                  </Box>
                  <Box mt={3} lineHeight="150%">
                    <Box mb={2} color="#232538">
                      Share this article at
                    </Box>
                    <Box
                      display="block"
                      p={3}
                      color="white"
                      bg="#BF731C"
                      sx={{
                        borderRadius: "3px",
                        ...btn,
                        wordBreak: "break-all"
                      }}
                      as="a"
                      target="_blank"
                      href={`${share_root}?address=${props.blog_address}${
                        R.xNil(props.blog_selected_dir)
                          ? `&list=${props.blog_selected_dir}`
                          : ""
                      }&article=${props.blog_selected_article}`}
                    >
                      <Box color="white" sx={{ textDecoration: "none" }}>
                        {share_root}
                        ?address=
                        {props.blog_address}
                        {R.xNil(props.blog_selected_dir)
                          ? `&list=${props.blog_selected_dir}`
                          : ""}
                        &article=
                        {props.blog_selected_article}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Flex>
          {props.blog_mine !== true ? null : (
            <Flex width={1}>
              <Box
                flex={1}
                textAlign="center"
                onClick={() => {
                  const body = serialize(props.blog_editor_value)
                  props.set(body, "blog_new_body")
                  props.postBlog({
                    title: props.blog_new_title,
                    body: body
                  })
                }}
                sx={{ ...btn }}
                p={2}
                bg="teal"
                color="white"
                id="blog_btn_save"
              >
                SAVE
              </Box>
              <Box
                flex={1}
                textAlign="center"
                onClick={() => {
                  props.set("full_preview", "tab")
                }}
                sx={{ ...btn }}
                p={2}
                bg="#198643"
                color="white"
                id="blog_btn_save"
              >
                FULL PREVIEW
              </Box>
              <Box
                flex={1}
                textAlign="center"
                onClick={() => {
                  if (confirm("Are you sure?")) {
                    props.blogDeleteArticle({
                      id: props.blog_selected_article
                    })
                  }
                }}
                sx={{ ...btn }}
                p={2}
                bg="#CB3837"
                color="white"
                id="blog_btn_delete"
              >
                DELETE
              </Box>
              <Box
                flex={1}
                textAlign="center"
                onClick={() => {
                  props.set(null, "blog_selected_article")
                }}
                sx={{ ...btn }}
                p={2}
                bg="#BF731C"
                color="white"
                id="blog_btn_delete"
              >
                BACK
              </Box>
            </Flex>
          )}
        </React.Fragment>
      )
    }
    return (
      <ThemeProvider theme={preset}>
        <Nav
          side_width={200}
          TMENU={tmenu}
          SMENU={smenu}
          pre_title="BLOG"
          post_title="v0.3"
          side_selected={R.xNil(props.blog_selected_article) ? null : props.tab}
          side_border_color="#008080"
          outerElms={["nav", "footer"]}
          side_width={225}
          side_text_color="#03414D"
          size="sx"
          side_selected_color="#008080"
          pre_title_color="rgb(240, 236, 212)"
          fontSize="18px"
          bg_side="#72DFD0"
          regular_border="#008080"
          selected_border="#3A7CEC"
          bg_top="#03414D"
          title_logo="/static/images/icon-128x128.png"
        >
          <Box sx={{ position: "relative" }}>
            <GithubMarkdown />
            <Dracula />
            {main}
            {props.blog_loading ? (
              <Flex
                fontSize="25px"
                justifyContent="center"
                alignItems="center"
                bg="#000"
                width={1}
                height="100%"
                sx={{
                  opacity: 0.5,
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
                color="white"
              >
                <Box as="i" className="fa fa-spin fa-sync" mr={2} />
                Loading...
              </Flex>
            ) : null}
            {R.xNil(props.blog_note) ? (
              <Box
                px={3}
                py={2}
                bg={props.blog_note.bg || "teal"}
                title="click to close"
                sx={{
                  ...btn,
                  position: "absolute",
                  right: "20px",
                  bottom: R.xNil(props.blog_selected_article) ? "50px" : "20px",
                  borderRadius: "3px"
                }}
                color="white"
                onClick={() => {
                  props.set(null, "blog_note")
                }}
              >
                {props.blog_note.text}
              </Box>
            ) : null}
          </Box>
          {footer}
        </Nav>
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
    "blog_dirs",
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
    "blog_updated",
    "blog_editor_value",
    "tab",
    "subtab",
    "height",
    "blog_setValue",
    "blog_editor",
    "blog_selected_dir",
    "blog_3box_status",
    "blog_edit_list_name",
    "blog_edit_list_name_value",
    "blog_note",
    "blog_loading",
    "url"
  ],
  [
    "blogChangeListTitle",
    "blogDeleteList",
    "blogSwitchModes",
    "blogSwitchAccess",
    "blogLoadArticle",
    "blogLoadDir",
    "blogDeleteArticle",
    "createArticle",
    "createArticleList",
    "tracker",
    "connectAuthereum",
    "disconnectAuthereum",
    "hookWeb3",
    "postBlog",
    "set",
    "merge",
    "switchWallet",
    "blogLoadHistory",
    "checkHeight",
    "connect_to_3box_public",
    "getURL"
  ]
)
