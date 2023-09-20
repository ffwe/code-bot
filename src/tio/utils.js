const pako = require('pako');

function deflate(arr) {
  return pako.deflateRaw(arr, {
    level: 9
  });
}

function inflate(arr) {
  return pako.inflateRaw(arr);
}

function encode(str) {
  const bytes = new TextEncoder('utf-8').encode(str);
  return deflate(bytes);
}

function arrToB64(arr) {
  const bytestr = arr.reduce((str, c) => str + String.fromCharCode(c), '');
  return Buffer.from(bytestr, 'binary').toString('base64').replace(/\+/g, '@').replace(/=+/, '');
}

function b64ToArr(str) {
  const decodedStr = Buffer.from(decodeURIComponent(str).replace(/@/g, '+'), 'base64').toString('binary');
  return new Uint8Array(decodedStr.split('').map(c => c.charCodeAt()));
}

function byteStringToByteArray(byteString) {
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) byteArray[i] = byteString.charCodeAt(i);
  byteArray.head = 0;
  return byteArray;
}

function textToByteString(string) {
  return unescape(encodeURIComponent(string));
}

function byteStringToText(string) {
  return decodeURIComponent(escape(string));
}

function byteArrayToByteString(byteArray) {
  return String.fromCharCode.apply(null, byteArray);
}

function byteStringToBase64(byteString) {
  return Buffer.from(byteString, 'binary').toString('base64').replace(/\+/g, '@').replace(/=+/, '');
}

module.exports = {
  deflate,
  inflate,
  encode,
  arrToB64,
  b64ToArr,
  byteStringToByteArray,
  textToByteString,
  byteStringToText,
  byteArrayToByteString,
  byteStringToBase64,
};
