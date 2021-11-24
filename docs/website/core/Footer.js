/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react")

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    const docsUrl = this.props.config.docsUrl
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`
    const langPart = `${language ? `${language}/` : ""}`
    return `${baseUrl}${docsPart}${langPart}${doc}`
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + (language ? `${language}/` : "") + doc
  }

  render() {
    let contributors = [
      {
        login: "ocrybit",
        avatar_url: "https://avatars3.githubusercontent.com/u/40726926?s=35"
      },
      {
        login: "youxiberlin",
        avatar_url: "https://avatars0.githubusercontent.com/u/7786031?s=35"
      },
      {
        login: "dmamira",
        avatar_url: "https://avatars1.githubusercontent.com/u/49590399?s=35"
      },
      {
        login: "hoosan",
        avatar_url: "https://avatars1.githubusercontent.com/u/40290137?s=35"
      }
    ]
    contributors.sort(() => Math.random() - 0.5)

    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl("quick-start")}>Quick Start</a>
            <a href={this.docUrl("plugins")}>Plugins</a>
            <a href={this.docUrl("todo-app")}>Todo App Example</a>
            <a href={this.docUrl("nextdapp-cli")}>API Reference</a>
            <a href={this.docUrl("troubleshoot")}>Troubleshooting</a>
            <a href={this.docUrl("updates")}>Updates</a>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href="https://discord.com/invite/MvSsm8x"
              target="_blank"
              rel="noreferrer noopener"
            >
              Discord
            </a>
            <h5 style={{ marginTop: "20px" }}>Contributors</h5>
            {contributors.map(v => (
              <a
                style={{
                  display: "inline-block",
                  margin: "5px 7px"
                }}
                href={`https://github.com/${v.login}`}
                target="_blank"
                rel="noreferrer noopener"
                title={v.login}
              >
                <img
                  src={v.avatar_url}
                  style={{ width: "35px", height: "35px", borderRadius: "50%" }}
                />
              </a>
            ))}
          </div>
          <div>
            <h5>More</h5>
            <a href="https://blog.warashibe.market" target="_blank">
              Blog
            </a>
            <a href="https://bit.dev/warashibe/nextdapp">Bit Plugins</a>
            <a href="https://github.com/warashibe/next-dapp">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/facebook/docusaurus/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
            {this.props.config.twitterUsername && (
              <div className="social">
                <a
                  href={`https://twitter.com/${this.props.config.twitterUsername}`}
                  className="twitter-follow-button"
                >
                  Follow @{this.props.config.twitterUsername}
                </a>
              </div>
            )}
            {this.props.config.facebookAppId && (
              <div className="social">
                <div
                  className="fb-like"
                  data-href={this.props.config.url}
                  data-colorscheme="dark"
                  data-layout="standard"
                  data-share="true"
                  data-width="225"
                  data-show-faces="false"
                />
              </div>
            )}
          </div>
        </section>
        <section className="copyright">
          <a
            target="_blank"
            href="https://warashibe.market"
            style={{ color: "inherit" }}
          >
            {this.props.config.copyright}
          </a>
        </section>
      </footer>
    )
  }
}

module.exports = Footer
