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
import React, { Fragment, useEffect, useMemo, useState } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import Status from "../../../components/Status"
import SelectWallet from "../../../components/SelectWallet"
import Login from "../../../components/Login"
import UPort from "../../../components/UPort"
import Footer from "../../components/Footer"
import conf from "../../conf"
const entities = require("entities")
import { connect_to_3box } from "../../../lib/_epic/blog"
import {
  autoCheckUniswap,
  checkUniswapAllowance
} from "../../../lib/_epic/uniswap"
let _topics = {
  etc: { id: "etc", title: "ETC" },
  warashibe: { id: "warashibe", title: "WARASHIBE" }
}

import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"
import hljs from "highlight.js"
import cheerio from "cheerio"
import Dracula from "../../lib/css/Dracula"
import GithubMarkdown from "../../lib/css/GithubMarkdown"

import { Node } from "slate"
const serialize = nodes => nodes.map(n => Node.string(n)).join("\n")

const txt = {
  experimental: {
    en: "IPFS Blog is highly experimental at this moment.",
    ja: "IPFSブログは実験的機能で正常動作は保証できません。"
  },
  confirm_deletion: {
    en:
      "Do you really want to delete from Warashibe? It won't be deleted from IPFS.",
    ja: "和らしべから削除してよろしいですか？IPFSからは削除されません。"
  },
  save_draft: {
    en: "Save Draft",
    ja: "下書き保存"
  },
  delete: {
    en: "Delete",
    ja: "削除"
  },
  back: {
    en: "Back",
    ja: "戻る"
  },
  save: {
    en: "Save",
    ja: "保存"
  },
  post: {
    en: "Post",
    ja: "投稿"
  },
  article_url: {
    en: "Article URL",
    ja: "記事URL"
  },
  choose_topic: {
    en:
      "2. Choose a topic. The available topics may change based upon your permissions.",
    ja:
      "2. 投稿カテゴリーを選択してください。アカウントの権限によって投稿可能なカテゴリーが変わります。"
  },
  choose_cover: {
    en: "1. Select a cover image for sharing.",
    ja:
      "1. カバー画像を選択して下さい。記事一覧表示やツイッター等でシェアされるときに使われます。"
  },
  need_login_to_save: {
    en: "You need to be logged in to save.",
    ja: "記事を保存するにはログインしてください。"
  },
  need_login_to_post: {
    en: "You need to be logged in to post.",
    ja: "記事を投稿するにはログインしてください。"
  },
  history: { en: "History", ja: "編集履歴" },
  preview: { en: "Preview", ja: "プレビュー" },
  full_preview: { en: "Full Preview", ja: "フルプレビュー" },
  toc: { en: "Table of Content", ja: "目次" },
  public: { en: "Public", ja: "公開記事" },
  private: { en: "Private", ja: "公開記事" },
  create_list: { en: "Create List", ja: "リスト作成" },
  select_list: { en: "Select List", ja: "リスト選択" },
  delete_list: { en: "Delete List", ja: "リスト削除" },
  create_article: { en: "Create Article", ja: "記事作成" },
  select_article: { en: "Select Article", ja: "記事選択" },
  unsorted: { en: "Unsorted", ja: "未分類" },
  article_title: { en: "Title", ja: "記事タイトル" },
  list_url: { en: "List URL", ja: "公開リストのURL" },
  back_to_edit: { en: "Back to Edit", ja: "編集に戻る" },
  back_to_list: { en: "Back to List", ja: "記事一覧に戻る" },
  exp_private: {
    en:
      "No one in the world can view your private data but you. Not even the platform owners. It's encrypted and saved onto IPFS where only you can access with your private key.",
    ja:
      "非公開に設定されている記事は暗号化されてIPFSに分散保存され、秘密鍵を持つ貴方以外誰も閲覧することはできません。プラットフォーム運営にも閲覧不可能な記事が個人に帰属するWEB3的保存方法です。"
  },
  error: {
    en: "Something went wrong. Try again in a few minutes.",
    ja: "エラーが発生しました。リロードしてもう一度お試し下さい。"
  },
  connecting_ipfs: {
    en: "connecting to 3Box ...",
    ja: "IPFSに接続中 ..."
  },
  connecting_space: {
    en: "connecting to a space ...",
    ja: "保存領域に接続中 ..."
  },
  finalizing: {
    en: "connecting to a space ...",
    ja: "finishing up ..."
  },
  exp_loading: {
    en:
      "Your account is in the process of syncing with 3box. It takes some time to get recognized if your account is new. Come back in 30 mins or try reloading the page if it gets stuck.",
    ja:
      "IPFSの仕組み上、接続に多少時間がかかります。途中で長時間詰まってしまう場合、新規アドレスが認識されていない可能性等が考えられます。お手数ですが数分待っても接続が完了しない場合、リロードするか３０分後にもう一度お試しください。"
  }
}

