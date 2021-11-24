"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var NodeRSA = require("node-rsa");

var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dist, overwrite) {
    var target_path, key, pub, pri, pub_compact, pri_compact, env_path, rsa, env;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            target_path = _path["default"].resolve(dist);
            key = new NodeRSA({
              b: 512
            });
            pub = key.exportKey("public");
            pri = key.exportKey("private");
            console.log();
            console.log(pub);
            pub_compact = pub.split("\n").slice(1, -1).join("\\n");
            console.log();
            console.log(pri);
            pri_compact = pri.split("\n").slice(1, -1).join("\\n");
            env_path = _path["default"].resolve(dist);

            _fsExtra["default"].writeFileSync(_path["default"].resolve(target_path, ".env"), "RSA_PRIVATE=".concat(pri_compact));

            rsa = {
              rsa: {
                "private": pri_compact,
                "public": pub_compact
              }
            };

            _fsExtra["default"].writeFileSync(_path["default"].resolve(target_path, "firebase/functions/env.json"), JSON.stringify(rsa));

            env = {
              env: rsa
            };

            _fsExtra["default"].writeFileSync(_path["default"].resolve(target_path, "firebase/functions/.runtimeconfig.json"), JSON.stringify(env));

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;