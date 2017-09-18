'use strict';

var _path = require('path');

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _traverse = require('./traverse');

var _traverse2 = _interopRequireDefault(_traverse);

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

var _VirtualModulePlugin = require('./VirtualModulePlugin');

var _VirtualModulePlugin2 = _interopRequireDefault(_VirtualModulePlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function collectStyles(src) {
  var tagName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'css';

  var styles = [];

  // quick regex as an optimization to avoid parsing each file
  if (!src.match(new RegExp(tagName + '`([\\s\\S]*?)`', 'gmi'))) {
    return styles;
  }

  (0, _traverse2.default)(src, (0, _visitor2.default)(styles), { tagName: tagName });

  return styles;
}

function replaceStyleTemplates(src, styles) {
  var offset = 0;

  function splice(str, start, end, replace) {
    var result = str.slice(0, start + offset) + replace + str.slice(end + offset);

    offset += replace.length - (end - start);
    return result;
  }

  styles.forEach(function (_ref) {
    var start = _ref.start,
        end = _ref.end,
        path = _ref.path;

    src = splice(src, start, end, 'require(\'./' + (0, _path.basename)(path) + '\')');
  });

  return src;
}

var LOADER_PLUGIN = Symbol('loader added VM plugin');

module.exports = function loader(content) {
  if (this.cacheable) this.cacheable();

  var _ref2 = _loaderUtils2.default.getOptions(this) || {},
      tagName = _ref2.tagName,
      _ref2$extension = _ref2.extension,
      extension = _ref2$extension === undefined ? '.css' : _ref2$extension;

  var styles = collectStyles(content, tagName);

  if (!styles.length) return content;

  var basepath = (0, _path.join)((0, _path.dirname)(this.resource), (0, _path.basename)(this.resource, (0, _path.extname)(this.resource)));

  var compilation = this._compilation; // eslint-disable-line no-underscore-dangle
  var plugin = compilation[LOADER_PLUGIN];

  if (!plugin) {
    plugin = compilation[LOADER_PLUGIN] = _VirtualModulePlugin2.default.bootstrap(compilation);
  }

  styles.forEach(function (style, idx) {
    style.path = basepath + '__css_literal_loader_' + idx++ + extension;
    plugin.addFile(style.path, style.value);
  });

  return replaceStyleTemplates(content, styles);
};