var url = require("url");

module.exports = (urlx) => {
  let finalObj = {};
  // let urlArr = url.split('?');
  // let matches = urlArr[0].match(/^https:\/\/medium.com\/(.*)$/);
  // if (matches && matches.length) {
  //   finalObj.url = matches[1];
  // } else {
  //   // handle if there are no matches for the given url
  //   return false;
  // }
  // // handle query parsing
  // if(urlArr.length > 1){
  //   let paramsArr = urlArr[1].split('&');
  //   paramsArr = paramsArr.map(x => x.split('=')[0]);
  //   finalObj.queryList = paramsArr;
  // }
  // return finalObj;
  console.log(url.parse(urlx))
}