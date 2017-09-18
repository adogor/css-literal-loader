'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _proxyFileSystem = require('./proxyFileSystem');

var _proxyFileSystem2 = _interopRequireDefault(_proxyFileSystem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VirtualModulePlugin = function () {
  /**
   * Apply an instance of the plugin to compilation.
   * helpful for adding the plugin inside a loader.
   */
  VirtualModulePlugin.bootstrap = function bootstrap(compilation, files) {
    var compiler = compilation.compiler;

    var plugin = new VirtualModulePlugin(files);

    plugin.augmentCompilerFileSystem(compiler);
    compilation.inputFileSystem = compiler.inputFileSystem;

    return plugin;
  };

  function VirtualModulePlugin(files) {
    var _this = this;

    _classCallCheck(this, VirtualModulePlugin);

    this.addFile = function (virtualPath, content) {
      _this.fs.mkdirpSync(_path2.default.dirname(virtualPath));
      _this.fs.writeFileSync(virtualPath, content);
    };

    this.fs = new _memoryFs2.default();

    if (files) {
      Object.keys(files).forEach(function (key) {
        _this.addFile(key, files[key]);
      });
    }
  }

  VirtualModulePlugin.prototype.augmentCompilerFileSystem = function augmentCompilerFileSystem(compiler) {
    if (this.augmented === true) {
      return;
    }

    var fs = (0, _proxyFileSystem2.default)(compiler.inputFileSystem, this.fs);

    compiler.inputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;
    compiler.resolvers.loader.fileSystem = fs;
    this.augmented = true;
  };

  VirtualModulePlugin.prototype.apply = function apply(compiler) {
    var _this2 = this;

    // if the fs is already present then immediately augment it
    if (compiler.inputFileSystem) {
      this.augmentCompilerFileSystem(compiler);
    }

    compiler.plugin('compile', function () {
      _this2.augmentCompilerFileSystem(compiler);
    });

    // Augment the loader context so that loaders can neatly
    // extract source strings to virtual files.
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('normal-module-loader', function (loaderContext) {
        loaderContext.emitVirtualFile = _this2.addFile;
      });
    });
  };

  return VirtualModulePlugin;
}();

exports.default = VirtualModulePlugin;