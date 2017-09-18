'use strict';

exports.__esModule = true;
exports.default = traverse;

var _babylon = require('babylon');

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildCodeFrameError(node, message, Error) {
  // eslint-disable-next-line no-underscore-dangle
  var loc = node && (node.loc || node._loc);
  if (loc) {
    return new Error(message + ' (' + loc.start.line + ':' + loc.start.column + ')');
  }
  return new Error(message);
}

function parseSource(src) {
  return (0, _babylon.parse)(src, {
    sourceType: 'module',
    plugins: ['typescript', 'asyncFunctions', 'jsx', 'classConstructorCall', 'doExpressions', 'trailingFunctionCommas', 'objectRestSpread', 'decorators', 'classProperties', 'exportExtensions', 'exponentiationOperator', 'asyncGenerators', 'functionBind', 'functionSent']
  });
}

function traverse(source, visitors, opts) {
  var ast = parseSource(source);
  // https://github.com/babel/babel/issues/4640
  var hub = new _babelTraverse.Hub({ buildCodeFrameError: buildCodeFrameError });
  var path = _babelTraverse.NodePath.get({
    hub: hub,
    parentPath: null,
    parent: ast,
    container: ast,
    key: 'program'
  });

  return (0, _babelTraverse2.default)(ast, visitors, path.setContext().scope, { opts: opts });
}