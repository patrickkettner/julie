const FS = require('fs');
const Url = require('url');
const Async = require('async');
const Cheerio = require('cheerio');
const Request = require('request');
const ImgType = require('image-type');
const Mime = require('mime-types').lookup;
const FileType = require('file-type');
const _flatten = require('lodash/flattenDeep');
const _filter = require('lodash/filter');

const imgInfo = (url, callback) => {

  Request.get(url)
    .on('error', err => {
        callback();
        return console.error(err || new Error('Response code for ' + url + ' was ' + response.statusCode));
    })
    .pipe(FS.createWriteStream(Url.parse(url).host + '-' + url.split('/').pop()))
}

const processAppConfig = (url, callback) => {

  Request.get({ url }, (err, response, body) => {

    if (err) {
      callback(err);
    }

    const $ = Cheerio.load(body);
    let appConfigIcons = [
      $('square70x70logo'),
      $('square150x150logo'),
      $('square310x310logo'),
      $('wide310x150logo')
    ];

    appConfigIcons = appConfigIcons
      .filter((arr) => arr.length)
      .map(($icon) => {

        const src = $icon.attr('src');
        let size = $icon.prop('tagName');
        size = size.toLowerCase().match(/\d+x\d+/)[0];

        return {
          sizes: size,
          src: src,
          type: Mime(src)
        };
      });

    callback(null, appConfigIcons);
  });
};

const icons = (obj, iconsCallback) => {

  const $ = Cheerio.load(obj.html);

  const favicon = $('[rel="shortcut icon"]').attr('href') || '/favicon.ico';
  const msAppConfig = $('[name=msapplication-config]').attr('content') || '/browserconfig.xml';
  const windowsTile = $('[name=msapplication-TileImage]').attr('content');
  const iosIcons = $('[rel=icon], [rel=apple-touch-icon], [rel=apple-touch-icon-precomposed]').map((i, elm) => ({
    href: $(elm).attr('href'),
    sizes: $(elm).attr('sizes')
  }));

  const processIcons = (icon, cb) => {
    return imgInfo(url, cb);
  };

  const toProcess = [{
    type: windowsTile,
    func: imgInfo
  }, {
    type: favicon,
    func: imgInfo
  }, {
    type: msAppConfig,
    func: processAppConfig
  }].filter((icon) => icon.type && icon.type.length);

  Async.parallel([
    (parallelCb) => {

      Async.map(toProcess, (iconType, cb) => {

        const url = Url.resolve(obj.url, iconType.type);
        iconType.func(url, cb);
      }, parallelCb);
    },
    (parallelCb) => {

      Async.map(iosIcons, processIcons, parallelCb);
    }
  ], (err, results) => {
    iconsCallback(err, _filter(_flatten(results)));
  });
};

module.exports = icons;
