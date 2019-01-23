# RingCentral Click To Dial library

This library can help you to get phone numbers in web page and show a RingCentral Click to Dial and Click to SMS shotcut when hover on phone number text.

[See Demo](https://embbnux.github.io/ringcentral-c2d/)

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

```
import RingCentralC2DInject from 'ringcentral-c2d';
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
<script src="https://unpkg.com/libphonenumber-js@1.7.7/bundle/libphonenumber-min.js"></script>
<script src="https://unpkg.com/ringcentral-c2d@0.0.1/build/index.js"></script>
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
