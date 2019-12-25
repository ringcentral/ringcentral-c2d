export function convertToInline(dataURL: string): string {
  if (dataURL.indexOf('base64') > -1) {
    return atob(dataURL.split('base64,')[1]);
  }
  return '';
}
