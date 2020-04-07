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

const parseList = arr => {
  const list = R.compose(
    R.sortBy(R.prop("index")),
    R.filter(R.xNil),
    R.map(v => {
      let dir = null
      try {
        dir = JSON.parse(v.message)
      } catch (e) {}
      if (R.is(Object, dir) && R.xNil(dir.id)) {
        dir.thread = v
        return dir
      } else {
        return null
      }
    })
  )(arr)
  const map = R.indexBy(R.prop("id"), list || [])
  return { list, map }
}

export const blogChangeListTitle = epic(
  "blogChangeListTitle",
  async ({ state$, val: { title, id }, set }) => {
    const thread = state$.value[`blog_${state$.value.blog_access}_dirs_thread`]
    if (R.xNil(thread)) {
      let blog_dirs = parseList(await thread.getPosts()).list
      let updated = null
      for (let v of blog_dirs) {
        if (v.id === id) {
          v.title = title
          updated = v
        }
      }
      if (R.xNil(updated))
        await updateArticleDirList({ dir: updated, state$, set })
    }
    set({ blog_edit_list_name: null, blog_edit_list_name_value: "" }, null)
    set({ text: "Saved!" }, "blog_note")
    set(Date.now(), "blog_updated")
  }
)

export const blogDeleteList = epic(
  "blogDeleteList",
  async ({ state$, val: { title, id }, set }) => {
    set(true, "blog_loading")
    const thread = state$.value[`blog_${state$.value.blog_access}_dirs_thread`]
    if (R.xNil(thread)) {
      let { list } = parseList(await thread.getPosts())
      let blog_dirs = []
      let deleted = null
      for (let v of list) {
        if (v.id !== id) {
          blog_dirs.push(v)
        } else {
          deleted = v
        }
      }
      await thread.deletePost(deleted.thread.postId)
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
    set(false, "blog_loading")
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
  set(true, "blog_loading")
  let thread
  let _list = []
  const space = state$.value.blog_space
  if (R.isNil(dir)) {
    dir =
      state$.value[`blog_${state$.value.blog_access}_thread_default`].address
  }
  thread = await space.joinThreadByAddress(dir)
  _list = await thread.getPosts()
  set(thread, `blog_${access}_thread`)
  if (state$.value.blog_updates[dir_id || `dir_${access}`] !== true) {
    set(true, ["blog_updates", dir_id || `dir_${access}`])
    thread.onUpdate(async () => {
      if (state$.value.blog_selected_dir === dir_id) {
        set(parseList(await thread.getPosts()).list, "blog_articles")
      }
    })
  }
  const { map, list } = parseList(_list)
  set(null, "blog_selected_article")
  set(null, "blog_thread")
  set(-1, "blog_history_cursor")
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
    set(false, "blog_loading")
  } else {
    set(false, "blog_loading")
  }
}

const _3box_proceed = ({
  state$,
  set,
  val: { blogger_address, access, dir_id }
}) => {
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const _address = blogger_address || address
  const mine = R.xNil(blogger_address) ? false : address === _address
  set(mine, "blog_mine")
  if (R.isNil(state$.value.address_in_use)) {
    set(access, "blog_access")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    set([], "blog_articles")
    set(null, "blog_space")
    set(false, "blog_ready")
    return false
  }
  if (
    state$.value.blog_address === _address &&
    access === state$.value.blog_access &&
    address === state$.value.blog_connected_address &&
    dir_id === state$.value.blog_selected_dir
  ) {
    return false
  }
  set(0, "blog_3box_status")
  set(address, "blog_connected_address")
  set(access, "blog_access")
  set(null, "blog_thread")
  set(null, "blog_selected_article")
  set([], "blog_articles")
  set(null, "blog_space")
  set(false, "blog_ready")
  return true
}
const _3box_getBox = ({ state$, set }) => {
  let Box = state$.value.blog_3box["Box"]
  if (R.isNil(Box)) {
    Box = require("3box")
    set(Box, ["blog_3box", "Box"])
  }
  return Box
}
const _3box_getSpace = async ({
  set,
  state$,
  val: { _address, Box, nopin = false }
}) => {
  const address_in_use = state$.value.address_in_use
  const provider =
    address_in_use === "auth"
      ? state$.value.authereum.getProvider()
      : window.web3.currentProvider
  const my_address = state$.value[`${state$.value.address_in_use}_selected`]
  let space =
    state$.value.blog_3box.spaces[`${_address}_${my_address}_${address_in_use}`]
  if (R.isNil(space)) {
    let ipfs_conf = {}
    if (R.xNil(conf.blog.pinningNode) && nopin === false) {
      ipfs_conf.pinningNode = conf.blog.pinningNode
    }
    let success = false
    let timeout = false
    setTimeout(() => {
      if (success === false) {
        timeout = true
        if (R.xNil(conf.blog.pinningNode)) {
          throw "retry"
        } else {
          throw "giveup"
        }
      }
    }, 60000)
    const box = await Box.openBox(my_address, provider, ipfs_conf)
    space = await box.openSpace(`next-dapp-ipfs-blog`)
    if (timeout === false) {
      success = true
      set(space, [
        "blog_3box",
        "spaces",
        `${_address}_${my_address}_${address_in_use}`
      ])
    }
  }
  return space
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
  if (!_3box_proceed({ state$, set, val: { blogger_address, dir_id, access } }))
    return
  // connect with Box
  const Box = _3box_getBox({ state$, set })

  set(1, "blog_3box_status")
  const address = state$.value[`${state$.value.address_in_use}_selected`]
  const _address = blogger_address || address
  const mine = R.xNil(blogger_address) ? false : address === _address
  set(_address, "blog_address")
  let list_articles = []
  let list_dirs = []
  let space = null
  let load_list = null
  let articles = []
  let error = null
  let dirs = []
  let thread = null
  let thread_dirs = null
  let notfound = false
  let error_space = null
  try {
    space = await _3box_getSpace({ set, state$, val: { _address, Box } })
  } catch (e) {
    console.log(e)
    error_space = e
  }
  try {
    if (R.xNil(error_space)) {
      console.log(error_space)
      if (error_space === "retry") {
        console.log("go again")
        space = await _3box_getSpace({
          set,
          state$,
          val: { _address, Box, nopin: true }
        })
      }
    }
    set(2, "blog_3box_status")
    if (access === "private") {
      const list_dirs_address = await space.private.get(`dirs_list`)
      if (R.xNil(list_dirs_address)) {
        thread_dirs = await space.joinThreadByAddress(list_dirs_address)
      } else {
        thread_dirs = await space.createConfidentialThread(`dirs_list`)
        space.private.set("dirs_list", thread_dirs.address)
      }
      const list_articles_address = await space.private.get(`articles_list`)
      if (R.xNil(list_articles_address)) {
        thread = await space.joinThreadByAddress(list_articles_address)
      } else {
        thread = await space.createConfidentialThread(`articles_list`)
        space.private.set("articles_list", thread.address)
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
      if (R.xNil(dir_id)) {
        const dir_map = parseList(dirs).map
        if (R.xNil(dir_map[dir_id])) {
          load_list = dir_map[dir_id]
        }
      }
      articles = await thread.getPosts()
    }
    set(thread, `blog_${access}_thread`)
    set(thread, `blog_${access}_thread_default`)
    set(thread_dirs, `blog_${access}_dirs_thread`)
    if (state$.value.blog_updates[access] !== true) {
      set(true, ["blog_updates", access])
      thread_dirs.onUpdate(async () => {
        if (state$.value.blog_access === access) {
          set(parseList(await thread_dirs.getPosts()).list, "blog_dirs")
        }
      })
    }
    if (state$.value.blog_updates[`dir_${access}`] !== true) {
      set(true, ["blog_updates", `dir_${access}`])
      thread.onUpdate(async () => {
        if (state$.value.blog_selected_dir === null) {
          set(parseList(await thread.getPosts()).list, "blog_articles")
        }
      })
    }
    list_articles = parseList(articles).list
    list_dirs = parseList(dirs).list
    set(true, "blog_ready")
  } catch (e) {
    console.log(e)
    set(null, `blog_${access}_thread`)
    set(null, `blog_${access}_dirs_thread`)
    set(false, "blog_ready")
    error = e
  }
  set(list_dirs, "blog_dirs")
  set(dir_id, "blog_selected_dir")
  set(list_articles, "blog_articles")
  set(space, "blog_space")
  if (R.xNil(error)) {
    set(-3, "blog_3box_status")
  } else {
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
      const { list, map } = parseList(articles)
      if (R.xNil(map[article_id])) {
        load({
          state$,
          val: { id: article_id, thread_address: map[article_id].address },
          set
        })
      }
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
    set(true, "blog_loading")
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
      set(-1, "blog_history_cursor")
      set([], "blog_post_history")
      set("", "blog_new_title")
      set("", "blog_new_title_lock")
      set("", "blog_new_body")
      set([], "blog_editor_value")
      set("", "blog_new_body_lock")
      set(thread, "blog_thread")
      let blog_articles = state$.value.blog_articles
      const new_article = {
        address: thread.address,
        id: id,
        title: null,
        index: blog_articles.length,
        date: Date.now()
      }
      blog_articles.push(new_article)
      await updateArticleList({ article: new_article, state$, set })
      set("edit", "blog_mode")
      set(id, "blog_selected_article")
      set({ text: "Created!" }, "blog_note")
      const thread_article = await post({
        state$,
        val: { title: "", body: "" },
        set
      })
      if (R.isNil(state$.value.blog_updates[id])) {
        set(true, ["blog_updates", id])
        thread_article.onUpdate(async () => {
          if (state$.value.blog_selected_article === id) {
            const posts = await thread_article.getPosts()
            const post = patchPost(R.clone(posts))
            if (state$.value.blog_new_title === "" && R.xNil(post)) {
              set(post.title, "blog_new_title")
              set(post.title, "blog_new_title_lock")
            }
            if (
              R.xNil(post) &&
              (state$.value.blog_new_body === "" &&
                state$.value.blog_editor_value.length === 0)
            ) {
              set(post.body, "blog_new_body")
              set(toValue(post.body || ""), "blog_editor_value")
              set(posts.length - 1, "blog_history_cursor")
            }
            set(posts, "blog_post_history")
            set(Date.now(), "blog_updated")
            set(false, "blog_loading")
          }
        })
      }
    }
    set(false, "blog_loading")
  }
)

export const createArticleList = epic(
  "createArticleList",
  async ({ state$, val: {}, set }) => {
    set(true, "blog_loading")
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
      const new_dir = {
        address: thread.address,
        id: id,
        title: null,
        index: blog_dirs.length,
        date: Date.now()
      }
      blog_dirs.push(new_dir)
      await updateArticleDirList({ dir: new_dir, state$, set })
      set(id, "blog_selected_dirs")
      set(blog_dirs, "blog_dirs")
      set({ text: "Created!" }, "blog_note")
    }
    set(Date.now(), "blog_updated")
    set(false, "blog_loading")
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
    set(true, "blog_loading")
    const thread = state$.value.blog_thread
    const posts = await thread.getPosts()
    if (posts.length !== 0) {
      for (let v of posts) {
        await thread.deletePost(v.postId)
      }
    }
    await deleteArticleFromList({ id: id, state$, set })
    set(-1, "blog_history_cursor")
    set([], "blog_post_history")
    set("", "blog_new_title")
    set("", "blog_new_title_lock")
    set("", "blog_new_body")
    set([], "blog_editor_value")
    set("", "blog_new_body_lock")
    set(null, "blog_thread")
    set(null, "blog_selected_article")
    set({ text: "Deleted!", bg: "#CB3837" }, "blog_note")
    set(false, "blog_loading")
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
  set(true, "blog_loading")
  const space = state$.value.blog_space
  const access = state$.value.blog_access
  let posts = null
  let done = false
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
    if (posts.length !== 0) {
      done = true
    } else {
      setTimeout(() => {
        if (state$.value.blog_selected_article === id)
          set(false, "blog_loading")
      }, 30000)
    }
    if (R.isNil(state$.value.blog_updates[id])) {
      set(true, ["blog_updates", id])
      thread.onUpdate(async () => {
        if (state$.value.blog_selected_article === id) {
          posts = await thread.getPosts()
          const post = patchPost(R.clone(posts))
          if (R.xNil(post)) {
            if (state$.value.blog_new_title === "") {
              set(post.title, "blog_new_title")
              set(post.title, "blog_new_title_lock")
            }
            if (
              state$.value.blog_new_body === "" &&
              state$.value.blog_editor_value.length === 0
            ) {
              set(post.body, "blog_new_body")
              set(toValue(post.body || ""), "blog_editor_value")
              set(posts.length - 1, "blog_history_cursor")
            }
          }
          set(posts, "blog_post_history")
          set(Date.now(), "blog_updated")
          set(false, "blog_loading")
        }
      })
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
    set(-1, "blog_history_cursor")
    set([], "blog_post_history")
    set("", "blog_new_title")
    set("", "blog_new_title_lock")
    set([], "blog_editor_value")
    set("", "blog_new_body")
    set("", "blog_new_body_lock")
  }
  set(id, "blog_selected_article")
  if (done) {
    set(false, "blog_loading")
  }
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
  const delta = jsondiffpatch.diff(
    R.pickBy((v, k) => k !== "date")(old_post),
    new_post
  )
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
    await updateArticleList({ article: blog_articles[index], state$, set })
    set({ text: "Saved!" }, "blog_note")
    set(Date.now(), "blog_updated")
  } else {
    set({ text: "No need to save!" }, "blog_note")
  }
  return thread
}

