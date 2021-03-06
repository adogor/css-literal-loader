import { join, dirname, extname, basename } from 'path';
import loaderUtils from 'loader-utils';

import traverse from './traverse';
import visitor from './visitor';
import VirtualModulePlugin from './VirtualModulePlugin';

function collectStyles(src, tagName = 'css') {
  const styles = [];

  // quick regex as an optimization to avoid parsing each file
  if (!src.match(new RegExp(`${tagName}\`([\\s\\S]*?)\``, 'gmi'))) {
    return styles;
  }

  traverse(src, visitor(styles), { tagName });

  return styles;
}

function replaceStyleTemplates(src, styles) {
  let offset = 0;

  function splice(str, start, end, replace) {
    const result = (
      str.slice(0, start + offset) + replace + str.slice(end + offset)
    );

    offset += replace.length - (end - start);
    return result;
  }

  styles.forEach(({ start, end, path }) => {
    src = splice(src, start, end, `require('./${basename(path)}')`);
  });

  return src;
}

const LOADER_PLUGIN = Symbol('loader added VM plugin');


module.exports = function loader(content) {
  if (this.cacheable) this.cacheable();


  const { tagName, extension = '.css' } = loaderUtils.getOptions(this) || {};
  
  const styles = collectStyles(content, tagName);

  if (!styles.length) return content;

  const basepath = join(
    dirname(this.resource),
    basename(this.resource, extname(this.resource))
  );

  const compilation = this._compilation; // eslint-disable-line no-underscore-dangle
  let plugin = compilation[LOADER_PLUGIN];

  if (!plugin) {
    plugin = compilation[LOADER_PLUGIN] =
      VirtualModulePlugin.bootstrap(compilation);
  }

  styles.forEach((style, idx) => {
    style.path = `${basepath}__css_literal_loader_${idx++}${extension}`;
    plugin.addFile(style.path, style.value);
  });

  return replaceStyleTemplates(content, styles);
};
