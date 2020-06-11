import { Box, Flex, Text, Image, Button } from "rebass"

import useEventListener from "@use-it/event-listener"
import moment from "moment"
import { ThemeProvider } from "emotion-theming"
import preset from "@rebass/preset"
import bind from "nd/bind"

import React, { Fragment, useEffect, useMemo, useState } from "react"
import R from "ramdam"
const btn = { cursor: "pointer", ":hover": { opacity: 0.75 } }
import { SMENU } from "../../lib/const"
import Status from "nd/web3/Status"
import Login from "nd/account/Login"
import UPort from "nd/account/UPort"
import Nav from "nd/nav/Nav"

import { isFirebase } from "@nextdapp/firebase"
import conf from "nd/conf"
const entities = require("entities")

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

const T = bind(
  props => {
    return <Box as="span">{t(props.t, props.lang$util)}</Box>
  },
  ["lang$util"],
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

import Editor from "nd/editor/Editor"

const marked = require("marked")

import Preview from "nd/editor/Preview"

const SpaceBtn = props => {
  const blogger_address = props.router.query.address
  const blog_access = props.blog_posted$blog
    ? props.blog_posted_access$blog
    : props.blog_access$blog

  return (
    <Flex width={1}>
      <Box
        flex={1}
        textAlign="center"
        onClick={() => {
          if (props.blog_posted$blog) {
            props.getMyArticles$blog({
              topics: _topics,
              user: props.user$account,
              published: true
            })
          } else if (props.blog_3box_status$blog === 3) {
            props.blogSwitchAccess$blog({
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
          if (props.blog_posted$blog) {
            props.getMyArticles$blog({
              topics: _topics,
              user: props.user$account,
              published: false
            })
          } else if (props.blog_3box_status$blog === 3) {
            props.blogSwitchAccess$blog({
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
  const share_root = R.xNil(props.url$util)
    ? props.url$util.protocol +
      "//" +
      props.url$util.host +
      props.url$util.pathname
    : conf.blog.root
  const blog_articles =
    (props.tab$util === "ipfs"
      ? props.blog_articles$blog
      : R.filter(v => {
          return (
            (v.unsorted ? null : v.topic || null) ===
              props.blog_posted_selected_dir$blog || null
          )
        })(props.blog_posted_articles$blog)) || []
  const blog_selected_dir = props.blog_posted$blog
    ? props.blog_posted_selected_dir$blog
    : props.blog_selected_dir$blog
  const blog_access = props.blog_posted$blog
    ? props.blog_posted_access$blog
    : props.blog_access$blog

  return (
    <Fragment>
      <Box p={3} width={[1, null, 0.5]}>
        {props.tab$util === "ipfs" && props.blog_3box_status$blog < 0 ? (
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
        ) : props.tab$util === "ipfs" && props.blog_3box_status$blog !== 3 ? (
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
                  color={props.blog_3box_status$blog >= v ? "teal" : "#999"}
                  m={3}
                />
              ))([0, 1, 2])}
            </Flex>
            <Box as="i" className="fa fa-spin fa-sync" mr={2} />
            {
              [
                t("connecting_ipfs", props.lang$util),
                t("connecting_space", props.lang$util),
                t("finalizing", props.lang$util)
              ][props.blog_3box_status$blog]
            }
          </Flex>
        ) : (
          <React.Fragment>
            {props.blog_mine$blog === true ||
            props.blog_posted$blog === true ? (
              <Box
                textAlign="center"
                onClick={() => {
                  if (props.blog_posted$blog) {
                    props.createArticleListFB$blog({ user: props.user$account })
                  } else {
                    props.createArticleList$blog()
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
            <Box
              as="table"
              width={1}
              key={`articles_${props.blog_updated$blog}`}
            >
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
                        if (
                          v.id === null ||
                          v.id !== props.blog_edit_list_name$blog
                        )
                          if (props.blog_posted$blog) {
                            props.set(v.id, "blog_posted_selected_dir$blog")
                          } else {
                            props.blogLoadDir$blog({
                              id: v.id,
                              thread_address: v.address
                            })
                          }
                      }}
                      sx={{ ...btn }}
                      mt={3}
                    >
                      <Box as="td" p={2}>
                        {v.id != null &&
                        v.id === props.blog_edit_list_name$blog ? (
                          <Input
                            p={1}
                            onChange={e => {
                              props.set(
                                e.target.value,
                                "blog_edit_list_name_value$blog"
                              )
                            }}
                            value={props.blog_edit_list_name_value$blog}
                            bg="white"
                            color="#333"
                            m={0}
                          />
                        ) : (
                          v.title || v.id
                        )}
                      </Box>
                      {props.blog_posted$blog === false &&
                      props.blog_mine$blog ===
                        false ? null : (props.blog_posted$blog ||
                        props.blog_mine$blog === true) &&
                      R.xNil(v.id) &&
                      v.predefined !== true ? (
                        <Box
                          width="50px"
                          as="td"
                          bg={
                            v.id === props.blog_edit_list_name$blog
                              ? "#BF731C"
                              : "#198643"
                          }
                          sx={{ ...btn }}
                          textAlign="center"
                          onClick={e => {
                            e.stopPropagation()
                            if (v.id === props.blog_edit_list_name$blog) {
                              if (
                                /^\s*$/.test(
                                  props.blog_edit_list_name_value$blog
                                ) === false
                              ) {
                                if (props.blog_posted$blog) {
                                  props.blogChangeListTitleFB$blog({
                                    user: props.user,
                                    id: v.id,
                                    title: props.blog_edit_list_name_value$blog
                                  })
                                } else {
                                  props.blogChangeListTitle$blog({
                                    id: v.id,
                                    title: props.blog_edit_list_name_value$blog
                                  })
                                }
                              } else {
                                props.set(
                                  {
                                    blog_edit_list_name_value$blog: "",
                                    blog_edit_list_name$blog: null
                                  },
                                  null
                                )
                              }
                            } else {
                              props.set(
                                {
                                  blog_edit_list_name$blog: v.id,
                                  blog_edit_list_name_value$blog: v.title || ""
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
                              v.id === props.blog_edit_list_name$blog
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
                        title: t("unsorted", props.lang$util),
                        id: null,
                        date: null,
                        address: null
                      }
                    ],
                    (props.blog_posted$blog
                      ? props.blog_posted_dirs$blog
                      : props.blog_dirs$blog) || []
                  )
                )}
              </Box>
            </Box>
            {props.blog_mine$blog !== true || props.blog_posted$blog ? null : (
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
                ) : props.blog_posted$blog ? null : (
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
                      href={`${share_root}?address=${props.blog_address$blog}${
                        R.xNil(blog_selected_dir)
                          ? `&list=${blog_selected_dir}`
                          : ""
                      }`}
                    >
                      <Box color="white" sx={{ textDecoration: "none" }}>
                        {share_root}
                        ?address=
                        {props.blog_address$blog}
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
        {props.tab$util === "ipfs" && props.blog_ready$blog === false ? (
          <Box
            p={3}
            color="white"
            bg="#BF731C"
            sx={{ borderRadius: "3px" }}
            lineHeight="150%"
          >
            <T t="exp_loading" />
          </Box>
        ) : props.blog_mine$blog === true || props.tab$util === "default" ? (
          <Box
            textAlign="center"
            onClick={() => {
              if (props.blog_posted$blog) {
                props.createBlankArticle$blog()
              } else {
                props.createArticle$blog()
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
        {props.blog_posted$blog !== true &&
        props.blog_ready$blog === true &&
        props.blog_mine$blog &&
        blog_selected_dir !== null &&
        blog_articles.length === 0 ? (
          <Box
            textAlign="center"
            onClick={() => {
              if (confirm("Are you sure?")) {
                props.blogDeleteList$blog({ id: blog_selected_dir })
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
          <Box as="table" width={1} key={`articles_${props.blog_updated$blog}`}>
            <Box as="tbody">
              {R.addIndex(R.map)((v, i) => {
                return (
                  <Box
                    key={`article_${v.id}`}
                    color={
                      props.blog_selected_article$blog === v.id
                        ? "white"
                        : "#333"
                    }
                    bg={
                      props.blog_selected_article$blog === v.id
                        ? "#232538"
                        : i % 2 === 0
                          ? "#eee"
                          : "#ddd"
                    }
                    as="tr"
                    onClick={() => {
                      if (props.tab$util === "default") {
                        props.loadPostedArticle$blog({ id: v.id })
                      } else {
                        props.blogLoadArticle$blog({
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
  (props.tab$util === "default" && R.xNil(props.user$account)) ||
  (props.tab$util === "ipfs" && props.blog_mine$blog === true)

const SingleBtn = bind(
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
                props.hookWeb3$web3({ _network: "1" })
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
  ["hookWeb3$web3"]
)

const Articles = props => {
  const uport_qr = R.xNil(props.uport$account) ? <UPort /> : null
  return (
    <Fragment>
      {props.tab$util === "default" && props.user_init$account === false ? (
        <Loading color="#03414D" />
      ) : props.tab$util === "default" && R.isNil(props.user$account) ? (
        R.xNil(uport_qr) ? (
          uport_qr
        ) : (
          <Login />
        )
      ) : props.tab$util === "ipfs" && props.web3_init$web3 === false ? (
        <SingleBtn />
      ) : (
        <Box width={1} flex={1}>
          {props.tab$util === "ipfs" && props.web3_init$web3 ? (
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
    (props.tab$util === "ipfs"
      ? props.blog_articles$blog
      : R.filter(v => {
          return (v.topic || null) === props.blog_posted_selected_dir$blog
        })(props.blog_posted_articles$blog)) || []
  const blog_selected_dir = props.blog_posted$blog
    ? props.blog_posted_selected_dir$blog
    : props.blog_selected_dir$blog
  const blog_access = props.blog_posted$blog
    ? props.blog_posted_access$blog
    : props.blog_access$blog
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
                {props.blog_new_title$blog}
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

      {props.blog_mine$blog === true || props.blog_posted$blog ? (
        <Box
          flex={1}
          textAlign="center"
          onClick={() => {
            props.set(props.blog_posted$blog ? "default" : "ipfs", "tab$util")
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
                tab$blog: props.blog_posted$blog ? "default" : "ipfs",
                blog_selected_article$blog: null
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
  const share_root = R.xNil(props.url$util)
    ? props.url$util.protocol +
      "//" +
      props.url$util.host +
      props.url$util.pathname
    : conf.blog.root
  const blog_articles =
    (props.tab$util === "ipfs"
      ? props.blog_default$blog
      : R.filter(v => {
          return (v.topic || null) === props.blog_posted_selected_dir$blog
        })(props.blog_posted_articles$blog)) || []
  const blog_selected_dir = props.blog_posted$blog
    ? props.blog_posted_selected_dir$blog
    : props.blog_selected_dir$blog
  const blog_access = props.blog_posted$blog
    ? props.blog_posted_access$blog
    : props.blog_access$blog

  let covers = []
  if (props.blog_mode$blog === "post") {
    const $ = cheerio.load(converter.makeHtml(props.blog_new_body$blog || ""))
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
      defaultValue={props.blog_new_title$blog}
      value={
        R.xNil(props.blog_new_title_lock$blog)
          ? props.blog_new_title_lock$blog
          : null
      }
      onClick={e => {
        props.set(null, "blog_new_title_lock$blog")
      }}
      onChange={e => {
        props.set(null, "blog_new_title_lock$blog")
        props.set(e.target.value, "blog_new_title$blog")
      }}
    />
  )
  let topics = props.blog_posted$blog
    ? props.blog_posted_dirs$blog
    : props.blog_dirs$blog
  let subtabs = [
    { key: "default", name: t("preview", props.lang$util) },
    { key: "toc", name: t("toc", props.lang$util) }
  ]
  if (!props.blog_posted$blog) {
    subtabs.push({ key: "history", name: t("history", props.lang$util) })
  }
  return (
    <React.Fragment>
      <Flex flexWrap="wrap">
        <Box width={[1, null, 0.5]} sx={{ borderLeft: "1px solid #ddd" }}>
          {props.tab$util === "ipfs" &&
          R.isNil(props.blog_thread$blog) ? null : props.blog_mode$blog ===
          "post" ? (
            <React.Fragment>
              {title}
              <Box p={3} sx={{ minHeight: props.innerHeight$nav }}>
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
                        props.set(v, "blog_cover$blog")
                      }}
                      sx={{
                        ...btn,
                        opacity: props.blog_cover$blog === v ? 1 : 0.75,
                        border:
                          props.blog_cover$blog === v
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
                  value={props.blog_topic$blog}
                  onChange={e => {
                    props.set(e.target.value, "blog_topic$blog")
                  }}
                >
                  {R.map(v => {
                    const selected =
                      props.blog_topic$blog === v.key ? "selected" : ""
                    return (
                      <option value={v.id} selected={selected}>
                        {v.title}
                      </option>
                    )
                  })(props.blog_posted_dirs$blog)}
                </Select>
                {R.isNil(props.blog_article$blog) ||
                props.blog_article$blog.published === false ? null : (
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
                        props.blog_selected_article$blog
                      }`}
                    >
                      <Box color="white" sx={{ textDecoration: "none" }}>
                        https://blog.warashibe.market/articles/
                        {props.blog_selected_article$blog}
                      </Box>
                    </Box>
                  </React.Fragment>
                )}
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {title}
              <Box
                height={props.innerHeight$nav}
                sx={{ overflow: "auto" }}
                p={3}
              >
                <Editor
                  editor_style={{ height: "100%" }}
                  key={`editor-${props.blog_history_cursor$blog}-${
                    props.blog_updated$blog
                  }`}
                  init_value={props.blog_editor_value$editor}
                />
              </Box>
            </React.Fragment>
          )}
        </Box>
        <Box width={[1, null, 0.5]} sx={{ borderLeft: "1px solid #ddd" }}>
          <Flex width={1} flexWrap="wrap">
            {R.map(v => {
              const bg = v.key === props.subtab$util ? "teal" : "#999"
              return (
                <Box
                  textAlign="center"
                  width={1 / subtabs.length}
                  bg={bg}
                  color="white"
                  p={2}
                  sx={{ ...btn }}
                  onClick={() => props.set(v.key, "subtab$util")}
                >
                  {v.name}
                </Box>
              )
            })(subtabs)}
          </Flex>
          {props.subtab$util === "default" ? (
            <Preview
              set={props.set}
              setValue={props.blog_setValue$editor}
              mounted={props.mounted}
              value={props.blog_editor_value$editor}
              height={props.innerHeight$nav}
            />
          ) : props.subtab$util === "history" ? (
            <Box p={3} height={props.innerHeight$nav} sx={{ overflow: "auto" }}>
              {R.addIndex(R.map)((v, i) => {
                return (
                  <Flex
                    display="inline-block"
                    width={1}
                    py={1}
                    px={2}
                    textAlign="center"
                    bg={
                      props.blog_history_cursor$blog ===
                      props.blog_post_history$blog.length - i - 1
                        ? "teal"
                        : i % 2 === 0
                          ? "#777"
                          : "#555"
                    }
                    color="white"
                    sx={{ ...btn }}
                    onClick={() => {
                      props.blogLoadHistory$blog({
                        index: props.blog_post_history$blog.length - i - 1
                      })
                    }}
                  >
                    <Flex width="50px" justifyContent="center">
                      {props.blog_post_history$blog.length - i}
                    </Flex>
                    <Flex flex={1}>
                      {moment(v.timestamp * 1000).format("YYYY MM/DD HH:mm:ss")}
                    </Flex>
                  </Flex>
                )
              })(R.reverse(props.blog_post_history$blog))}
            </Box>
          ) : (
            <Box p={3} height={props.innerHeight$nav} sx={{ overflow: "auto" }}>
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
              {props.blog_posted$blog ? null : (
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
                    href={`${share_root}?address=${props.blog_address$blog}${
                      R.xNil(blog_selected_dir)
                        ? `&list=${blog_selected_dir}`
                        : ""
                    }&article=${props.blog_selected_article$blog}`}
                  >
                    <Box color="white" sx={{ textDecoration: "none" }}>
                      {share_root}
                      ?address=
                      {props.blog_address$blog}
                      {R.xNil(blog_selected_dir)
                        ? `&list=${blog_selected_dir}`
                        : ""}
                      &article=
                      {props.blog_selected_article$blog}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Flex>
      {props.blog_mine$blog !== true &&
      props.tab$util !== "default" ? null : props.blog_mode$blog === "post" ? (
        <Flex width={1}>
          <Box
            flex={1}
            textAlign="center"
            onClick={() => {
              if (R.xNil(props.user$account)) {
                props.postToFirestore$blog({
                  topic: props.blog_topic$blog,
                  id: props.blog_selected_article$blog,
                  user: props.user$account,
                  cover: props.blog_cover$blog,
                  title: props.blog_new_title$blog,
                  body: serialize(props.blog_editor_value$editor)
                })
              } else {
                alert(t("need_login_to_post", props.lang$util))
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
              if (R.xNil(props.user$account)) {
                props.postToFirestore$blog({
                  topic: props.blog_topic$blog,
                  id: props.blog_selected_article$blog,
                  user: props.user$account,
                  cover: props.blog_cover$blog,
                  title: props.blog_new_title$blog,
                  body: serialize(props.blog_editor_value$editor),
                  published: false
                })
              } else {
                alert(t("need_login_to_save", props.lang$util))
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

          {R.isNil(props.blog_article$blog) ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                if (confirm(<T t="confirm_deletion" />)) {
                  props.deleteFromFirestore$blog({
                    id: props.blog_selected_article$blog
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
              props.blogSwitchModes$blog({
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
      ) : props.blog_mine$blog !== true &&
      props.tab$util !== "default" ? null : (
        <Flex width={1}>
          {R.isNil(props.user$account) ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                props.getArticle$blog({
                  id: props.blog_selected_article$blog
                })
                props.blogSwitchModes$blog({
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
          {props.blog_posted$blog ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                const body = serialize(props.blog_editor_value$editor)
                props.set(body, "blog_new_body$blog")
                props.postBlog$blog({
                  title: props.blog_new_title$blog,
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
              props.set("full_preview", "tab$util")
            }}
            sx={{ ...btn }}
            p={2}
            bg="#198643"
            color="white"
            id="blog_btn_save"
          >
            <T t="full_preview" />
          </Box>
          {props.blog_posted$blog ? null : (
            <Box
              flex={1}
              textAlign="center"
              onClick={() => {
                if (confirm("Are you sure?")) {
                  props.blogDeleteArticle$blog({
                    id: props.blog_selected_article$blog
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
              if (props.tab$util === "default") {
                props.getMyArticles$blog({
                  topics: _topics,
                  nochange: true,
                  user: props.user$account,
                  published:
                    props.blog_posted_access$blog === "public" ? true : false
                })
              }
              props.set(null, "blog_selected_article$blog")
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
      __html = marked(serialize(props.blog_editor_value$editor || []))
      if (
        props.subtab$util === "toc" ||
        props.tab$util === "full_preview" ||
        props.blog_mine$blog !== true
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

const initPage = (props, setMounted) => {
  props.set(props.router, "router$blog")
  setMounted(true)
  isFirebase(conf).then(async () => {
    props.tracker({
      global: true,
      tracks: {
        articles: {
          any: ["user$account"],
          func: ({ state$ }) => {
            if (R.xNil(state$.value.user$account)) {
              props.getMyArticles$blog({
                user: state$.value.user$account,
                topics: _topics
              })
            }
          },
          args: {}
        }
      }
    })
    props.getURL$util()
    props.changeUser$account()
  })
}

const makeTmenu = props => {
  const blogger_address = props.router.query.address
  let tmenu = []
  if (R.xNil(props.address_in_use$web3) && props.blog_mine$blog) {
    const address = props[`${props.address_in_use$web3}_selected`]
    tmenu.push({
      index: 1,
      text: address,
      key: "address",
      icon: `/static/blog/images/${
        { eth: "metamask", auth: "authereum" }[props.address_in_use$web3]
      }.png`
    })
  } else if (
    R.xNil(props.address_in_use$web3) &&
    props.blog_mine$blog === false
  ) {
    tmenu.push({
      index: 1,
      text: blogger_address,
      key: "address",
      awesome_icon: "fas fa-newspaper"
    })
  }
  if (R.xNil(props.user$account)) {
    tmenu.push({
      index: 2,
      text: `Logout`,
      key: `logout`,
      awesome_icon: "fas fa-sign-out-alt",
      onClick: () => {
        props.logout$account()
      }
    })
  }
  return tmenu
}
const makeMain = (props, mounted) => {
  let main = null
  let { __html, content_table } = parseContent(props)
  if (
    R.includes(props.tab$util)(["default", "ipfs"]) &&
    R.isNil(props.blog_selected_article$blog)
  ) {
    main = <Articles {...props} />
  } else if (
    props.tab === "full_preview" ||
    (props.blog_mine$blog !== true && props.tab$util !== "default")
  ) {
    main = (
      <Box width={1}>
        <FullPreview {...props} __html={__html} content_table={content_table} />
      </Box>
    )
  } else {
    main = (
      <Box width={1}>
        <Edit {...props} mounted={mounted} content_table={content_table} />
      </Box>
    )
  }
  return main
}

export default bind(
  props => {
    const blogger_list_id = props.router.query.list
    const blogger_article_id = props.router.query.article
    const [mounted, setMounted] = useState(false)
    useEffect(() => initPage(props, setMounted), [])
    const tmenu = makeTmenu(props)
    const main = makeMain(props, mounted)
    const TMENU = [
      {
        index: 1,
        text: `BLOG Example`,
        awesome_icon: "fas fa-book-open"
      }
    ]
    return (
      <ThemeProvider theme={preset}>
        <Nav
          side_border_color="#008080"
          side_selected={`blog`}
          outerElms={["nav", "blog_btn_save", "blog_title"]}
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
          <Flex flex={1} width={1} flexWrap="wrap">
            <GithubMarkdown />
            <Dracula />
            {main}
            {props.blog_loading$blog ? (
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
            {R.xNil(props.blog_note$blog) ? (
              <Box
                px={3}
                py={2}
                bg={props.blog_note$blog.bg || "teal"}
                title="click to close"
                sx={{
                  ...btn,
                  position: "absolute",
                  right: "20px",
                  bottom: R.xNil(props.blog_selected_article$blog)
                    ? "50px"
                    : "20px",
                  borderRadius: "3px"
                }}
                color="white"
                onClick={() => {
                  props.set(null, "blog_note$blog")
                }}
              >
                {props.blog_note$blog.text}
              </Box>
            ) : null}
          </Flex>
        </Nav>
      </ThemeProvider>
    )
  },
  [
    "lang$util",
    "ongoing$util",
    "tab$util",
    "subtab$util",
    "url$util",

    "user_init$account",
    "user$account",
    "uport$account",

    "web3_block$web3",
    "address_in_use$web3",
    "eth_selected$web3",
    "auth_selected$web3",
    "user_balances$web3",
    "auth_init$web3",
    "web3_network$web3",
    "web3_init$web3",

    "innerHeight$nav",
    "height$nav",

    "blog_editor_value$editor",
    "blog_setValue$editor",
    "blog_editor$editor",

    "blog_new_title$blog",
    "blog_articles$blog",
    "blog_dirs$blog",
    "blog_new_body$blog",
    "blog_new_title_lock$blog",
    "blog_new_body_lock$blog",
    "blog_space$blog",
    "blog_thread$blog",
    "blog_post_history$blog",
    "blog_history_cursor$blog",
    "blog_selected_article$blog",
    "blog_access$blog",
    "blog_mode$blog",
    "blog_address$blog",
    "blog_mine$blog",
    "blog_ready$blog",
    "blog_updated$blog",
    "blog_selected_dir$blog",
    "blog_3box_status$blog",
    "blog_edit_list_name$blog",
    "blog_edit_list_name_value$blog",
    "blog_note$blog",
    "blog_loading$blog",
    "blog_posted$blog",
    "blog_cover$blog",
    "blog_posted_selected_dir$blog",
    "blog_articles$blog",
    "blog_posted_articles$blog",
    "blog_posted_dirs$blog",
    "blog_article$blog",
    "blog_topic$blog",
    "blog_posted_access$blog"
  ],
  [
    "changeUser$account",
    "logout$account",

    "connectAuthereum$web3",
    "disconnectAuthereum$web3",
    "hookWeb3$web3",
    "switchWallet$web3",

    "blogChangeListTitleFB$blog",
    "blogChangeListTitle$blog",
    "blogDeleteList$blog",
    "blogSwitchModes$blog",
    "blogSwitchAccess$blog",
    "blogLoadArticle$blog",
    "blogLoadDir$blog",
    "blogDeleteArticle$blog",
    "createArticle$blog",
    "createArticleList$blog",
    "createArticleListFB$blog",
    "postBlog$blog",
    "blogLoadHistory$blog",
    "connect_to_3box_public$blog",
    "getURL$util",
    "getMyArticles$blog",
    "createBlankArticle$blog",
    "loadPostedArticle$blog",
    "deleteFromFirestore$blog",
    "postToFirestore$blog",
    "getArticle$blog",
    "init3box$blog"
  ]
)
