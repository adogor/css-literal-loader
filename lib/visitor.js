'use strict';

exports.__esModule = true;
exports.default = cssLiteralVisitor;

var _path = require('path');

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var buildImport = (0, _babelTemplate2.default)('require(FILENAME);');

function cssLiteralVisitor() {
  var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var getFilename = arguments[1];

  return {
    TaggedTemplateExpression: function TaggedTemplateExpression(path, _ref) {
      var opts = _ref.opts,
          file = _ref.file;
      var _opts$tagName = opts.tagName,
          tagName = _opts$tagName === undefined ? 'css' : _opts$tagName;

      var node = path.node;

      if (node.tag.name !== tagName || !path.scope.hasGlobal(tagName)) {
        return;
      }

      var parseError = path.buildCodeFrameError('Could not evaluate css. inline css must be statically analyzable');

      var start = node.start,
          end = node.end;

      // remove the tag and evaluate as a plain template;

      path.replaceWith(node.quasi);

      var _path$evaluate = path.evaluate(),
          confident = _path$evaluate.confident,
          value = _path$evaluate.value;

      if (!confident) {
        throw parseError;
      }

      var style = { value: value, start: start, end: end };

      if (getFilename) {
        var hostFile = file.opts.filename;
        style.path = getFilename(opts, hostFile);

        var filename = (0, _path.relative)((0, _path.dirname)(hostFile), style.path);

        if (!filename.startsWith('.')) {
          filename = './' + filename;
        }

        path.replaceWith(buildImport({ FILENAME: t.StringLiteral(filename) }) // eslint-disable-line new-cap
        );
      }

      styles.push(style);
    }
  };
}