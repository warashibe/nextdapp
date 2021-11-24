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

var _commandExists = require("command-exists");

var _util = require("./util");

var xNil = (0, _ramda.complement)(_ramda.isNil);

var uninstallPlugin = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref) {
    var pre;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pre = _ref.pre;
            _context.prev = 1;
            _context.next = 4;
            return (0, _util.spawnp)("bit", ["remove", pre, "-s"]);

          case 4:
            console.log("".concat(pre, " uninstalled!"));
            _context.next = 11;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](1);
            console.error("uninstall error: ".concat(_context.t0));
            process.exit();

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 7]]);
  }));

  return function uninstallPlugin(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var uninstallFunction = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref3) {
    var pre, func_path;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pre = _ref3.pre;
            func_path = (0, _util.resolve)("firebase/functions");
            _context2.prev = 2;
            _context2.next = 5;
            return (0, _util.spawnp)("bit", ["remove", pre, "-s"], {
              cwd: func_path
            });

          case 5:
            console.log("".concat(pre, " uninstalled!"));
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](2);
            console.error("uninstall error: ".concat(_context2.t0));
            process.exit();

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 8]]);
  }));

  return function uninstallFunction(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var _default = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(name, namespace) {
    var json_path, plugins, pre, components_path, package_path, js_path, props_path, json;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            json_path = (0, _util.resolve)("nd/.plugins.json");
            plugins = (0, _util.getPlugins)({
              json_path: json_path
            });
            console.log(plugins);
            pre = (0, _util.getPre)(name);
            name = (0, _util.modName)(name);
            delete plugins[pre];
            components_path = (0, _util.resolve)("nd/".concat(pre));
            package_path = (0, _util.resolve)("package.json");
            js_path = (0, _util.resolve)("nd/.nextdapp.js");
            props_path = (0, _util.resolve)("nd/.nextdapp-props.js");
            json = (0, _util.getJSON)({
              pre: pre,
              namespace: namespace
            });
            (0, _util.updateFuncs)({
              plugins: plugins,
              js_path: js_path
            });
            (0, _util.updateProps)({
              plugins: plugins,
              props_path: props_path
            });
            _context3.next = 15;
            return uninstallFunction({
              pre: pre,
              namespace: namespace
            });

          case 15:
            _context3.next = 17;
            return uninstallPlugin({
              pre: pre,
              namespace: namespace
            });

          case 17:
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

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x3, _x4) {
    return _ref5.apply(this, arguments);
  };
}();

exports["default"] = _default;