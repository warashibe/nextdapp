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

var msgExit = function msgExit(msg) {
  var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  console.error("".concat(code === 0 ? "Success" : "Error", ": ").concat(msg));
  process.exit(code);
};

var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dist) {
    var target_path, app_path, code;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            target_path = _path["default"].resolve(dist);

            if (!_fsExtra["default"].existsSync(target_path)) {
              _context.next = 5;
              break;
            }

            msgExit("directory exists.", 1);
            _context.next = 17;
            break;

          case 5:
            if ((0, _commandExists.sync)("git")) {
              _context.next = 9;
              break;
            }

            msgExit("git is not installed.", 1);
            _context.next = 17;
            break;

          case 9:
            app_path = "https://github.com/warashibe/next-dapp-bare.git";
            _context.next = 12;
            return (0, _util.spawnp)("git", ["clone", "--depth=1", app_path, target_path]);

          case 12:
            code = _context.sent;
            if (code !== 0) msgExit("clone error");

            _fsExtra["default"].copySync("".concat(target_path, "/nd/conf.sample.js"), "".concat(target_path, "/nd/conf.js"));

            (0, _generateKeys["default"])(dist, true);
            msgExit("A next-dapp project has been created at ".concat(target_path, "."));

          case 17:
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