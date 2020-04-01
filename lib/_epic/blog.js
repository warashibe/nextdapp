import R from "ramdam"
import shortid from "shortid"
import conf from "../../src/conf"
import { set, fb, epic } from "./util"
const jsondiffpatch = require("jsondiffpatch").create({
  textDiff: {
    minLength: 1
  }
})
const toValue = text =>
  R.map(v => ({ type: "paragraph", children: [{ text: v }] }))(text.split("\n"))

const loadDir = async ({
  state$,
  val: { thread_address, id, article_id },
  set
}) => {
  await _connect_to_3box({
    set,
    state$,
    val: {
      article_id: article_id,
      dir: thread_address,
      dir_id: id,
      access: state$.value.blog_access,
      blogger_address: state$.value.blog_address
    }
  })
}

const parseMessage = arr => {
  const list =
    arr.length === 0 || R.isNil(arr[arr.length - 1].message)
      ? []
      : JSON.parse(arr[arr.length - 1].message)

  const map = R.indexBy(R.prop("id"), list || [])
  return { list, map }
}

export const blogChangeListTitle = epic(
  "blogChangeListTitle",
  async ({ state$, val: { title, id }, set }) => {
    const thread = state$.value[`blog_${state$.value.blog_access}_dirs_thread`]
    if (R.xNil(thread)) {
      let { list } = parseMessage(await thread.getPosts())
      let blog_dirs = list
      for (let v of blog_dirs) {
        if (v.id === id) {
          v.title = title
        }
      }
      await updateArticleDirList({ blog_dirs, state$ })
      set(blog_dirs, "blog_dirs")
    }
    set({ blog_edit_list_name: null, blog_edit_list_name_value: "" }, null)
    set({ text: "Saved!" }, "blog_note")
    set(Date.now(), "blog_updated")
  }
)

export const blogDeleteList = epic(
  "blogDeleteList",
  async ({ state$, val: { title, id }, set }) => {
    const thread = state$.value[`blog_${state$.value.blog_access}_dirs_thread`]
    if (R.xNil(thread)) {
      let { list } = parseMessage(await thread.getPosts())
      let blog_dirs = []
      for (let v of list) {
        if (v.id !== id) {
          blog_dirs.push(v)
        }
      }
      await updateArticleDirList({ blog_dirs, state$ })
      set(blog_dirs, "blog_dirs")
      set({ text: "Deleted!", bg: "#CB3837" }, "blog_note")
      await _connect_to_3box({
        set,
        state$,
        val: {
          dir: null,
          dir_id: null,
          access: state$.value.blog_access,
          blogger_address: state$.value.blog_address
        }
      })
    }
    set(Date.now(), "blog_updated")
  }
)

const _connect_to_3box = async ({
  set,
  state$,
  val: {
    access = "public",
    article_id = null,
    blogger_address,
    dir = null,
    dir_id = null
  }
}) => {
  let thread
  let _list = []
  if (state$.value.blog_mine) {
    const space = state$.value.blog_space
    if (R.isNil(dir)) {
      dir =
        state$.value[`blog_${state$.value.blog_access}_thread_default`].address
    }
    thread = await space.joinThreadByAddress(dir)
    _list = await thread.getPosts()
    set(thread, `blog_${access}_thread`)
  } else {
    const Box = require("3box")
    if (R.isNil(dir)) {
      _list = await Box.getThread(
        "next-dapp-blog",
        `list_articles_${blogger_address}`,
        blogger_address,
        true
      )
    } else {
      _list = await Box.getThreadByAddress(dir)
    }
  }
  const { map, list } = parseMessage(_list)
  set(null, "blog_selected_article")
  set(null, "blog_thread")
  set(0, "blog_history_cursor")
  set([], "blog_post_history")
  set("", "blog_new_title")
  set("", "blog_new_title_lock")
  set("", "blog_new_body")
  set([], "blog_editor_value")
  set("", "blog_new_body_lock")
  set(null, "blog_thread")
  set(dir_id, "blog_selected_dir")
  set(list, "blog_articles")

  if (R.xNil(map[article_id])) {
    load({
      state$,
      val: { id: map[article_id].id, thread_address: map[article_id].address },
      set
    })
  } else if (R.xNil(state$.value.router) && state$.value.blog_mine === false) {
    let url = `${state$.value.router.pathname}?address=${blogger_address}`
    if (R.xNil(dir_id)) {
      url += `&list=${dir_id}`
    }
    state$.value.router.replace(url, url, {
      shallow: true
    })
  }
}

