#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var path = require("path");

var argv = require("minimist")(process.argv.slice(2));

var _argv$_ = (0, _slicedToArray2["default"])(argv._, 3),
    cmd = _argv$_[0],
    name = _argv$_[1],
    namespace = _argv$_[2];

var _require = require("ramda"),
    or = _require.or,
    defaultTo = _require.defaultTo,
    equals = _require.equals,
    T = _require.T,
    cond = _require.cond,
    map = _require.map;

var cmds = [["keys", ["./", name === "overwrite"], "generateKeys"], ["create", [name, argv.template || argv.t]], ["refresh"], ["add", [name, namespace]], ["remove", [name, namespace]]];
cond([].concat((0, _toConsumableArray2["default"])(map(function (v) {
  return [equals(v[0]), function () {
    var _require2;

    return (_require2 = require("../lib/".concat(v[2] || v[0])))["default"].apply(_require2, (0, _toConsumableArray2["default"])(v[1] || []));
  }];
})(cmds)), [[T, function () {
  return or(argv.v, argv.version) ? console.log(require(path.resolve(__dirname, "../package.json")).version) : console.log("command not found: ".concat(cmd));
}]]))(cmd);