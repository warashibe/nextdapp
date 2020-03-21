import R from "ramdam"
import shortid from "shortid"
import conf from "../../src/conf"
import { set, fb, epic } from "./util"
const jsondiffpatch = require("jsondiffpatch").create({
  textDiff: {
    minLength: 1
  }
})

export const connect_to_3box = async ({
  set,
  state$,
  val: { access = "public", blogger_address }
}) => {
  if (R.isNil(state$.value.address_in_use)) {
    set(access, "blog_access")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    set([], "blog_articles")
    set(null, "blog_space")
    return
  }
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const _address = blogger_address || address
  if (
    state$.value.blog_address !== _address ||
    access !== state$.value.blog_access ||
    address !== state$.value.blog_connected_address
  ) {
    set(address, "blog_connected_address")
    set(access, "blog_access")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    set([], "blog_articles")
    set(null, "blog_space")
    const Box = require("3box")
    const provider =
      state$.value.address_in_use === "auth"
        ? state$.value.authereum.getProvider()
        : window.web3.currentProvider
    const mine = address === _address
    set(mine, "blog_mine")
    set(_address, "blog_address")
    const box = await Box.openBox(address, provider)
    const profile = await box.public.all()
    set(profile, "blog_profile")
    const space = await box.openSpace("next-dapp-blog")
    let list_articles = []
    try {
      const test_thread = await space.createConfidentialThread(
        `test_thread_test`
      )
      set(true, "blog_ready")
      const list_articles_address = await space[access].get(
        `list_articles_address`
      )
      let articles = []
      let thread = null
      let notfound = false
      if (mine === false) {
        const thread = await space.joinThread(`list_articles_${_address}`, {
          firstModerator: _address,
          members: true
        })
        articles = await thread.getPosts()
      } else if (R.xNil(list_articles_address)) {
        thread = await space.joinThreadByAddress(list_articles_address)
        articles = await thread.getPosts()
      } else {
        if (access === "private") {
          thread = await space.createConfidentialThread(`list_articles`)
        } else {
          thread = await space.joinThread(`list_articles_${_address}`, {
            firstModerator: _address,
            members: true
          })
        }
        space[access].set("list_articles_address", thread.address)
      }
      set(thread, `blog_${access}_thread`)
      list_articles =
        articles.length === 0
          ? []
          : JSON.parse(articles[articles.length - 1].message)
    } catch (e) {
      console.log(e)
      set(null, `blog_${access}_thread`)
      set(false, "blog_ready")
    }

    set(list_articles, "blog_articles")
    set(space, "blog_space")
  }
}

export const createArticle = epic(
  "createArticle",
  async ({ state$, val: {}, set }) => {
    const id = shortid.generate()
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const space = state$.value.blog_space
    const access = state$.value.blog_access
    let thread
    try {
      thread =
        access === "private"
          ? await space.createConfidentialThread(`article_${id}`)
          : await space.joinThread(`article_${id}`, {
              firstModerator: address,
              members: true
            })
    } catch (e) {
      console.log(e)
      alert(
        "Something went wrong. If this is your first time, it may take a couple hours to sync your account with 3box. Try again in a few hours."
      )
    }
    if (R.xNil(thread)) {
      set(0, "blog_history_cursor")
      set([], "blog_post_history")
      set("", "blog_new_title")
      set("", "blog_new_title_lock")
      set("", "blog_new_body")
      set("", "blog_new_body_lock")
      set(thread, "blog_thread")
      let blog_articles = state$.value.blog_articles
      blog_articles.push({
        address: thread.address,
        id: id,
        title: null,
        date: Date.now()
      })
      await updateArticleList({ blog_articles, state$ })
      set("edit", "blog_mode")
      set(id, "blog_selected_article")
      set(blog_articles, "blog_articles")
      await load({
        set,
        state$,
        val: { thread_address: thread.address, id: id }
      })
    }
    set(Date.now(), "blog_updated")
  }
)

const patchPost = history => {
  if (history.length === 0) return null
  let post = { title: "", body: "" }
  if (history.length !== 0) {
    for (let v of history) {
      post = jsondiffpatch.patch(post, JSON.parse(v.message))
    }
  }
  return post
}

export const blogLoadHistory = epic(
  "blogLoadHistory",
  async ({ state$, val: { index }, set }) => {
    const post = patchPost(state$.value.blog_post_history.slice(0, index + 1))
    set(post.title, "blog_new_title")
    set(post.title, "blog_new_title_lock")
    set(post.body, "blog_new_body")
    set(post.body, "blog_new_body_lock")
    set(index, "blog_history_cursor")
  }
)

