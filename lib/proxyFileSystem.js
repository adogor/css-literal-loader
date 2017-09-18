'use strict';

exports.__esModule = true;
exports.default = proxyFileSystem;
var uniq = require('lodash/uniq');

var withSyncMethod = function withSyncMethod(methods, name) {
  return [].concat(methods, [name, name + 'Sync']);
};

var TO_PROXY = ['exists', 'readFile', 'writeFile', 'stat', 'unlink', 'readlink'].reduce(withSyncMethod, []).concat(['createReadStream', 'createWriteStream']);

/**
 * Wrap the filesystem object so that fs actions on virtual files
 * are handled correctly
 */
function proxyFileSystem(realFs, virtualFs) {
  var proto = Object.getPrototypeOf(realFs);
  var fs = Object.create(proto);
  var proxiedMethods = { __isProxiedFileSystem: true };

  TO_PROXY.forEach(function (method) {
    proxiedMethods[method] = function proxy(path) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!virtualFs.existsSync(path)) {
        return realFs[method].apply(realFs, [path].concat(args));
      }

      if (!virtualFs[method]) {
        var err = new Error('[VirtualModulePlugin] unsupport method: `' + method + '`' + (' on virtual file: `' + path + '`.'));

        if (method.match(/Sync$/)) throw err;else return args.pop()(err);
      }
      return virtualFs[method].apply(virtualFs, [path].concat(args));
    };
  });

  proxiedMethods.readdirSync = function readdirSync(dirPath) {
    var virtualFiles = virtualFs.existsSync(dirPath) ? virtualFs.readdirSync(dirPath) : [];

    return uniq([].concat(realFs.readdirSync(dirPath), virtualFiles));
  };

  proxiedMethods.readdir = function readdir(dirPath, cb) {
    realFs.readdir(dirPath, function (err, realFiles) {
      if (err) return cb(err);

      var virtualFiles = virtualFs.existsSync(dirPath) ? virtualFs.readdirSync(dirPath) : [];

      return cb(null, uniq([].concat(realFiles, virtualFiles)));
    });
  };

  return Object.assign(fs, realFs, proxiedMethods);
}