export const postBlog = epic("postBlog", async (...args) => {
  post(...args)
})

const updateArticleList = async ({ article, state$, set }) => {
  const access = state$.value.blog_access
  const space = state$.value.blog_space
  const thread = await space.joinThreadByAddress(
    state$.value[`blog_${access}_thread`].address
  )
  await thread.post(JSON.stringify(article))
  if (R.xNil(article.thread)) await thread.deletePost(article.thread.postId)
  set(parseList(await thread.getPosts()).list, "blog_articles")
}

const deleteArticleFromList = async ({ id, state$, set }) => {
  const access = state$.value.blog_access
  const space = state$.value.blog_space
  const thread = await space.joinThreadByAddress(
    state$.value[`blog_${access}_thread`].address
  )
  let posts = parseList(await thread.getPosts()).list
  let articles = []
  for (let v of posts) {
    if (v.id !== id) {
      articles.push(v)
    } else {
      await thread.deletePost(v.thread.postId)
    }
  }
  set(articles, "blog_articles")
}

const updateArticleDirList = async ({ dir, state$, set }) => {
  const access = state$.value.blog_access
  const space = state$.value.blog_space
  const thread = await space.joinThreadByAddress(
    state$.value[`blog_${access}_dirs_thread`].address
  )
  await thread.post(JSON.stringify(R.pickBy((v, k) => k !== "thread")(dir)))
  if (R.xNil(dir.thread)) await thread.deletePost(dir.thread.postId)
  set(parseList(await thread.getPosts()).list, "blog_dirs")
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
  blog_history_cursor: -1,
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
  blog_edit_list_name_value: "",
  blog_updates: {},
  blog_loading: false,
  blog_3box: { Box: null, spaces: {}, threads: {} }
}
