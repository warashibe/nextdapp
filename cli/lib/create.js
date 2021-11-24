"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _commandExists = require("command-exists");

var _util = require("./util");

var _generateKeys = _interopRequireDefault(require("./generateKeys"));

var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dist) {
    var target_path, app_path, code;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            target_path = _path["default"].resolve(dist);

            if (!_fsExtra["default"].existsSync(target_path)) {
              _context.next = 6;
              break;
            }

            console.error("Error: directory exists.");
            process.exit();
            _context.next = 20;
            break;

          case 6:
            if ((0, _commandExists.sync)("git")) {
              _context.next = 11;
              break;
            }

            console.error("Error: git is not installed.");
            process.exit();
            _context.next = 20;
            break;

          case 11:
            app_path = "https://github.com/warashibe/next-dapp-bare.git";
            _context.next = 14;
            return (0, _util.spawnp)("git", ["clone", "--depth=1", app_path, target_path]);

          case 14:
            code = _context.sent;

            if (code !== 0) {
              console.error("clone error");
              process.exit();
            }

            _fsExtra["default"].copySync("".concat(target_path, "/nd/conf.sample.js"), "".concat(target_path, "/nd/conf.js"));

            console.log("Success: A next-dapp project has been created at ".concat(target_path, "."));
            (0, _generateKeys["default"])(dist, true);
            process.exit();

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;