# RingCentral Click To Dial library

This library can help you to get phone numbers in web page and show a RingCentral Click to Dial and Click to SMS shortcut when hover on phone number text.

![clicktodial](https://user-images.githubusercontent.com/7036536/51652788-d2627200-1fcb-11e9-8ba3-9e50baeaf8a6.png)

[See Demo](https://ringcentral.github.io/ringcentral-c2d/)

## Install

via npm

```
npm install ringcentral-c2d libphonenumber-js
```

via yarn

```
yarn add ringcentral-c2d libphonenumber-js
```

## Use

### With webpack:

```
import RingCentralC2DInject from 'ringcentral-c2d';
import 'ringcentral-c2d/build/styles.css';

var clickToDialInject = new RingCentralC2DInject({
  onCallClick: (phoneNumber) => {
    console.log('Click To Dial:', phoneNumber);
  },
  onSmsClick: (phoneNumber) => {
    console.log('Click To SMS:', phoneNumber);
  }
})
```

### CDN

```
<link href="https://unpkg.com/ringcentral-c2d@0.0.2/build/styles.css" rel="stylesheet">
<script src="https://unpkg.com/libphonenumber-js@1.7.7/bundle/libphonenumber-min.js"></script>
<script src="https://unpkg.com/ringcentral-c2d@0.0.2/build/index.js"></script>
<script>
  var clickToDialInject = new RingCentralC2DInject({
    onCallClick: function (phoneNumber) {
      console.log('Click To Dial:', phoneNumber);
    },
    onSmsClick: function (phoneNumber) {
      console.log('Click To SMS:', phoneNumber);
    }
  })
</script>
```
