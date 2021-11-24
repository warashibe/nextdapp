"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _default = function _default() {
  var json_path = _path["default"].resolve(process.cwd(), "nd/.plugins.json");

  if (!_fsExtra["default"].existsSync(json_path)) {
    console.error("Error: ".concat(json_path, " not found."));
    process.exit();
  } else {
    var plugins = JSON.parse(_fsExtra["default"].readFileSync(json_path, "utf-8"));

    for (var k in plugins) {
      console.log("@nextdapp/".concat(k));
    }
  }
};

exports["default"] = _default;