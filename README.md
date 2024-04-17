# RingCentral Click To Dial library

[![NPM Version](https://img.shields.io/npm/v/ringcentral-c2d.svg?style=flat-square)](https://www.npmjs.com/package/ringcentral-c2d)

This library can help you to get phone numbers in web page and show a RingCentral Click-to-Call and Click-to-Text shortcut when hover on phone number text.

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

## Overview

This library mainly contains 3 parts
1. Matchers - For matching phone numbers in the provided page content
2. Observers - For watching any DOM changes of the page
3. Widgets - For injecting UI widgets for user to interact with


## Use

### With webpack:

[webpack.config.js](./webpack.config.js)

```javascript
import { RingCentralC2D, WidgetEvents } from 'ringcentral-c2d'; // require url-loader, sass-loader, css-loader

var clickToDial = new RingCentralC2D();

clickToDial.widget.on(WidgetEvents.call, (context) => {
    console.log('Click to Call:', context.phoneNumber);
});

clickToDial.widget.on(WidgetEvents.text, (context) => {
    console.log('Click to Text:', context.phoneNumber);
});

// Stop
clickToDial.dispose();
```

### CDN

```html
<script src="https://unpkg.com/ringcentral-c2d@2.0.0/build/index.js"></script>
<script>
    var clickToDial = new RingCentralC2D();

    clickToDial.widget.on('call', function (context) {
        console.log('Click to Call:', context.phoneNumber);
    });

    clickToDial.widget.on('text', function (context) {
        console.log('Click to Text:', context.phoneNumber);
    });

    // Stop
    clickToDial.dispose();
</script>
```
