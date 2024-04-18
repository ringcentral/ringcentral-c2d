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

## Get Start

### With webpack:

[webpack.config.js](./webpack.config.js)

```javascript
import { RingCentralC2D, WidgetEvents } from 'ringcentral-c2d';

const clickToDial = new RingCentralC2D();

clickToDial.widget.on(WidgetEvents.call, (phoneNumber) => {
    console.log('Click to Call:', phoneNumber);
});

clickToDial.widget.on(WidgetEvents.text, (phoneNumber) => {
    console.log('Click to Text:', phoneNumber);
});

// Stop
clickToDial.dispose();
```

### CDN

```html
<script src="https://unpkg.com/ringcentral-c2d@2.0.2/build/index.js"></script>
<script>
    var clickToDial = new RingCentralC2D();

    clickToDial.widget.on('call', function (phoneNumber) {
        console.log('Click to Call:', phoneNumber);
    });

    clickToDial.widget.on('text', function (phoneNumber) {
        console.log('Click to Text:', phoneNumber);
    });

    // Stop
    clickToDial.dispose();
</script>
```

### Advanced

Custom your own widget by referencing this sample code

[SampleWidget.ts](./src/widgets/SampleWidget/SampleWidget.ts)

```javascript
// Implement it by referencing sample code
class MyWidget {}

const myWidget = new MyWidget({
    // Any arguments your widget needs
});

// Bind any events as you need
myWidget.on('your-event-name', () => {
    // Your event handler
});

const clickToDial = new RingCentralC2D({
    widget: myWidget,
});

// Stop
clickToDial.dispose();
```
