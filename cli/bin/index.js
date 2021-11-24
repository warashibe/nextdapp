#!/usr/bin/env node
"use strict";

var command = process.argv[2];
var name = process.argv[3];
var namespace = process.argv[4];

var remove = require("../lib/remove")["default"];

var add = require("../lib/add")["default"];

switch (command) {
  case "keys":
    var keys = require("../lib/generateKeys")["default"];

    keys("./", name === "overwrite");
    break;

  case "create":
    var create = require("../lib/create")["default"];

    create(name);
    break;

  case "refresh":
    var refresh = require("../lib/refresh")["default"];

    refresh();
    break;

  case "add":
    add(name, namespace);
    break;

  case "remove":
    remove(name, namespace);
    break;

  default:
    console.log("command not found");
}