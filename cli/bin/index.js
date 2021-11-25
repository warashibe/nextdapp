#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _process$argv = (0, _slicedToArray2["default"])(process.argv, 5),
    cmd = _process$argv[2],
    name = _process$argv[3],
    namespace = _process$argv[4];

var _require = require("ramda"),
    defaultTo = _require.defaultTo,
    equals = _require.equals,
    T = _require.T,
    cond = _require.cond,
    map = _require.map;

var cmds = [["keys", ["./", name === "overwrite"], "generateKeys"], ["create", [name]], ["refresh"], ["add", [name, namespace]], ["remove", [name, namespace]]];
cond([].concat((0, _toConsumableArray2["default"])(map(function (v) {
  return [equals(v[0]), function () {
    var _require2;

    return (_require2 = require("../lib/".concat(v[2] || v[0])))["default"].apply(_require2, (0, _toConsumableArray2["default"])(v[1] || []));
  }];
})(cmds)), [[T, function () {
  return console.log("command not found: ".concat(cmd));
}]]))(cmd);