"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.resolve = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _util = require("./util");

var _ramda = require("ramda");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var NodeRSA = require("node-rsa");

var resolve = function resolve(to) {
  return _path["default"].resolve(process.cwd(), to);
};

exports.resolve = resolve;

var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dist) {
    var overwrite,
        target_path,
        key,
        pub,
        pri,
        pub_compact,
        pri_compact,
        env_path,
        new_env,
        ex,
        lines,
        _iterator,
        _step,
        v,
        split,
        env_json_path,
        rsa,
        rsa_public,
        new_rsa,
        err_rsa,
        runtime_path,
        new_run_rsa,
        err_run_rsa,
        conf_json_path,
        new_conf_rsa,
        err_conf_rsa,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            overwrite = _args.length > 1 && _args[1] !== undefined ? _args[1] : false;
            target_path = _path["default"].resolve(dist);
            console.log(target_path);
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
            env_path = _path["default"].resolve(target_path, ".env");
            new_env = [];
            ex = false;

            if (_fsExtra["default"].existsSync(env_path)) {
              lines = _fsExtra["default"].readFileSync(env_path, "utf8").split("\n");
              _iterator = _createForOfIteratorHelper(lines || []);

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  v = _step.value;
                  split = v.split("=");

                  if (split[0] === "RSA_PRIVATE") {
                    ex = true;

                    if (overwrite === false) {
                      new_env.push(v);
                    }
                  } else {
                    new_env.push(v);
                  }
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }

            if (ex === false || overwrite === true) {
              new_env.push("RSA_PRIVATE=".concat(pri_compact));
            }

            _fsExtra["default"].writeFileSync(env_path, new_env.join("\n"));

            env_json_path = _path["default"].resolve(target_path, "firebase/functions/env.json");
            rsa = {
              "public": pub_compact,
              "private": pri_compact
            };
            rsa_public = {
              "public": pub_compact
            };
            new_rsa = {};
            err_rsa = null;

            if (_fsExtra["default"].existsSync(env_json_path)) {
              try {
                new_rsa = JSON.parse(_fsExtra["default"].readFileSync(env_json_path, "utf8"));
              } catch (e) {
                console.log(e);
                err_rsa = true;
              }
            }

            if (err_rsa === null) {
              if ((0, _ramda.isNil)(new_rsa.rsa) || overwrite) {
                new_rsa.rsa = rsa;
              }

              _fsExtra["default"].writeFileSync(env_json_path, JSON.stringify(new_rsa));
            }

            runtime_path = _path["default"].resolve(target_path, "firebase/functions/.runtimeconfig.json");
            new_run_rsa = {};
            err_run_rsa = null;

            if (_fsExtra["default"].existsSync(runtime_path)) {
              try {
                new_run_rsa = JSON.parse(_fsExtra["default"].readFileSync(runtime_path, "utf8"));
              } catch (e) {
                console.log(e);
                err_run_rsa = true;
              }
            }

            if (err_run_rsa === null) {
              if ((0, _ramda.isNil)(new_run_rsa.env)) {
                new_run_rsa.env = {};
              }

              if ((0, _ramda.isNil)(new_run_rsa.env.rsa) || overwrite) {
                new_run_rsa.env.rsa = rsa;
              }

              _fsExtra["default"].writeFileSync(runtime_path, JSON.stringify(new_run_rsa));
            }

            conf_json_path = _path["default"].resolve(target_path, "nd/conf.auto.json");
            new_conf_rsa = {};
            err_conf_rsa = null;

            if (_fsExtra["default"].existsSync(conf_json_path)) {
              try {
                new_conf_rsa = JSON.parse(_fsExtra["default"].readFileSync(conf_json_path, "utf8"));
              } catch (e) {
                console.log(e);
                err_conf_rsa = true;
              }
            }

            if (err_conf_rsa === null) {
              if ((0, _ramda.isNil)(new_conf_rsa.rsa) || overwrite) {
                new_conf_rsa.rsa = rsa_public;
              }

              _fsExtra["default"].writeFileSync(conf_json_path, JSON.stringify(new_conf_rsa));
            }

          case 35:
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