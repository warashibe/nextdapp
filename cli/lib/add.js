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

var xNil = (0, _ramda.complement)(_ramda.isNil);

var installPlugin = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref) {
    var name, namespace, param;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            name = _ref.name, namespace = _ref.namespace;
            _context.prev = 1;
            param = ["import", name, "--override"];

            if (xNil(namespace)) {
              param = (0, _ramda.concat)(param, ["-p", "nd/".concat(namespace)]);
            }

            _context.next = 6;
            return (0, _util.spawnp)("bit", param);

          case 6:
            console.log("".concat(name, " installed!"));
            _context.next = 13;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](1);
            console.error("install error: ".concat(_context.t0));
            process.exit();

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 9]]);
  }));

  return function installPlugin(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var installFunction = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref3) {
    var func_name, namespace, func_path, param;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            func_name = _ref3.func_name, namespace = _ref3.namespace;
            console.log("installing functions..." + func_name);
            func_path = (0, _util.resolve)("firebase/functions");
            _context2.prev = 3;
            param = ["import", func_name, "--override"];

            if (xNil(namespace)) {
              param = (0, _ramda.concat)(param, ["-p", "nd/".concat(namespace)]);
            }

            _context2.next = 8;
            return (0, _util.spawnp)("bit", param, {
              cwd: func_path
            });

          case 8:
            console.log("".concat(func_name, " installed!"));
            _context2.next = 15;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](3);
            console.error("install error: ".concat(_context2.t0));
            process.exit();

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 11]]);
  }));

  return function installFunction(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

var _default = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(_name) {
    var namespace,
        json_path,
        plugins,
        pre,
        name,
        func_name,
        components_path,
        package_path,
        js_path,
        props_path,
        json,
        core,
        _args3 = arguments;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            namespace = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : null;
            json_path = (0, _util.resolve)("nd/.plugins.json");
            plugins = (0, _util.getPlugins)({
              json_path: json_path
            });
            console.log(plugins);
            pre = (0, _util.getPre)(_name);
            name = (0, _util.modName)(_name);
            func_name = (0, _util.modFuncName)(_name);
            components_path = (0, _util.resolve)("nd/".concat(pre));
            package_path = (0, _util.resolve)("package.json");
            js_path = (0, _util.resolve)("nd/.nextdapp.js");
            props_path = (0, _util.resolve)("nd/.nextdapp-props.js");
            _context3.next = 13;
            return installPlugin({
              name: name,
              namespace: namespace
            });

          case 13:
            json = (0, _util.getJSON)({
              pre: pre,
              namespace: namespace
            });

            if (!xNil(json.functions)) {
              _context3.next = 17;
              break;
            }

            _context3.next = 17;
            return installFunction({
              func_name: func_name,
              namespace: namespace
            });

          case 17:
            core = json.core || false;
            plugins[pre] = (0, _ramda.mergeLeft)({
              name: name,
              key: pre,
              core: core,
              namespace: namespace
            }, json);
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

          case 25:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x3) {
    return _ref5.apply(this, arguments);
  };
}();

exports["default"] = _default;