const t = (t, lang = "en") =>
  R.isNil(txt[t]) ? "" : txt[t][lang] || txt[t].en || ""

const T = binder(
  props => {
    return <Box as="span">{t(props.t, props.lang)}</Box>
  },
  ["lang"],
  []
)

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

import Editor from "../../../components/Editor"

const marked = require("marked")
import Preview from "../../../components/Preview"
const Info = () => (
  <Flex flexWrap="wrap" width={1}>
    <Box lineHeight="150%" p={4} width={1}>
      <Box mb={2} color="#232538">
        [Breaking Changes] You can access your articles written on the previous
        version at
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

const SpaceBtn = props => {
  const blogger_address = props.router.query.address
  const blog_access = props.blog_posted
    ? props.blog_posted_access
    : props.blog_access

  return (
    <Flex width={1}>
      <Box
        flex={1}
        textAlign="center"
        onClick={() => {
          if (props.blog_posted) {
            props.getMyArticles({
              topics: _topics,
              user: props.user,
              published: true
            })
          } else if (props.blog_3box_status === 3) {
            props.blogSwitchAccess({
              access: "public",
              blogger_address: blogger_address
            })
          }
        }}
        sx={{ ...btn }}
        p={2}
        bg={blog_access === "public" ? "teal" : "#666"}
        color="white"
      >
        <T t="public" />
      </Box>
      <Box
        flex={1}
        textAlign="center"
        bg={blog_access === "private" ? "teal" : "#666"}
        onClick={() => {
          if (props.blog_posted) {
            props.getMyArticles({
              topics: _topics,
              user: props.user,
              published: false
            })
          } else if (props.blog_3box_status === 3) {
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
        <T t="private" />
      </Box>
    </Flex>
  )
}

const All = props => {
  const blogger_address = props.router.query.address
  const share_root = R.xNil(props.url)
    ? props.url.protocol + "//" + props.url.host + props.url.pathname
    : conf.blog.root
  const blog_articles =
    (props.tab === "ipfs"
      ? props.blog_articles
      : R.filter(v => {
          return (
            (v.unsorted ? null : v.topic || null) ===
              props.blog_posted_selected_dir || null
          )
        })(props.blog_posted_articles)) || []
  const blog_selected_dir = props.blog_posted
    ? props.blog_posted_selected_dir
    : props.blog_selected_dir
  const blog_access = props.blog_posted
    ? props.blog_posted_access
    : props.blog_access

  return (
    <Fragment>
      <Box p={3} width={[1, null, 0.5]}>
        {props.tab === "ipfs" && props.blog_3box_status < 0 ? (
          <Flex
            color="#CB3837"
            p={4}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
          >
            <Box as="i" className="fa fa-exclamation" mr={2} />
            <T t="error" />
          </Flex>
        ) : props.tab === "ipfs" && props.blog_3box_status !== 3 ? (
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
                t("connecting_ipfs", props.lang),
                t("connecting_space", props.lang),
                t("finalizing", props.lang)
              ][props.blog_3box_status]
            }
          </Flex>
        ) : (
          <React.Fragment>
            {props.blog_mine === true || props.blog_posted === true ? (
              <Box
                textAlign="center"
                onClick={() => {
                  if (props.blog_posted) {
                    props.createArticleListFB({ user: props.user })
                  } else {
                    props.createArticleList()
                  }
                }}
                sx={{ ...btn }}
                p={2}
                bg="teal"
                color="white"
              >
                <T t="create_list" />
              </Box>
            ) : (
              <Box textAlign="center" p={2} bg="teal" color="white">
                <T t="select_list" />
              </Box>
            )}
            <Box as="table" width={1} key={`articles_${props.blog_updated}`}>
              <Box as="tbody">
                {R.addIndex(R.map)((v, i) => {
                  return (
                    <Box
                      key={`dir_${v.id}`}
                      color={blog_selected_dir === v.id ? "white" : "#333"}
                      bg={
                        blog_selected_dir === v.id
                          ? "#232538"
                          : i % 2 === 0
                            ? "#eee"
                            : "#ddd"
                      }
                      as="tr"
                      onClick={() => {
                        if (v.id === null || v.id !== props.blog_edit_list_name)
                          if (props.blog_posted) {
                            props.set(v.id, "blog_posted_selected_dir")
                          } else {
                            props.blogLoadDir({
                              id: v.id,
                              thread_address: v.address
                            })
                          }
                      }}
                      sx={{ ...btn }}
                      mt={3}
                    >
                      <Box as="td" p={2}>
                        {v.id != null && v.id === props.blog_edit_list_name ? (
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
                      {props.blog_posted === false &&
                      props.blog_mine === false ? null : (props.blog_posted ||
                        props.blog_mine === true) &&
                      R.xNil(v.id) &&
                      v.predefined !== true ? (
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
                                if (props.blog_posted) {
                                  props.blogChangeListTitleFB({
                                    user: props.user,
                                    id: v.id,
                                    title: props.blog_edit_list_name_value
                                  })
                                } else {
                                  props.blogChangeListTitle({
                                    id: v.id,
                                    title: props.blog_edit_list_name_value
                                  })
                                }
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
                        title: t("unsorted", props.lang),
                        id: null,
                        date: null,
                        address: null
                      }
                    ],
                    (props.blog_posted
                      ? props.blog_posted_dirs
                      : props.blog_dirs) || []
                  )
                )}
              </Box>
            </Box>
            {props.blog_mine !== true || props.blog_posted ? null : (
              <React.Fragment>
                {blog_access === "private" ? (
                  <Box
                    mt={3}
                    p={3}
                    lineHeight="150%"
                    bg="#BF731C"
                    color="white"
                    sx={{ borderRadius: "3px" }}
                  >
                    <T t="exp_private" />
                  </Box>
                ) : props.blog_posted ? null : (
                  <Box mt={3} lineHeight="150%">
                    <Box mb={2} color="#232538">
                      <T t="list_url" />
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
                        R.xNil(blog_selected_dir)
                          ? `&list=${blog_selected_dir}`
                          : ""
                      }`}
                    >
                      <Box color="white" sx={{ textDecoration: "none" }}>
                        {share_root}
                        ?address=
                        {props.blog_address}
                        {R.xNil(blog_selected_dir)
                          ? `&list=${blog_selected_dir}`
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
        {props.tab === "ipfs" && props.blog_ready === false ? (
          <Box
            p={3}
            color="white"
            bg="#BF731C"
            sx={{ borderRadius: "3px" }}
            lineHeight="150%"
          >
            <T t="exp_loading" />
          </Box>
        ) : props.blog_mine === true || props.tab === "default" ? (
          <Box
            textAlign="center"
            onClick={() => {
              if (props.blog_posted) {
                props.createBlankArticle()
              } else {
                props.createArticle()
              }
            }}
            sx={{ ...btn }}
            p={2}
            bg="teal"
            color="white"
          >
            <T t="create_article" />
          </Box>
        ) : (
          <Box textAlign="center" p={2} bg="teal" color="white">
            <T t="select_article" />
          </Box>
        )}
        {props.blog_posted !== true &&
        props.blog_ready === true &&
        props.blog_mine &&
        blog_selected_dir !== null &&
        blog_articles.length === 0 ? (
          <Box
            textAlign="center"
            onClick={() => {
              if (confirm("Are you sure?")) {
                props.blogDeleteList({ id: blog_selected_dir })
              }
            }}
            sx={{ ...btn }}
            p={2}
            bg="#CB3837"
            color="white"
          >
            <T t="delete_list" />
          </Box>
        ) : (
          <Box as="table" width={1} key={`articles_${props.blog_updated}`}>
            <Box as="tbody">
              {R.addIndex(R.map)((v, i) => {
                return (
                  <Box
                    key={`article_${v.id}`}
                    color={
                      props.blog_selected_article === v.id ? "white" : "#333"
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
                      if (props.tab === "default") {
                        props.loadPostedArticle({ id: v.id })
                      } else {
                        props.blogLoadArticle({
                          id: v.id,
                          thread_address: v.address
                        })
                      }
                    }}
                    sx={{ ...btn }}
                    mt={3}
                  >
                    <Box as="td" p={2}>
                      {v.title || v.id}
                    </Box>
                  </Box>
                )
              })(blog_articles)}
            </Box>
          </Box>
        )}
      </Box>
    </Fragment>
  )
}
const Loading = props => (
  <Flex
    bg="#A0F6D2"
    height="100%"
    width="100%"
    color="#378F3A"
    fontSize="20px"
    justifyContent="center"
    alignItems="center"
    flex={1}
  >
    <Flex height="100%" justifyContent="center" alignItems="center">
      <style jsx>{`
        .loader,
        .loader:before,
        .loader:after {
          background: ${props.color || "#11803e"};
          -webkit-animation: load1 1s infinite ease-in-out;
          animation: load1 1s infinite ease-in-out;
          width: 1em;
          height: 4em;
        }
        .loader {
          color: ${props.color || "#11803e"};
          text-indent: -9999em;
          margin: 88px auto;
          position: relative;
          font-size: 11px;
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation-delay: -0.16s;
          animation-delay: -0.16s;
        }
        .loader:before,
        .loader:after {
          position: absolute;
          top: 0;
          content: "";
        }
        .loader:before {
          left: -1.5em;
          -webkit-animation-delay: -0.32s;
          animation-delay: -0.32s;
        }
        .loader:after {
          left: 1.5em;
        }
        @-webkit-keyframes load1 {
          0%,
          80%,
          100% {
            box-shadow: 0 0;
            height: 4em;
          }
          40% {
            box-shadow: 0 -2em;
            height: 5em;
          }
        }
        @keyframes load1 {
          0%,
          80%,
          100% {
            box-shadow: 0 0;
            height: 4em;
          }
          40% {
            box-shadow: 0 -2em;
            height: 5em;
          }
        }
      `}</style>
      <div className="loader">Loading...</div>
    </Flex>
  </Flex>
)
const _showSpaceBtn = props =>
  (props.tab === "default" && R.xNil(props.user)) ||
  (props.tab === "ipfs" && props.blog_mine === true)
const SingleBtn = binder(
  props => {
    return (
      <Flex
        width={1}
        fontSize="20px"
        justifyContent="center"
        alignItems="center"
        color="#03414D"
        bg="#A0F6D2"
      >
        <Flex justifyContent="center" alignItems="center">
          <Box>
            <Flex
              bg="#03414D"
              color="white"
              px={4}
              fontWeight="bold"
              py={3}
              onClick={() => {
                props.hookWeb3({ _network: "1" })
              }}
              sx={{
                borderRadius: "5px",
                ":hover": { opacity: 0.75 },
                cursor: "pointer"
              }}
              alignItems="center"
              justifyContent="center"
            >
              <Box>Connect Wallet</Box>
            </Flex>
            <Box mt={3} fontSize="14px">
              <T t="experimental" />
            </Box>
          </Box>
        </Flex>
      </Flex>
    )
  },
  [],
  ["hookWeb3"]
)
const Articles = props => {
  const uport_qr = R.xNil(props.uport) ? <UPort /> : null
  return (
    <Fragment>
      {props.tab === "default" && props.user_init === false ? (
        <Loading color="#03414D" />
      ) : props.tab === "default" && R.isNil(props.user) ? (
        R.xNil(uport_qr) ? (
          uport_qr
        ) : (
          <Login />
        )
      ) : props.tab === "ipfs" && props.web3_init === false ? (
        <SingleBtn />
      ) : (
        <Box width={1} flex={1}>
          {props.tab === "ipfs" && props.web3_init ? (
            <Status _network="1" />
          ) : null}
          {_showSpaceBtn(props) ? <SpaceBtn {...props} /> : null}
          <Flex width={1} flexWrap="wrap">
            <All {...props} />
          </Flex>
        </Box>
      )}
    </Fragment>
  )
}
const FullPreview = props => {
  const blogger_address = props.router.query.address
  const blog_articles =
    (props.tab === "ipfs"
      ? props.blog_articles
      : R.filter(v => {
          return (v.topic || null) === props.blog_posted_selected_dir
        })(props.blog_posted_articles)) || []
  const blog_selected_dir = props.blog_posted
    ? props.blog_posted_selected_dir
    : props.blog_selected_dir
  const blog_access = props.blog_posted
    ? props.blog_posted_access
    : props.blog_access
  return (
    <React.Fragment>
      <GithubMarkdown />
      <Dracula />
      <Flex color="#333" sx={{ minHeight: props.innerHeight }}>
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
              __html: props.__html
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
              })(props.content_table)}
            </Box>
          </Box>
        </Box>
      </Flex>

      {props.blog_mine === true || props.blog_posted ? (
        <Box
          flex={1}
          textAlign="center"
          onClick={() => {
            props.set(props.blog_posted ? "default" : "ipfs", "tab")
          }}
          sx={{ ...btn }}
          p={2}
          bg="#BF731C"
          color="white"
          id="blog_btn_save"
        >
          <T t="back_to_edit" />
        </Box>
      ) : (
        <Box
          flex={1}
          textAlign="center"
          onClick={() => {
            props.set(
              {
                tab: props.blog_posted ? "default" : "ipfs",
                blog_selected_article: null
              },
              null
            )
            if (props.blog_mine === false) {
              let url = `${props.router.pathname}?address=${blogger_address}`
              if (R.xNil(blog_selected_dir)) {
                url += `&list=${blog_selected_dir}`
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
          <T t="back_to_list" />
        </Box>
      )}
    </React.Fragment>
  )
}
const showdown = require("showdown")
const converter = new showdown.Converter()
const Edit = props => {
  const blogger_address = props.router.query.address
  const share_root = R.xNil(props.url)
    ? props.url.protocol + "//" + props.url.host + props.url.pathname
    : conf.blog.root
  const blog_articles =
    (props.tab === "ipfs"
      ? props.blog_default
      : R.filter(v => {
          return (v.topic || null) === props.blog_posted_selected_dir
        })(props.blog_posted_articles)) || []
  const blog_selected_dir = props.blog_posted
    ? props.blog_posted_selected_dir
    : props.blog_selected_dir
  const blog_access = props.blog_posted
    ? props.blog_posted_access
    : props.blog_access

  let covers = []
  if (props.blog_mode === "post") {
    const $ = cheerio.load(converter.makeHtml(props.blog_new_body || ""))
    $("img").each(function() {
      covers.push($(this).attr("src"))
    })
  }
  covers = R.uniq(covers)
  const title = (
    <Input
      id="blog_title"
      sx={{ border: "1px solid #999", borderRadius: 0 }}
      placeholder={t("article_title", props.lang)}
      defaultValue={props.blog_new_title}
      value={
        R.xNil(props.blog_new_title_lock) ? props.blog_new_title_lock : null
      }
      onClick={e => {
        props.set(null, "blog_new_title_lock")
      }}
      onChange={e => {
        props.set(null, "blog_new_title_lock")
        props.set(e.target.value, "blog_new_title")
      }}
    />
  )
  let topics = props.blog_posted ? props.blog_posted_dirs : props.blog_dirs
  let subtabs = [
    { key: "default", name: t("preview", props.lang) },
    { key: "toc", name: t("toc", props.lang) }
  ]
  if (!props.blog_posted) {
    subtabs.push({ key: "history", name: t("history", props.lang) })
  }
  return (
    <React.Fragment>
      <Flex flexWrap="wrap">
        <Box width={[1, null, 0.5]} sx={{ borderLeft: "1px solid #ddd" }}>
          {props.tab === "ipfs" &&
          R.isNil(props.blog_thread) ? null : props.blog_mode === "post" ? (
            <React.Fragment>
              {title}
              <Box p={3} sx={{ minHeight: props.innerHeight }}>
                <Box fontSize="12px" lineHeight="150%" color="#232538">
                  <T t="choose_cover" />
                </Box>
                {R.map(v => {
                  return (
                    <Box
                      display="inline-block"
                      width="100px"
                      height="100px"
                      bg="#198643"
                      mx={2}
                      my={3}
                      onClick={() => {
                        props.set(v, "blog_cover")
                      }}
                      sx={{
                        ...btn,
                        opacity: props.blog_cover === v ? 1 : 0.75,
                        border:
                          props.blog_cover === v
                            ? "3px solid #198643"
                            : "3px solid #999",
                        backgroundImage: `url(${v})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    />
                  )
                })(covers)}
                <Box as="hr" />
                <Box my={3} fontSize="12px" lineHeight="150%" color="#232538">
                  <T t="choose_topic" />
                </Box>
                <Select
                  value={props.blog_topic}
                  onChange={e => {
                    props.set(e.target.value, "blog_topic")
                  }}
                >
                  {R.map(v => {
                    const selected =
                      props.blog_topic === v.key ? "selected" : ""
                    return (
                      <option value={v.id} selected={selected}>
                        {v.title}
                      </option>
                    )
                  })(props.blog_posted_dirs)}
                </Select>
                {R.isNil(props.blog_article) ||
                props.blog_article.published === false ? null : (
                  <React.Fragment>
                    <Box as="hr" />
                    <Box
                      my={3}
                      fontSize="12px"
                      lineHeight="150%"
                      color="#232538"
                    >
                      <T t="article_url" />
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
                      fontSize="14px"
                      as="a"
                      target="_blank"
                      href={`https://blog.warashibe.market/articles/${
                        props.blog_selected_article
                      }`}
                    >
                      <Box color="white" sx={{ textDecoration: "none" }}>
                        https://blog.warashibe.market/articles/
                        {props.blog_selected_article}
                      </Box>
                    </Box>
                  </React.Fragment>
                )}
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {title}
              <Box height={props.innerHeight} sx={{ overflow: "auto" }} p={3}>
                <Editor
                  editor_style={{ height: "100%" }}
                  key={`editor-${props.blog_history_cursor}-${
                    props.blog_updated
                  }`}
                  init_value={props.blog_editor_value}
                />
              </Box>
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
                  width={1 / subtabs.length}
                  bg={bg}
                  color="white"
                  p={2}
                  sx={{ ...btn }}
                  onClick={() => props.set(v.key, "subtab")}
                >
                  {v.name}
                </Box>
              )
            })(subtabs)}
          </Flex>
          {props.subtab === "default" ? (
            <Preview
              set={props.set}
              setValue={props.blog_setValue}
              mounted={props.mounted}
              value={props.blog_editor_value}
              height={props.innerHeight}
            />
          ) : props.subtab === "history" ? (
            <Box p={3} height={props.innerHeight} sx={{ overflow: "auto" }}>
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
                      {moment(v.timestamp * 1000).format("YYYY MM/DD HH:mm:ss")}
                    </Flex>
                  </Flex>
                )
              })(R.reverse(props.blog_post_history))}
            </Box>
          ) : (
            <Box p={3} height={props.innerHeight} sx={{ overflow: "auto" }}>
              <Box color="teal" fontWeight="bold" mb={2}>
                <T t="toc" />
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
                })(props.content_table)}
              </Box>
              {props.blog_posted ? null : (
                <Box mt={3} lineHeight="150%">
                  <Box mb={2} color="#232538">
                    <T t="article_url" />
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
                      R.xNil(blog_selected_dir)
                        ? `&list=${blog_selected_dir}`
                        : ""
                    }&article=${props.blog_selected_article}`}
                  >
                    <Box color="white" sx={{ textDecoration: "none" }}>
                      {share_root}
                      ?address=
                      {props.blog_address}
                      {R.xNil(blog_selected_dir)
                        ? `&list=${blog_selected_dir}`
                        : ""}
                      &article=
                      {props.blog_selected_article}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Flex>
      {props.blog_mine !== true &&
      props.tab !== "default" ? null : props.blog_mode === "post" ? (
        <Flex width={1}>
          <Box
            flex={1}
            textAlign="center"
            onClick={() => {
              if (R.xNil(props.user)) {
                props.postToWarashibe({
                  topic: props.blog_topic,
                  id: props.blog_selected_article,
                  user: props.user,
                  cover: props.blog_cover,
                  title: props.blog_new_title,
                  body: serialize(props.blog_editor_value)
                })
              } else {
                alert(t("need_login_to_post", props.lang))
              }
            }}
            sx={{ ...btn }}
            p={2}
            bg="#232538"
            color="white"
            id="blog_btn_save"
          >
            <T t="post" />
          </Box>
          <Box
            flex={1}
            textAlign="center"
            onClick={() => {
              if (R.xNil(props.user)) {
                props.postToWarashibe({
                  topic: props.blog_topic,
                  id: props.blog_selected_article,
                  user: props.user,
                  cover: props.blog_cover,
                  title: props.blog_new_title,
                  body: serialize(props.blog_editor_value),
                  published: false
                })
              } else {
                alert(t("need_login_to_save", props.lang))
              }
            }}
            sx={{ ...btn }}
            p={2}
            bg="teal"
            color="white"
            id="blog_btn_save"
          >
            <T t="save_draft" />
          </Box>

          {R.isNil(props.blog_article) ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                if (confirm(<T t="confirm_deletion" />)) {
                  props.deleteFromWarashibe({
                    id: props.blog_selected_article
                  })
                }
              }}
              sx={{ ...btn }}
              p={2}
              bg="#CB3837"
              color="white"
            >
              <T t="delete" />
            </Box>
          )}
          <Box
            flex={1}
            textAlign="center"
            onClick={() => {
              props.blogSwitchModes({
                mode: "preview"
              })
            }}
            sx={{ ...btn }}
            p={2}
            bg="#BF731C"
            color="white"
          >
            <T t="back" />
          </Box>
        </Flex>
      ) : props.blog_mine !== true && props.tab !== "default" ? null : (
        <Flex width={1}>
          {R.isNil(props.user) ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                props.getArticle({
                  id: props.blog_selected_article
                })
                props.blogSwitchModes({
                  mode: "post"
                })
              }}
              sx={{ ...btn }}
              p={2}
              bg="#232538"
              color="white"
            >
              <T t="post" />
            </Box>
          )}
          {props.blog_posted ? null : (
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
              <T t="save" />
            </Box>
          )}
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
            <T t="full_preview" />
          </Box>
          {props.blog_posted ? null : (
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
              <T t="delete" />
            </Box>
          )}
          <Box
            flex={1}
            textAlign="center"
            onClick={() => {
              if (props.tab === "default") {
                props.getMyArticles({
                  topics: _topics,
                  nochange: true,
                  user: props.user,
                  published:
                    props.blog_posted_access === "public" ? true : false
                })
              }
              props.set(null, "blog_selected_article")
            }}
            sx={{ ...btn }}
            p={2}
            bg="#BF731C"
            color="white"
            id="blog_btn_delete"
          >
            <T t="back" />
          </Box>
        </Flex>
      )}
    </React.Fragment>
  )
}
const parseContent = props => {
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
  return { __html, content_table }
}
export default binder(
  props => {
    const blogger_address = props.router.query.address
    const blogger_list_id = props.router.query.list
    const blogger_article_id = props.router.query.article
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
      props.set(props.router, "router")
      setMounted(true)
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
            articles: {
              any: ["user"],
              func: ({ state$ }) => {
                if (R.xNil(state$.value.user)) {
                  props.getMyArticles({
                    user: state$.value.user,
                    topics: _topics
                  })
                }
              },
              args: {}
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
        }
        props.changeUser()
      })
    }, [])
    let { __html, content_table } = parseContent(props)

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
    } else if (R.xNil(props.address_in_use) && props.blog_mine === false) {
      tmenu.push({
        index: 1,
        text: blogger_address,
        key: "address",
        awesome_icon: "fas fa-newspaper"
      })
    }
    if (R.xNil(props.user)) {
      tmenu.push({
        index: 2,
        text: `Logout`,
        key: `logout`,
        awesome_icon: "fas fa-sign-out-alt",
        onClick: () => {
          props.logout()
        }
      })
    }
    let smenu = [
      {
        text: "Articles",
        key: "default",
        icon: "/static/images/icon-128x128.png",
        onClick: () => () => {
          props.set(null, "blog_selected_article")
          props.set(true, "blog_posted")
          props.getMyArticles({ user: props.user, topics: _topics })
          props.set("default", "tab")
        }
      },
      {
        text: "IPFS Blog",
        key: "ipfs",
        icon: "/static/images/ipfs.png",
        onClick: props => () => {
          props.set(null, "blog_selected_article")
          props.set(false, "blog_posted")
          props.set("ipfs", "tab")
        }
      }
    ]
    smenu.push({
      text: "Info",
      key: "info",
      awesome_icon: "fas fa-info",
      onClick: props => () => {
        props.set("info", "tab")
      }
    })
    smenu[smenu.length - 1].border = true
    smenu = R.concat(smenu, SMENU)

    let outerElms = ["nav", "footer"]
    let nofooter = false
    let main = null
    if (props.tab === "info") {
      main = <Info />
    } else if (
      R.includes(props.tab)(["default", "ipfs"]) &&
      R.isNil(props.blog_selected_article)
    ) {
      main = <Articles {...props} />
    } else if (
      props.tab === "full_preview" ||
      (props.blog_mine !== true && props.tab !== "default")
    ) {
      outerElms = ["nav", "blog_btn_save"]
      nofooter = true
      main = (
        <Box width={1}>
          <FullPreview
            {...props}
            __html={__html}
            content_table={content_table}
          />
        </Box>
      )
    } else {
      nofooter = true
      outerElms = ["nav", "blog_title", "blog_btn_save"]
      main = (
        <Box width={1}>
          <Edit {...props} mounted={mounted} content_table={content_table} />
        </Box>
      )
    }
    return (
      <ThemeProvider theme={preset}>
        <Nav
          updated={props.tab}
          outerElms={outerElms}
          side_width={200}
          TMENU={tmenu}
          SMENU={smenu}
          pre_title="BLOG"
          post_title="v0.3"
          side_selected={R.xNil(props.blog_selected_article) ? null : props.tab}
          side_border_color="#008080"
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
          <Flex flex={1} width={1} flexWrap="wrap">
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
                  position: "fixed",
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
          </Flex>
          {nofooter ? null : <Footer />}
        </Nav>
      </ThemeProvider>
    )
  },
  [
    "user_init",
    "user",
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
    "blog_pmode",
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
    "url",
    "innerHeight",
    "uport",

    "blog_posted",
    "blog_cover",
    "blog_posted_selected_dir",
    "blog_articles",
    "blog_posted_articles",
    "blog_posted_dirs",
    "blog_article",
    "blog_topic",
    "blog_posted_access",

    "web3_init",
    "lang"
  ],
  [
    "blogChangeListTitleFB",
    "blogChangeListTitle",
    "blogDeleteList",
    "blogSwitchModes",
    "blogSwitchAccess",
    "blogLoadArticle",
    "blogLoadDir",
    "blogDeleteArticle",
    "createArticle",
    "createArticleList",
    "createArticleListFB",
    "tracker",
    "connectAuthereum",
    "disconnectAuthereum",
    "hookWeb3",
    "postBlog",
    "set",
    "merge",
    "switchWallet",
    "blogLoadHistory",
    "connect_to_3box_public",
    "getURL",
    "changeUser",
    "logout",

    "getMyArticles",
    "createBlankArticle",
    "loadPostedArticle",
    "deleteFromWarashibe",
    "postToWarashibe",
    "getArticle"
  ]
)
