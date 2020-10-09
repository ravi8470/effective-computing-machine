require('dotenv').config();
const request = require('request-promise');
const cheerio = require('cheerio');
var urlx = require("url");
const UrlModel = require('./models/Url');
const InitiateMongoServer = require("./config/db.config");
const mongoose = require('mongoose');

InitiateMongoServer();


let customHeaders = {
  // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  // "Accept-Encoding": "gzip, deflate, br",
  // "Accept-Language": "en-US,en;q=0.9",
  // "Referer": "https://www.google.com/",
  // "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
  // "X-Amzn-Trace-Id": "Root=1-5f7e0a0a-2985fb1555c16b47700ed710"
}

const bootstrap = async () => {
  try {
    let urlQueue = [process.env.URL];
    initiateScrapping(urlQueue);
  } catch (err) {
    console.log('Err: ', err);
  }
};
bootstrap();


async function initiateScrapping(urlQueue) {
  try {
    // console.log('urlqueue was', urlQueue);
    let selectedUrls = urlQueue.splice(0, urlQueue.length > 5 ? 5 : urlQueue.length);
    // console.log('selected urls was', selectedUrls);
    await handleRequests(selectedUrls, urlQueue);
  } catch (err) {
    console.log(err);
    // mongoose.connection.close();
    // return;
  }
  // console.log('scrapping ends');
  if (urlQueue.length) {
    setTimeout(() => initiateScrapping(urlQueue), 3000 + Math.ceil((Math.random() * 10)) * 1000);
  } else {
    mongoose.connection.close();
  }
}



function handleRequests(selectedUrls, urlQueue) {
  return new Promise((resolve, reject) => {
    Promise.all(
      selectedUrls.map(x => request({
        url: x,
        headers: customHeaders,
        transform: function (body) {
          return cheerio.load(body);
        }
      }))
    ).then(async results => {
      // console.log('initial html urls responses received');
      for (let i = 0; i < results.length; i++) {
        await handleResponse(results[i], urlQueue);
      }
      // console.log('after all promises return');
      resolve(1);
    }).catch(err => {
      console.log('Err', err);
      reject(err)
    })
  })
}


async function handleResponse($, urlQueue) {
  return new Promise(async (resolve, reject) => {
    try {
      let links = $('a');
      let urls = [];
      $(links).each((i, link) => {
        urls.push($(link).attr('href'));
      });
      // console.log('All URLS AT THIS STEP:::', urls);
      let results = [];
      for (let i = 0; i < urls.length; i++) {
        await handleSingleUrl(urls[i], urlQueue, i);
      }
      // console.log('returning from handle response');
      resolve(results);
    } catch (err) {
      console.log('err', err);
      reject(err);
    }
  })
}


async function handleSingleUrl(url, urlQueue, index) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log('inside handle single--', index)
      let urlObj = urlx.parse(url);
      if (urlObj && urlObj.hostname && urlObj.hostname.includes(process.env.FILTER_URL) &&
        urlObj.protocol === 'https:') {
        // console.log('inside if--', index);
        let tempObj = {};
        tempObj.url = urlObj.href;
        tempObj.refCount = 1;
        urlObj.query && (tempObj.queryList = urlObj.query.split('&').map(x => x.split('=')[0]))
        tempObj.host = urlObj.hostname.toString();
        tempObj.path = urlObj.pathname.toString();
        // console.log('before find one --', index)
        let findUrl = await UrlModel.findOne({
          host: tempObj.host,
          path: tempObj.path,
        }).lean();
        // console.log('after find one --', index, findUrl);
        if (findUrl) {
          // console.log('url found in db--', index, findUrl);
          let queryListArr = [];
          findUrl.queryList && (queryListArr = queryListArr.concat(findUrl.queryList));
          tempObj.queryList && (queryListArr = queryListArr.concat(tempObj.queryList));
          let updateObj = {
            refCount: findUrl.refCount + 1
          };
          // console.log('queryListArr::--', index, queryListArr);
          queryListArr.length && (updateObj.queryList = [...new Set([...queryListArr])]);
          // console.log('Updating, updateObj is : --', index, updateObj)
          await UrlModel.updateOne({ _id: findUrl._id.toString() }, updateObj);
          // console.log('updated url--', index);
        } else {
          // if not exists in db then add and alos add to another queue which holds all urls yet to be crawled
          // console.log('url not found pushing--', index, tempObj.url);
          urlQueue.push(tempObj.url);
          await UrlModel.create(tempObj);
          // console.log('new url pushed--', index)
        }
      }
      // console.log('resolving ----', index)
      resolve(1);
    } catch (err) {
      console.log('Err:',err);
      reject(err);
    }
  })
}