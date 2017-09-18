'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = plugin;

var _fs = require('fs');

var _commonTags = require('common-tags');

var _path = require('path');

var _visitor = require('./visitor');

var _visitor2 = _interopRequireDefault(_visitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var idx = 0;
function createFilename(_ref, hostFile) {
  var _ref$extension = _ref.extension,
      extension = _ref$extension === undefined ? '.css' : _ref$extension;

  var basepath = (0, _path.join)((0, _path.dirname)(hostFile), (0, _path.basename)(hostFile, (0, _path.extname)(hostFile)));
  return basepath + '__' + idx++ + '_extracted_style' + extension;
}

function plugin() {
  var styles = [];

  return {
    visitor: _extends({}, (0, _visitor2.default)(styles, createFilename), {

      Program: {
        exit: function exit() {
          styles.forEach(function (_ref2) {
            var path = _ref2.path,
                value = _ref2.value;

            (0, _fs.writeFileSync)(path, (0, _commonTags.stripIndent)([value]));
          });
        }
      }
    })
  };
}