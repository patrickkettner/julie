#Julie
### These are a few of my favicon things

stupid simple way to downlaod favicons from a URL or set of URLs

```js
const Julie = require('julie')

// single icon
Julie('https://google.com')

// for multmultiple domains, just pass an array
Julie(['https://google.com', 'https://hulu.com'])
```

icons are downloaded to the current directory

supported icon types are favicons, link rel=shortcuts, Windows image tiles, apple-shortcut-icons and apple-touch-icon-precomposed
