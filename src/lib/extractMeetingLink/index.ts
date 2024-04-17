export const meetingLinkCheckers = [
  // RCM
  /(https?:\/\/)?(meetings\.ringcentral\.com|zoom\.us|meetings-officeathand\.att\.com|meetings\.btcloudphone\.bt\.com|meetings\.businessconnect\.telus\.com)\/(j\/|join\?mid=)[0-9]*/i,
  // RCV
  /(https?:\/\/)?(((verizon\.)?(v\.ringcentral)|(meetings\.officeathand\.att)|(video\.(unifyoffice|cloudoffice\.avaya|rainbowoffice)))\.(com|ru|biz))(\/{1,2}\w+)*(\/{1,2}(\d+))(\?pw=\w{32})?/i,
];

export function extractMeetingLink(str = '') {
  for (const regex of meetingLinkCheckers) {
    const match = str.match(regex);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
}

/*
Numbers in url with 'meetings.ringcentral.com/j/'
Numbers in url with 'zoom.us/j/'
Numbers in url with 'meetings-officeathand.att.com/j/'
Numbers in url with 'meetings.btcloudphone.bt.com/j/'
Numbers in url with 'meetings.businessconnect.telus.com/j/'
Numbers starts and 148 or 149 and length = 10 digits
*/