export const connect_to_3box = async ({
  set,
  state$,
  val: {
    access = "public",
    article_id = null,
    blogger_address = null,
    dir = null,
    dir_id = null
  }
}) => {
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const _address = blogger_address || address
  const mine = address === _address
  set(mine, "blog_mine")
  if (R.isNil(state$.value.address_in_use) && mine === true) {
    set(access, "blog_access")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    set([], "blog_articles")
    set(null, "blog_space")
    set(false, "blog_ready")
    return
  }
  if (
    state$.value.blog_address === _address &&
    access === state$.value.blog_access &&
    address === state$.value.blog_connected_address &&
    dir_id === state$.value.blog_selected_dir
  ) {
    return
  }
  set(0, "blog_3box_status")
  set(address, "blog_connected_address")
  set(access, "blog_access")
  set(null, "blog_thread")
  set(null, "blog_selected_article")
  set([], "blog_articles")
  set(null, "blog_space")
  set(false, "blog_ready")

  const Box = require("3box")
  set(_address, "blog_address")
  set(1, "blog_3box_status")
  let list_articles = []
  let list_dirs = []
  let space = null
  let load_list = null
  let articles = []
  try {
    let dirs = []
    let thread = null
    let thread_dirs = null
    let notfound = false
    if (mine === false) {
      dirs = await Box.getThread(
        "next-dapp-blog",
        `list_dirs_${_address}`,
        _address,
        true
      )
      articles = await Box.getThread(
        "next-dapp-blog",
        `list_articles_${_address}`,
        _address,
        true
      )
      if (R.xNil(dir_id) && R.xNil(dirs)) {
        const { list } = parseMessage(dirs)
        const dir_map = R.indexBy(R.prop("id"))(list)
        if (R.xNil(dir_map[dir_id])) {
          load_list = dir_map[dir_id]
        }
      }
      set(null, `blog_${access}_thread`)
      set(null, `blog_${access}_dirs_thread`)
    } else {
      const provider =
        state$.value.address_in_use === "auth"
          ? state$.value.authereum.getProvider()
          : window.web3.currentProvider
      const box = await Box.openBox(address, provider)
      space = await box.openSpace("next-dapp-blog")
      set(2, "blog_3box_status")
      const test_thread = await space.createConfidentialThread(
        `test_thread_test`
      )
      if (access === "private") {
        const list_dirs_address = await space[access].get(`list_dirs_address`)
        const list_articles_address = await space[access].get(
          `list_articles_address`
        )
        if (R.xNil(list_articles_address)) {
          thread = await space.joinThreadByAddress(list_articles_address)
        } else {
          thread = await space.createConfidentialThread(`list_articles`)
        }
        if (R.xNil(list_dirs_address)) {
          thread_dirs = await space.joinThreadByAddress(list_dirs_address)
        } else {
          thread_dirs = await space.createConfidentialThread(`list_dirs`)
        }
        articles = await thread.getPosts()
        dirs = await thread_dirs.getPosts()
      } else {
        thread_dirs = await space.joinThread(`list_dirs_${_address}`, {
          firstModerator: _address,
          members: true
        })
        dirs = await thread_dirs.getPosts()
        thread = await space.joinThread(`list_articles_${_address}`, {
          firstModerator: _address,
          members: true
        })
        articles = await thread.getPosts()
      }
      space[access].set("list_articles_address", thread.address)
      space[access].set("list_dirs_address", thread_dirs.address)
      set(thread, `blog_${access}_thread`)
      set(thread, `blog_${access}_thread_default`)
      set(thread_dirs, `blog_${access}_dirs_thread`)
    }
    list_articles =
      articles.length === 0 || R.isNil(articles[articles.length - 1].message)
        ? []
        : JSON.parse(articles[articles.length - 1].message)
    list_dirs =
      dirs.length === 0 || R.isNil(dirs[dirs.length - 1].message)
        ? []
        : JSON.parse(dirs[dirs.length - 1].message)
    set(true, "blog_ready")
  } catch (e) {
    console.log(e)
    set(null, `blog_${access}_thread`)
    set(null, `blog_${access}_dirs_thread`)
    set(false, "blog_ready")
    set(-3, "blog_3box_status")
  }
  set(list_dirs, "blog_dirs")
  set(dir_id, "blog_selected_dir")
  set(list_articles, "blog_articles")
  set(space, "blog_space")
  set(3, "blog_3box_status")
  if (R.xNil(load_list)) {
    loadDir({
      state$,
      val: {
        thread_address: load_list.address,
        id: load_list.id,
        article_id: article_id
      },
      set
    })
  } else if (R.isNil(dir_id) && R.xNil(article_id)) {
    const { list, map } = parseMessage(articles)
    if (R.xNil(map[article_id])) {
      load({
        state$,
        val: { id: article_id, thread_address: map[article_id].address },
        set
      })
    }
  }
}

