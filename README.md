# RingCentral Click To Dial library

[![NPM Version](https://img.shields.io/npm/v/ringcentral-c2d.svg?style=flat-square)](https://www.npmjs.com/package/ringcentral-c2d)

This library can help you to get phone numbers in web page and show a RingCentral Click to Dial and Click to SMS shortcut when hover on phone number text.

![clicktodial](https://user-images.githubusercontent.com/7036536/51652788-d2627200-1fcb-11e9-8ba3-9e50baeaf8a6.png)

[See Demo](https://ringcentral.github.io/ringcentral-c2d/)

## Install

via npm

```
npm install ringcentral-c2d
```

via yarn

```
yarn add ringcentral-c2d
```

## Use

### With webpack:

```javascript
import { RingCentralC2D, C2DEvents } from 'ringcentral-c2d'; // require url-loader, sass-loader, css-loader, style-loader

var clickToDial = new RingCentralC2D();
clickToDial.on(C2DEvents.call, (phoneNumber) => {
    console.log('Click To Dial:', phoneNumber);
});
clickToDial.on(C2DEvents.text, (phoneNumber) => {
    console.log('Click To SMS:', phoneNumber);
});

// Stop
clickToDial.dispose();
```

** Notice **: It requires `style-loader`, `css-loader`, `sass-loader` and `url-loader`

```
yarn add style-loader css-loader sass-loader node-sass url-loader --dev
```

Webpack config for loadding style file:

```
// Add following into webpack config.module.rules
{
  test: /\.sass|\.scss/,
  use: [
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: `[path]_[name]_[local]_[hash:base64:5]`,
        },
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sassOptions: {
          includePaths: [path.resolve(__dirname, 'node_modules/ringcentral-c2d/lib/themes')], // path to load theme file
          outputStyle: 'extended'
        }
      },
    },
  ],
},
```

### CDN

```html
<script src="https://unpkg.com/ringcentral-c2d@1.0.0/build/index.js"></script>
<script>
    var clickToDial = new RingCentralC2D();
    clickToDial.on(RingCentralC2D.events.call, function(phoneNumber) {
        console.log('Click To Dial:', phoneNumber);
    });
    clickToDial.on(RingCentralC2D.events.text, function(phoneNumber) {
        console.log('Click To SMS:', phoneNumber);
    });

    // Stop
    clickToDial.dispose();
</script>
```
