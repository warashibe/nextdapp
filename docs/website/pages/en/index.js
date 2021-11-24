const React = require("react")

const CompLibrary = require("../../core/CompLibrary.js")

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock
const rebass = require("rebass")
const hljs = require("highlight.js")
const code_1 = `import { bind } from "nd"
export default bind(({ count }) => {
  return <div>{ count }</div>
}, ["count"])
`
class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = "" } = this.props
    const { baseUrl, docsUrl } = siteConfig
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`
    const langPart = `${language ? `${language}/` : ""}`
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade" style={{ backgroundColor: "#A0F6D2" }}>
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    )

    const ProjectTitle = props => (
      <h2 className="projectTitle">
        {props.title}
        <small>{props.tagline}</small>
      </h2>
    )

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    )

    const Button = props => (
      <div
        className="pluginWrapper buttonWrapper"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    )

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_building_blocks_n0nc.svg `} />
        <div className="inner">
          <ProjectTitle tagline={siteConfig.tagline} title={siteConfig.title} />
          <PromoSection>
            <Button href={docUrl("quick-start")}>Quick Start</Button>
            <Button href={docUrl("nextdapp-cli")}>API Reference</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props
    const { baseUrl } = siteConfig
    const Block = props => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    )
    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: "center" }}
      >
        <h2>Simple, Quick and Scalable (D)App Development</h2>
        <MarkdownBlock>
          We have spent weeks after weeks to simplify notoriously complex state
          management and built a lightweight feature pluggable architecture to
          let developers save time and money to build the state of the art
          (d)apps.
        </MarkdownBlock>
        <pre
          style={{
            margin: "10px 30px",
            flex: 1,
            display: "inline-block"
          }}
        >
          <code
            style={{ padding: "20px" }}
            className="hljs"
            dangerouslySetInnerHTML={{
              __html: hljs.highlight(
                "bash",
                `nextdapp create myapp && cd myapp && yarn`
              ).value
            }}
          />
        </pre>
      </div>
    )
    const style = {
      code_title: {
        width: "100%",
        maxWidth: "600px",
        fontSize: "25px",
        marginBottom: "10px",
        fontWeight: "bold"
      }
    }
    const LearnHow = () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "40px",
          backgroundColor: "#f7f7f7",
          color: "#282A36",
          flexDirection: "column"
        }}
      >
        <div style={{ width: "100%", maxWidth: "700px" }}>
          <div style={style.code_title}>
            Lightweight Plugin Management with Bit
          </div>
          <pre style={{ margin: "0 30px 30px 10px", flex: 1 }}>
            <code
              style={{ padding: "20px" }}
              className="hljs"
              dangerouslySetInnerHTML={{
                __html: hljs.highlight("bash", `nextdapp add fb`).value
              }}
            />
          </pre>
          <div style={style.code_title}>Super Simple APIs ( Firestore )</div>
          <pre style={{ margin: "0 30px 30px 10px", flex: 1 }}>
            <code
              style={{ padding: "20px" }}
              className="hljs"
              dangerouslySetInnerHTML={{
                __html: hljs.highlight(
                  "javascript",
                  `import { useEffect } from "react"
import { bind } from "nd"

export default bind(
  ({ init }) => {
    const fn = init([ "initFB" ])
    useEffect(() => {
      fn.initFB().then(async ({ db }) => {
        console.log(await db.get("users"))
      })
    }, [])
    return <div>initFB</div>
  }
)
`
                ).value
              }}
            />
          </pre>
          <div style={style.code_title}>
            Even Easier Deployment with Vercel Now
          </div>
          <pre style={{ margin: "0 30px 30px 10px", flex: 1 }}>
            <code
              style={{ padding: "20px" }}
              className="hljs"
              dangerouslySetInnerHTML={{
                __html: hljs.highlight("bash", `now`).value
              }}
            />
          </pre>
        </div>
      </div>
    )

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content:
              "Next Dapp makes complex global state management out of the box and as simple and familier as humanly possible with the Facebook Official Recoil library with zero configuration.",
            image: `${baseUrl}img/undraw_connected_world_wuay.svg`,
            imageAlign: "top",
            title: "Global State Management"
          },
          {
            content:
              "Tracker reactively observes global states and executes complex async side-effect functions in a simple manner. Computed values are also out of the box thanks to Recoil Selectors.",
            image: `${baseUrl}img/undraw_process_e90d.svg`,
            imageAlign: "top",
            title: "Reactive Functions"
          },
          {
            content:
              "Bit based lightweigt plugin architechture brings good old tech such as Firestore, user management, CMS and the bleeding edge Web3 tech such as Blockchain and IPFS together to build next-gen apps in no time.",
            image: `${baseUrl}img/undraw_btc_p2p_lth5.svg`,
            imageAlign: "top",
            title: "Web2 + Web3 Plugins"
          }
        ]}
      </Block>
    )
    const tech = [
      { name: "React", img: "react.png", href: "https://reactjs.org/" },
      { name: "Recoil", img: "recoil.png", href: "https://recoiljs.org/" },
      { name: "Next.js", img: "nextjs.png", href: "https://nextjs.org/" },
      { name: "Ramda.js", img: "ramdajs.png", href: "https://ramdajs.com/" },
      { name: "Bit", img: "bit.png", href: "https://bit.dev/" },
      {
        name: "Firebase",
        img: "firebase.png",
        href: "https://firebase.google.com/"
      },
      { name: "Ethereum", img: "ethereum.png", href: "https://ethereum.org/" },
      { name: "IPFS", img: "ipfs.png", href: "https://ipfs.io/" }
    ]
    const Showcase = () => {
      return (
        <div className="productShowcaseSection">
          <h2 style={{ marginBottom: 0 }}>Core Technology Stack</h2>
          <div className="logos">
            {tech.map(v => (
              <div style={{ color: "#03414D" }}>
                <a href={v.href} target="_blank">
                  <img
                    src={`${baseUrl}img/${v.img}`}
                    style={{ paddingBottom: "0px" }}
                  />
                  <div>{v.name}</div>
                </a>
              </div>
            ))}
          </div>
          <div className="more-users" style={{ marginTop: "40px" }}>
            <a className="button" href="/next-dapp/docs/quick-start">
              Go To Tutorials
            </a>
          </div>
        </div>
      )
    }
    const tracker_code = `<Tracker
  name="state_tracker"
  watch={["stateA", "stateB"]}
  type="any"
  func={({ set, get }) => {
    set(get("stateA") * get("stateB"), "product")
  }}
  />`
    const bind_code = `import { bind } from "nd"
export default bind(
  ({ global_state, global_state2, computed_value, init }) => {
    const { global_function } = init()
    return <div onClick={global_function}>execute</div>
  },
  [
    "global_state",
    "global_state2",
    {
      global_function: ({ set }) => {
        set(3, "global_state")
      },
      computed_value: {
        get: ({ global_state, global_state2 }) => ({ get }) =>
          get(global_state)) + get(global_state2)
        
      }
    }
  ]
)`
    const Flex = rebass.Flex
    const Box = rebass.Box
    const Bind = () => (
      <Flex
        flexWrap="wrap"
        width={1}
        bg="#f7f7f7"
        justifyContent="center"
        alignItems="center"
        p="50px 30px"
      >
        <Box width={[1, 1, 1 / 2]}>
          <Box style={style.code_title} textAlign="center">
            Simply Bind Anything to Component
          </Box>
          <pre
            style={{
              margin: "0 30px",
              flex: 1,
              textAlign: "left"
            }}
          >
            <code
              style={{ padding: "20px" }}
              className="hljs"
              dangerouslySetInnerHTML={{
                __html: hljs.highlight("javascript", bind_code).value
              }}
            />
          </pre>
        </Box>
        <Box width={[1, 1, 1 / 2]} p="20px">
          <img src={`${baseUrl}img/diagram-1.png`} width="100%" />
        </Box>
      </Flex>
    )
    const Tracker = () => (
      <Flex
        flexWrap="wrap"
        width={1}
        bg="#fff"
        justifyContent="center"
        alignItems="center"
        p="50px 30px"
      >
        <Box width={[1, 1, 1 / 2]} order={[2, 2, 1]} p="20px">
          <img src={`${baseUrl}img/diagram-2.png`} width="100%" />
        </Box>
        <Box width={[1, 1, 1 / 2]} order={[1, 1, 2]}>
          <Box style={style.code_title} textAlign="center">
            Reactive Functions with Tracker
          </Box>
          <pre
            style={{
              margin: "0 30px",
              flex: 1,
              textAlign: "left"
            }}
          >
            <code
              style={{ padding: "20px" }}
              className="hljs"
              dangerouslySetInnerHTML={{
                __html: hljs.highlight("javascript", tracker_code).value
              }}
            />
          </pre>
        </Box>
      </Flex>
    )

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <Bind />
          <Tracker />
          <LearnHow />
          <Showcase />
        </div>
      </div>
    )
  }
}

module.exports = Index
