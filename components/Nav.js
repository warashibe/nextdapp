import { useEffect, useState } from "react"
import { Image, Text, Box, Flex, Button } from "rebass"
import useEventListener from "@use-it/event-listener"
import { ThemeProvider } from "emotion-theming"
const isFirebase = require("../lib/firestore-short/isFirebase")
const R = require("ramdam")
import binder from "../src/lib/binder"
import {
  Switch,
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox
} from "@rebass/forms"
import preset from "@rebass/preset"
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

const TopMenu = ({
  islast = false,
  index = 1,
  isScroll = false,
  size = "n",
  open,
  breakpoint,
  TMENU = [],
  topnum,
  divnum,
  setter,
  user,
  showmore,
  catopen,
  chosen = null
}) => {
  let i = 0
  let len = TMENU.length
  let tnum = TMENU.length
  TMENU = R.sortBy(v => {
    i += 1
    const rank = v.index || i + len
    return rank
  })(TMENU)
  const [scroll, setScroll] = useState(null)
  if (isScroll) {
    useEventListener("scroll", () => {
      const ids = R.pluck("key")(TMENU)
      const ot = offsetTop()
      const offsets = R.compose(
        R.takeWhile(
          R.compose(
            R.gt(ot + 51),
            key => {
              return getElementOffset(document.getElementById(key)).top
            }
          )
        )
      )(ids)
      const now = offsets.length === 0 ? null : R.last(offsets)
      if (scroll !== now) {
        setScroll(now)
      }
    })
  }
  const isBreak2 = open && breakpoint == 2
  const text_size =
    size === "xs" || isBreak2 ? "10px" : ["10px", "10px", "13px", "16px"]
  const text_width = size == "xs" || isBreak2 ? 1 : [1, 1, "auto"]
  const text_ml = size == "xs" || isBreak2 ? 0 : [0, 0, 2]
  const all_display =
    size === "xs"
      ? open && breakpoint == 1
        ? "none"
        : "flex"
      : open && breakpoint == 1
        ? "none"
        : "flex"
  const sx = open && breakpoint == 1 ? { borderBottom: `#222 3px solid` } : {}
  const icon_gap = open && breakpoint == 1 ? "block" : "none"
  const isshow = showmore && index === 1 && !catopen ? true : false
  let tstart = (index - 1) * divnum
  let tend = tstart + divnum
  if (topnum >= tnum) {
    tend = tnum
  }
  if (isshow) {
    tend -= 1
  }
  let pad = []
  if (tend > tnum) {
    let hm = tend - tnum
    for (let i of R.range(0, hm)) {
      if (islast && hm - 1 === i) {
        pad.push(
          <Box
            display={all_display}
            title="閉じる"
            key="showmore"
            justifyContent="center"
            alignItems="center"
            flex={1}
            flexWrap="wrap"
            color="#198643"
            sx={{
              textDecoration: "none",
              borderBottom: `#222 3px solid`,
              cursor: "pointer",
              ":hover": {
                opacity: 0.75
              }
            }}
            onClick={() => {
              setter(!catopen, "catopen")
            }}
          >
            <Flex justifyItems="center">
              <Box as="i" className="fas fa-home" />
            </Flex>
            <Text
              display={size === "xs" ? "block" : ["none", "block"]}
              fontSize={text_size}
              width={text_width}
              ml={text_ml}
              sx={{ textAlign: "center" }}
            >
              閉じる
            </Text>
          </Box>
        )
      } else {
        pad.push(
          <React.Fragment>
            <Box flex={1} display={icon_gap} />
            <Box
              flex={1}
              sx={{
                borderBottom: `#222 3px solid`
              }}
            />
          </React.Fragment>
        )
      }
    }
  }
  return (
    <React.Fragment>
      <Flex flex={1} bg="#191919" color="#F7F4F6" sx={sx} id="nav">
        {R.compose(
          R.map(v => {
            const mcolor =
              chosen === v.key || scroll === v.key ? "#198643" : "#191919"
            const extra = R.isNil(v.href)
              ? null
              : {
                  as: "a",
                  href: v.href,
                  target: v.target || "_blank"
                }

            return (
              <Box
                {...extra}
                display={all_display}
                title={v.text}
                id={`menu-${v.key}`}
                key={v.key}
                justifyContent="center"
                alignItems="center"
                flex={1}
                flexWrap="wrap"
                sx={{
                  textDecoration: "none",
                  borderBottom: `${mcolor} 3px solid`,
                  color: "#F7F4F6",
                  cursor: "pointer",
                  ":hover": {
                    opacity: 0.75
                  }
                }}
                onClick={() => {
                  const x = getElementOffset(document.getElementById(v.key))
                  if (R.isNotNil(document.getElementById(v.key))) {
                    window.scrollTo({ top: x.top - 50, behavior: "smooth" })
                  }
                }}
              >
                <Flex justifyContent="center" alignItems="center">
                  {R.is(String, v.icon) ? (
                    <Image
                      src={
                        chosen === v.key && R.isNotNil(v.icon_hover)
                          ? v.icon_hover
                          : v.icon
                      }
                      width={v.size || "20px"}
                      height={v.size || "20px"}
                      sx={{
                        marginTop: v.marginTop || "0"
                      }}
                    />
                  ) : (
                    <Box as="i" className={v.awesome_icon || "fas fa-home"} />
                  )}
                </Flex>
                <Text
                  display={size === "xs" ? "block" : ["none", "block"]}
                  fontSize={text_size}
                  width={text_width}
                  ml={text_ml}
                  sx={{
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  {v.shorter || v.text}
                </Text>
              </Box>
            )
          }),
          R.slice(tstart, tend)
        )(TMENU)}
        {pad}
        {!isshow || size !== "xs" ? null : (
          <React.Fragment>
            <Box
              display={all_display}
              title="全表示"
              key="showmore"
              justifyContent="center"
              alignItems="center"
              flex={1}
              flexWrap="wrap"
              color="#198643"
              sx={{
                textDecoration: "none",
                borderBottom: `#222 3px solid`,
                cursor: "pointer",
                ":hover": {
                  opacity: 0.75
                }
              }}
              onClick={() => {
                setter(!catopen, "catopen")
              }}
            >
              <Flex justifyItems="center">
                <Box as="i" className="fas fa-home" />
              </Flex>
              <Text
                display={["none", "block"]}
                fontSize={text_size}
                width={text_width}
                ml={text_ml}
                sx={{ textAlign: "center" }}
              >
                全表示
              </Text>
            </Box>
          </React.Fragment>
        )}
        {R.isNil(user) || catopen ? null : index !== 1 ? (
          islast ? (
            <Box
              display={all_display}
              title="閉じる"
              key="showmore"
              justifyContent="center"
              alignItems="center"
              width="50px"
              flexWrap="wrap"
              color="#198643"
              sx={{
                textDecoration: "none",
                borderBottom: `#222 3px solid`,
                cursor: "pointer",
                ":hover": {
                  opacity: 0.75
                }
              }}
              onClick={() => {
                setter(!catopen, "catopen")
              }}
            >
              <Flex justifyItems="center">
                <Box as="i" className="fas fa-home" />
              </Flex>
              <Text
                display={size === "xs" ? "block" : ["none", "block"]}
                fontSize={text_size}
                width={text_width}
                ml={text_ml}
                sx={{ textAlign: "center" }}
              >
                閉じる
              </Text>
            </Box>
          ) : (
            <React.Fragment>
              <Box
                flex={1}
                display={icon_gap}
                as="a"
                href={`/mafia/${user.user_id}`}
              />
              <Box
                width={50}
                height={50}
                sx={{
                  borderBottom: `#222 3px solid`
                }}
              />
            </React.Fragment>
          )
        ) : (
          <React.Fragment>
            <Box
              flex={1}
              display={icon_gap}
              as="a"
              href={`/mafia/${user.user_id}`}
            />
            <Image
              title={user.name}
              src={user.image}
              width={50}
              height={50}
              sx={{
                cursor: "pointer",
                borderBottom: `#03414D 3px solid`
              }}
            />
          </React.Fragment>
        )}
      </Flex>
    </React.Fragment>
  )
}
const makeSide = (num, props) => {
  let cursor = props.cursor
  let smenu = R.isNotNil(props.SMENU) ? R.clone(props.SMENU) : []
  let leftover = "#198643"
  if (R.isNil(num)) {
    smenu = []
  } else {
    const snum = smenu.length
    let end = cursor + num - 1
    smenu = R.slice(cursor, end)(smenu)
    let recover = null
    const many = num - 2
    if (cursor !== 0) {
      smenu.unshift({
        key: "up",
        awesome_icon: "far fa-angle-double-up",
        color: "#333",
        onClick: props => () => {
          let to
          if (cursor - many <= 0) {
            to = 0
          } else {
            to = cursor - many + 1
          }
          if (cursor !== to) {
            props.setter(to, "cursor")
          }
        }
      })
      recover = smenu.pop()
      end -= 1
    }
    if (end < snum) {
      leftover = "#333"
      smenu.pop()
      smenu.push({
        key: "down",
        awesome_icon: "far fa-angle-double-down",
        color: "#333",
        onClick: props => () => {
          let to
          if (cursor + many * 2 - 1 >= snum) {
            to = snum - many
          } else {
            to = cursor + many - 1
            if (cursor == 0) {
              to += 1
            }
          }
          if (cursor !== to) {
            props.setter(to, "cursor")
          }
        }
      })
    } else if (end === snum) {
      smenu.push(recover)
    }
  }

  const sidemenu = R.compose(
    R.map(v => {
      let extra = {}
      if (v.href) {
        extra = {
          as: "a",
          href: v.href,
          target: v.target || "_blank",
          color: "white"
        }
      }
      const text = R.isNil(v.text) ? null : (
        <Flex
          flex={1}
          height="100%"
          justifyContent="left"
          alignItems="center"
          bg={v.color || "#198643"}
        >
          <Text
            fontSize="16px"
            fontWeight="bold"
            px="5px"
            sx={{ whiteSpace: "nowrap", overflow: "hidden" }}
          >
            {v.text}
          </Text>
        </Flex>
      )
      const iconWidth = R.isNil(v.text) ? "100%" : 50
      const setW = () => {
        props.setter(false, "open")
        props.setPnum(R.not(props.open), props.breakpoint)
      }
      const border = v.border ? "1px solid #555" : null
      const text_color =
        props.side_selected === v.key
          ? "#A2C856"
          : v.disabled
            ? "#555"
            : "#F7F4F6"
      return (
        <Flex
          {...extra}
          color={text_color}
          width="100%"
          height={50}
          bg="orange"
          justifyContent="left"
          onClick={
            v.disabled
              ? () => {
                  alert("この機能は準備中です！")
                }
              : v.onClick
                ? v.onClick(props)
                : setW
          }
          sx={{
            textDecoration: "none",
            borderBottom: border,
            cursor: "pointer",
            ":hover": {
              opacity: 0.75
            }
          }}
        >
          <Flex
            width={iconWidth}
            bg={v.color || "#198643"}
            justifyContent="center"
            alignItems="center"
          >
            {R.is(String, v.icon) ? (
              <img src={v.icon} width="25px" height="25px" />
            ) : (
              <Box as="i" className={v.awesome_icon} />
            )}
          </Flex>
          {text}
        </Flex>
      )
    }),
    R.filter(R.isNotNil)
  )(smenu)
  return { leftover, sidemenu }
}

const Nav = props => {
  const side_width = props.side_width || 250
  const tnum = (props.TMENU || []).length
  const def = { color: "#eee" }
  const [num, setNum] = useState(null)
  const bp = ["360px", "600px", "1010px", "1280px", "1600px", "1900px"]
  const bp2 = [0, 700, 1010]
  const checkBP = () => {
    let op = props.open
    let _bp = props.breakpoint
    props.setter(window.innerHeight, "height")
    return R.compose(
      R.tap(() => {
        const new_num = Math.floor(window.innerHeight / 50)
        if (num !== new_num) {
          props.setter(0, "cursor")
        }
        let sub = _bp === 1 || (_bp === 2 && !op) ? 50 : side_width
        if (!R.isNil(props.user)) {
          sub += 50
        }
        const topnum = Math.floor((window.innerWidth - sub) / 60)
        let showmore = false
        if (topnum < tnum) {
          showmore = true
        }
        if (props.showmore !== showmore) {
          props.setter(showmore, "showmore")
        }
        if (!showmore && props.catopen) {
          props.setter(false, "catopen")
        }
        const divnum = Math.ceil((tnum + 1) / Math.ceil((tnum + 1) / topnum))
        if (props.topnum !== topnum) {
          props.setter(topnum, "topnum")
        }
        if (props.divnum !== divnum) {
          props.setter(divnum, "divnum")
        }
        setNum(new_num)
        props.setPnum(op, _bp)
      }),
      R.when(R.complement(R.equals(props.breakpoint)), v => {
        props.setter(v * 1, "breakpoint")
        props.setter(false, "open")
        op = false
        _bp = v * 1
      }),
      R.length,
      R.takeWhile(R.gte(window.innerWidth))
    )(bp2)
  }
  useEventListener("resize", checkBP)
  useEffect(() => {
    checkBP()
  }, [])
  const onClick = () =>
    R.ifElse(R.includes(R.__, [null, 3]), R.alwaysNull, () => {
      props.setter(R.not(props.open), "open")
      props.setPnum(R.not(props.open), props.breakpoint)
    })(props.breakpoint)
  const menuWidth = props.open ? side_width : [0, 0, 50, side_width]
  const topleftWidth = props.open ? side_width : [50, 50, 50, side_width]
  const phWidth = props.open
    ? props.breakpoint === 1
      ? 0
      : props.breakpoint === 2
        ? 50
        : side_width
    : [0, 0, 50, side_width]
  const mask =
    props.catopen || (props.open && R.includes(props.breakpoint)([1, 2]))
      ? "block"
      : "none"
  const extra =
    props.breakpoint !== 3
      ? {
          cursor: "pointer",
          ":hover": {
            bg: "#333",
            color: "#eee"
          }
        }
      : {}
  const icon = R.includes(props.breakpoint)([null, 3]) ? (
    <Image
      src={props.title_logo || "/static/images/icon-128x128.png"}
      width="35px"
      height="35px"
    />
  ) : (
    <Box
      as="i"
      className={`fas fa-angle-double-${props.open ? "left" : "right"}`}
    />
  )
  const { leftover, sidemenu } = makeSide(num, props)
  let extraTop = []
  let many = Math.ceil((tnum + 1) / props.topnum)
  if (
    props.showmore &&
    props.catopen &&
    many > 1 &&
    !(props.breakpoint == 1 && props.open)
  ) {
    for (let i of R.range(0, many - 1)) {
      let islast = many === i + 2
      extraTop.push(
        <Flex
          height="50px"
          sx={{
            marginLeft:
              props.breakpoint === 1 || (props.breakpoint === 2 && !props.open)
                ? "50px"
                : `${side_width}px`,
            transitionPproperty: "width",
            transitionDuration: "0.5s"
          }}
        >
          <TopMenu
            chosen={props.chosen}
            islast={islast}
            index={i + 2}
            setter={props.setter}
            divnum={props.divnum}
            showmore={props.showmore}
            catopen={props.catopen}
            topnum={props.topnum}
            isScroll={props.isScroll}
            size={props.size}
            open={props.open}
            breakpoint={props.breakpoint}
            TMENU={props.TMENU}
            user={props.user}
          />
        </Flex>
      )
    }
  }
  return (
    <ThemeProvider theme={{ breakpoints: bp }}>
      <Box
        display={mask}
        height="100%"
        pt="50px"
        bg="#222"
        color="#eee"
        width="100%"
        sx={{
          zIndex: 99,
          opacity: 0.7,
          position: "fixed",
          top: 0,
          left: 0,
          cursor: "pointer"
        }}
        onClick={e => {
          props.setter(false, "open")
          props.setter(false, "catopen")
          props.setPnum(false, props.breakpoint)
        }}
      />
      <Flex>
        <Box
          width={menuWidth}
          color="#F7F4F6"
          bg={leftover}
          height="100%"
          sx={{
            zIndex: 100,
            left: 0,
            top: 0,
            position: "fixed",
            paddingTop: "50px",
            transitionPproperty: "width",
            transitionDuration: "0.5s",
            overflow: "hidden"
          }}
        >
          {sidemenu}
        </Box>
        <Box
          {...def}
          bg="#191919"
          height={50}
          width="100%"
          sx={{ left: 0, top: 0, position: "fixed", zIndex: 101 }}
        >
          <Flex height="100%">
            <Flex
              width={topleftWidth}
              bg="#191919"
              sx={{
                transitionPproperty: "width",
                transitionDuration: "0.5s",
                borderBottom: "#03414D 3px solid"
              }}
            >
              <Flex
                width={50}
                height={47}
                bg="#191919"
                justifyContent="center"
                alignItems="center"
                sx={extra}
                fontSize="25px"
                color="#F0ECD4"
                onClick={onClick}
              >
                {icon}
              </Flex>
              <Flex
                as="a"
                href="/"
                flex={1}
                height="100%"
                justifyContent="left"
                alignItems="center"
                sx={{ textDecoration: "none", whiteSpace: "nowrap" }}
              >
                <Text
                  fontSize={props.fontSize || "21px"}
                  fontWeight="bold"
                  px="5px"
                  color="#F0ECD4"
                >
                  <Box as="span" style={{ color: "#198643" }} mr={1}>
                    {props.pre_title || "Next"}
                  </Box>
                  <Box as="span" style={{ color: "#F0ECD4" }}>
                    {props.after_title || "Dapp"}
                  </Box>
                </Text>
              </Flex>
            </Flex>
            <TopMenu
              chosen={props.chosen}
              divnum={props.divnum}
              setter={props.setter}
              index={1}
              showmore={props.showmore}
              catopen={props.catopen}
              topnum={props.topnum}
              isScroll={props.isScroll}
              size={props.size}
              open={props.open}
              breakpoint={props.breakpoint}
              TMENU={props.TMENU}
              user={props.user}
            />
          </Flex>
          {extraTop}
        </Box>
      </Flex>
      <Flex>
        <Box
          width={phWidth}
          {...def}
          sx={{
            transitionPproperty: "width",
            transitionDuration: "0.5s"
          }}
        />
        <Box flex={1} pt="50px" id="main_area">
          <Box
            onClick={() => {
              props.setter(false, "showModal")
            }}
            height="100%"
            bg="rgba(0,0,0,0.75)"
            mt="50px"
            width={1}
            sx={{
              display: props.showModal ? "flex" : "none",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 98,
              cursor: "pointer"
            }}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              width={["300px", null, "500px"]}
              bg="white"
              ml={props.breakpoint === 3 || props.open ? `${side_width}px` : 0}
              sx={{
                borderRadius: "5px",
                position: "relative",
                cursor: "default"
              }}
              pt={4}
              px={3}
              pb={3}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <Box
                sx={{
                  textAlign: "right",
                  position: "absolute",
                  top: 0,
                  right: 0
                }}
                p={2}
                color="tomato"
              >
                <Box as="i" className="fas fa-home" />
              </Box>
              {props.modalContent}
            </Box>
          </Box>
          <Box
            onClick={() => {
              props.setter(false, "showModal_send")
            }}
            height="100%"
            bg="rgba(0,0,0,0.75)"
            mt="50px"
            width={1}
            sx={{
              display: props.showModal_send ? "flex" : "none",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 98,
              cursor: "pointer"
            }}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              width={["300px", null, "500px"]}
              bg="white"
              ml={props.breakpoint === 3 || props.open ? `${side_width}px` : 0}
              sx={{
                borderRadius: "5px",
                position: "relative",
                cursor: "default"
              }}
              pt={4}
              px={3}
              pb={3}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <Box
                sx={{
                  textAlign: "right",
                  position: "absolute",
                  top: 0,
                  right: 0
                }}
                p={2}
                color="tomato"
              >
                <Box as="i" className="fas fa-home" />
              </Box>
            </Box>
          </Box>
          {props.children}
        </Box>
      </Flex>
    </ThemeProvider>
  )
}
export default binder(
  Nav,
  [
    "user",
    "open",
    "breakpoint",
    "cursor",
    "catopen",
    "topnum",
    "divnum",
    "showmore",
    "showModal",
    "showModal_send",
    "modalContent",
    "eth_selected"
  ],
  ["login", "logout", "setter", "setPnum", "set"]
)