export const blogDeleteArticle = epic(
  "blogDeleteArticle",
  async ({ state$, val: { id }, set }) => {
    const thread = state$.value.blog_thread
    const posts = await thread.getPosts()
    for (let v of posts) {
      await thread.deletePost(v.postId)
    }
    let blog_articles = state$.value.blog_articles
    const index = R.findIndex(v => v.id === state$.value.blog_selected_article)(
      blog_articles
    )
    blog_articles = R.remove(index, 1, blog_articles)
    set(blog_articles, "blog_articles")
    set(0, "blog_history_cursor")
    set([], "blog_post_history")
    set("", "blog_new_title")
    set("", "blog_new_title_lock")
    set("", "blog_new_body")
    set("", "blog_new_body_lock")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    await updateArticleList({ blog_articles, state$ })
  }
)

export const blogSwitchModes = epic(
  "blogSwitchModes",
  async ({ state$, val: { mode }, set }) => {
    set(mode, "blog_mode")
  }
)

export const blogSwitchAccess = epic("blogSwitchAccess", async (...args) => {
  connect_to_3box(...args)
})

const load = async ({ state$, val: { thread_address, id }, set }) => {
  const space = state$.value.blog_space
  const access = state$.value.blog_access
  let thread
  try {
    thread = await space.joinThread(thread_address)
  } catch (e) {
    alert(
      "Something went wrong. If this is your first time, it may take a couple hours to sync your account with 3box. Try again in a few hours."
    )
  }
  if (R.xNil(thread)) {
    set(state$.value.blog_mine ? "edit" : "preview", "blog_mode")
    set(thread, "blog_thread")
    const posts = await thread.getPosts()
    if (posts.length != 0) {
      set(posts.length - 1, "blog_history_cursor")
      set(posts, "blog_post_history")
      const post = patchPost(R.clone(posts))
      set(post.title, "blog_new_title")
      set(post.title, "blog_new_title_lock")
      set(post.body, "blog_new_body")
      set(post.body, "blog_new_body_lock")
    } else {
      set(0, "blog_history_cursor")
      set([], "blog_post_history")
      set("", "blog_new_title")
      set("", "blog_new_title_lock")
      set("", "blog_new_body")
      set("", "blog_new_body_lock")
    }
    set(id, "blog_selected_article")
  }
}

export const blogLoadArticle = epic("blogLoadArticle", async (...args) => {
  load(...args)
})

const post = async ({ state$, val: { title, body }, set }) => {
  const space = state$.value.blog_space
  const thread = await space.joinThreadByAddress(
    state$.value.blog_thread.address
  )
  const date = Date.now()
  const new_post = { title: title, body: body }
  let blog_articles = state$.value.blog_articles
  const index = R.findIndex(v => v.id === state$.value.blog_selected_article)(
    blog_articles
  )
  const posts = await thread.getPosts()
  const old_post = patchPost(posts) || {}
  const delta = jsondiffpatch.diff(old_post, new_post)
  if (R.xNil(delta)) {
    new_post.date = date
    const delta2 = jsondiffpatch.diff(old_post, new_post)
    const id = await thread.post(JSON.stringify(delta2))
    const newPosts = await thread.getPosts()
    set(newPosts, "blog_post_history")
    set(newPosts.length - 1, "blog_history_cursor")
    blog_articles[index].title = title
    blog_articles[index].date_created = date
    set(blog_articles, "blog_articles")
    await updateArticleList({ blog_articles, state$ })
  }
  set(Date.now(), "blog_updated")
}

export const postBlog = epic("postBlog", async (...args) => {
  post(...args)
})

const updateArticleList = async ({ blog_articles, state$ }) => {
  const access = state$.value.blog_access
  const space = state$.value.blog_space
  const private_thread = await space.joinThreadByAddress(
    state$.value[`blog_${access}_thread`].address
  )
  const lists = await private_thread.getPosts()
  await private_thread.post(JSON.stringify(blog_articles))
  if (lists.length != 0) {
    for (let v of lists) {
      await private_thread.deletePost(v.postId)
    }
  }
}

export const init = {
  blog_articles: [],
  blog_space: null,
  blog_new_title: "",
  blog_new_body: "",
  blog_post_history: [],
  blog_new_title_lock: "",
  blog_new_body_lock: "",
  blog_history_cursor: 0,
  blog_selected_article: null,
  blog_access: "public",
  blog_mode: "edit",
  blog_address: null,
  blog_mine: false,
  blog_profile: null,
  blog_ready: false,
  blog_updated: null,
  blog_connected_address: null
}