export const connect_to_3box_public = epic(
  "connect_to_3box_public",
  connect_to_3box
)

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
      set([], "blog_editor_value")
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
      set({ text: "Created!" }, "blog_note")
    }
    set(Date.now(), "blog_updated")
  }
)

export const createArticleList = epic(
  "createArticleList",
  async ({ state$, val: {}, set }) => {
    const id = shortid.generate()
    const address = state$.value[`${state$.value.address_in_use}_selected`]
    const space = state$.value.blog_space
    const access = state$.value.blog_access
    let thread
    try {
      thread =
        access === "private"
          ? await space.createConfidentialThread(`article_dirs_${id}`)
          : await space.joinThread(`article_dirs_${id}`, {
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
      let blog_dirs = state$.value.blog_dirs
      blog_dirs.push({
        address: thread.address,
        id: id,
        title: null,
        date: Date.now()
      })
      await updateArticleDirList({ blog_dirs, state$ })
      set(id, "blog_selected_dirs")
      set(blog_dirs, "blog_dirs")
      set({ text: "Created!" }, "blog_note")
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
    set(toValue(post.body || ""), "blog_editor_value")
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
    set([], "blog_editor_value")
    set("", "blog_new_body_lock")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    await updateArticleList({ blog_articles, state$ })
    set({ text: "Deleted!", bg: "#CB3837" }, "blog_note")
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
  let posts = null
  if (state$.value.blog_mine === false) {
    const Box = require("3box")
    posts = await Box.getThreadByAddress(thread_address)
  } else {
    let thread
    try {
      thread = await space.joinThreadByAddress(thread_address)
    } catch (e) {
      alert(
        "Something went wrong. If this is your first time, it may take a couple hours to sync your account with 3box. Try again in a few hours."
      )
    }
    if (R.xNil(thread)) {
      set(state$.value.blog_mine ? "edit" : "preview", "blog_mode")
      set(thread, "blog_thread")
      posts = await thread.getPosts()
    }
  }
  if (R.xNil(posts) && posts.length != 0) {
    set(posts.length - 1, "blog_history_cursor")
    set(posts, "blog_post_history")
    const post = patchPost(R.clone(posts))
    set(post.title, "blog_new_title")
    set(post.title, "blog_new_title_lock")
    set(post.body, "blog_new_body")
    set(toValue(post.body || ""), "blog_editor_value")
    set(post.body, "blog_new_body_lock")
    if (R.xNil(state$.value.router) && state$.value.blog_mine === false) {
      let url = `${state$.value.router.pathname}?address=${
        state$.value.blog_address
      }`
      if (R.xNil(state$.value.blog_selected_dir)) {
        url += `&list=${state$.value.blog_selected_dir}`
      }
      url += `&article=${id}`
      state$.value.router.replace(url, url, {
        shallow: true
      })
    }
  } else {
    set(0, "blog_history_cursor")
    set([], "blog_post_history")
    set("", "blog_new_title")
    set("", "blog_new_title_lock")
    set([], "blog_editor_value")
    set("", "blog_new_body")
    set("", "blog_new_body_lock")
  }
  set(id, "blog_selected_article")
}

export const blogLoadArticle = epic("blogLoadArticle", async (...args) => {
  load(...args)
})
export const blogLoadDir = epic("blogLoadDir", async (...args) => {
  loadDir(...args)
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
    set({ text: "Saved!" }, "blog_note")
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

const updateArticleDirList = async ({ blog_dirs, state$ }) => {
  const access = state$.value.blog_access
  const space = state$.value.blog_space
  const private_thread = await space.joinThreadByAddress(
    state$.value[`blog_${access}_dirs_thread`].address
  )
  const lists = await private_thread.getPosts()
  await private_thread.post(JSON.stringify(blog_dirs))
  if (lists.length != 0) {
    for (let v of lists) {
      await private_thread.deletePost(v.postId)
    }
  }
}

export const init = {
  blog_articles: [],
  blog_dirs: [],
  blog_space: null,
  blog_new_title: "",
  blog_new_body: "",
  blog_post_history: [],
  blog_new_title_lock: "",
  blog_new_body_lock: "",
  blog_history_cursor: 0,
  blog_selected_article: null,
  blog_selected_dir: null,
  blog_access: "public",
  blog_mode: "edit",
  blog_address: null,
  blog_mine: false,
  blog_profile: null,
  blog_ready: false,
  blog_updated: null,
  blog_connected_address: null,
  blog_editor_value: null,
  blog_setValue: null,
  blog_editor: null,
  blog_3box_status: 0,
  blog_edit_list_name: null,
  blog_edit_list_name_value: ""
}
