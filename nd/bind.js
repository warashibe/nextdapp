import { bind } from "@nextdapp/core"
import { connect } from "react-redux"
import conf from "nd/conf"
import React from "react"

export default bind(connect, conf, React)
