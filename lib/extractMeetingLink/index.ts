export const meetingLinkCheckers = [
  /(https?:\/\/)?(meetings\.ringcentral\.com|zoom\.us|meetings-officeathand\.att\.com|meetings\.btcloudphone\.bt\.com|meetings\.businessconnect\.telus\.com)\/(j\/|join\?mid=)[0-9]*/i,
];

export function extractMeetingLink(str: string = ''): string {
  for (const regex of meetingLinkCheckers) {
    const match = str.match(regex);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
}
