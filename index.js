const favicon = require('./fetchFavicon')
const Request = require('request')
const Async = require('async')

const Julie = (urls, callback) => {
  if (!urls) {
    callback(new Error('Need a URL or array of URLs in order to work'))
  } else {
    let funcs = [].concat(urls).map(url =>
      function(cb) {
        Request({
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2763.0 Safari/537.36'
          },
          url
        }, (err, response, body) => {

          if (err) {
            return callback(err)
          }

          if (!body.length) {
            callback(new Error('empty body recieved for ' + url + '. nothing to build from.'))
          }


          favicon({ url: response.request.uri.href, html: body}, cb)
        })
      }
    )

    Async.parallel(funcs, (e) => callback(e, console.log('finished')) );
  }
}

module.exports = Julie
