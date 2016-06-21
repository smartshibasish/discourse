const masterList = {};
const _whiteLists = {};

export default class WhiteLister {
  constructor(features) {
    features.default = true;

    this._featureKeys = Object.keys(features).filter(f => features[f]);
    this._key = this._featureKeys.join(':');
    this._features = features;
  }

  getWhiteList() {
    if (!_whiteLists[this._key]) {
      const tagList = {};
      let attrList = {};

      // merge whitelists for these features
      this._featureKeys.forEach(f => {
        const info = masterList[f] || {};
        Object.keys(info).forEach(t => {
          tagList[t] = [];
          attrList[t] = attrList[t] || {};

          const attrs = info[t];
          Object.keys(attrs).forEach(a => {
            attrList[t][a] = _.uniq((attrList[t][a] || []).concat(attrs[a]));
          });
        });
      });

      _whiteLists[this._key] = { tagList, attrList };
    }
    return _whiteLists[this._key];
  }
}

// Builds our object that represents whether something is sanitized for a particular feature.
export function whiteListFeature(feature, info) {
  const featureInfo = {};

  if (_.isString(info)) { info = [info]; }

  (info || []).forEach(tag => {
    const classes = tag.split('.');
    const tagName = classes.shift();
    const m = /\[([^\]]+)]/.exec(tagName);
    if (m) {
      const [full, inside] = m;
      const stripped = tagName.replace(full, '');
      const vals = inside.split('=');

      featureInfo[stripped] = featureInfo[stripped] || {};
      if (vals.length === 2) {
        const [name, value] = vals;
        featureInfo[stripped][name] = value;
      } else {
        featureInfo[stripped][inside] = '*';
      }
    }

    featureInfo[tagName] = featureInfo[tagName] || {};
    if (classes.length) {
      featureInfo[tagName]['class'] = _.uniq((featureInfo[tagName]['class'] || []).concat(classes));
    }
  });

  masterList[feature] = featureInfo;
}

// Only add to `default` when you always want your whitelist to occur. In other words,
// don't change this for a plugin or a feature that can be disabled
whiteListFeature('default', [
  'br',
  'p',
  'strong',
  'em',
  'blockquote',
  'div',
  'div.title',
  'div.quote-controls',
  'i',
  'b',
  'ul',
  'ol',
  'li',
  'small',
  'code',
  'span.mention',
  'span.hashtag',
  'span.excerpt',
  'aside.quote',
  'aside[data-*]',
  'a[name]',
  'a[target=_blank]',
  'a[rel=nofollow]',
  'a.attachment',
  'a.onebox',
  'a.mention',
  'a.mention-group',
  'a.hashtag',
  'a[name]',
  'a[data-bbcode]',
  'img[alt]',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
]);
