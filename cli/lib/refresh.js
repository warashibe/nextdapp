"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ramda = require("ramda");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _child_process = require("child_process");

var _util = require("./util");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var xNil = (0, _ramda.complement)(_ramda.isNil);

var makePlugins = function makePlugins() {
  var dirs = (0, _ramda.o)((0, _ramda.pluck)("name"), (0, _ramda.filter)(function (v) {
    return v.isDirectory();
  }))(_fsExtra["default"].readdirSync((0, _util.resolve)("nd/"), {
    withFileTypes: true
  }));
  var plugins = {};

  var _iterator = _createForOfIteratorHelper(dirs),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var v = _step.value;
      var nextdapp_json = (0, _util.resolve)("nd/".concat(v, "/nextdapp.json"));

      if (_fsExtra["default"].existsSync(nextdapp_json)) {
        plugins[v] = JSON.parse(_fsExtra["default"].readFileSync(nextdapp_json, "utf8"));
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return plugins;
};

var _default = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var json_path, plugins, package_path, js_path, props_path;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          json_path = (0, _util.resolve)("nd/.plugins.json");
          plugins = (0, _util.getPlugins)({
            json_path: json_path
          });
          console.log(plugins);
          plugins = makePlugins();
          package_path = (0, _util.resolve)("package.json");
          js_path = (0, _util.resolve)("nd/.nextdapp.js");
          props_path = (0, _util.resolve)("nd/.nextdapp-props.js");
          (0, _util.updateFuncs)({
            plugins: plugins,
            js_path: js_path
          });
          (0, _util.updateProps)({
            plugins: plugins,
            props_path: props_path
          });
          (0, _util.updatePlugins)({
            json: plugins,
            json_path: json_path
          });
          (0, _util.updateApis)({
            plugins: plugins
          });
          (0, _util.updateFunctions)({
            plugins: plugins
          });
          process.exit();

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

exports["default"] = _default;