// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let URL = 'http://{url_server_host}'
let REPORT_URL = 'http://localhost:2000'
let RE_SET_USER_AGENT = null;

// handle msg from tab or background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(sender.tab){
          if(request.type == 'GET'){
              let param = new URLSearchParams(request.data).toString();
              fetch(URL + request.url+ '?' + param)
                  .then(response => response.json())
                  .then(response => sendResponse(response))
                  .catch(error => sendResponse({err: error}))
              return true;
          }
          if(request.type == 'COMMENT'){
              let param = new URLSearchParams(request.data).toString();
              fetch(request.url+ '?' + param)
                  .then(response => response.json())
                  .then(response => sendResponse(response))
                  .catch(error => sendResponse({err: error}))
              return true;
          }
          else if(request.type == 'POST'){
              fetch(URL + request.url,
                  {
                      method: 'POST',
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(request.data)
                  })
                  .then(response => response.json())
                  .then(response => sendResponse(response))
                  .catch(error => sendResponse({err: error}))
              return true;
          }
          else if (request.type == 'CLEAR_BROWSER_DATA') {
            clearBrowserData().then(rs => {
                sendResponse(rs)
            })
            return true
          }
          else if(request.type == 'SET_USER_AGENT'){ // trong code
            RE_SET_USER_AGENT = request.user_agent;
          }
          else if (request.type == 'CLOSE_ADS_TAB') {
            closeAdsTabs()
          }
          else if (request.type == 'GET_TOTAL_TABS') {
            getTotalTabs().then(rs => {
                sendResponse(rs)
            })
            return true
          }
          else if (request.type == 'CLOSE_OLD_TABS') {
            closeOldTabs()
          }
          else{
              if(request.data.stop){
                    closeBrowser()
              }
              let param = new URLSearchParams(request.data).toString();
              fetch(REPORT_URL + request.url+ '?' + param)
                  .then(response => response.json())
                  .then(response => sendResponse(response))
                  .catch(error => sendResponse({err: error}))
              return true;
          }
      }
    });

function clearBrowserData () {
    return new Promise((res, rej) => {
        chrome.browsingData.remove({
         //"since": 1000
        }, {
            "appcache": false,
            "cache": true,
            "cacheStorage": false,
            "cookies": false,
            "downloads": true,
            "fileSystems": false,
            "formData": false,
            "history": true,
            "indexedDB": false,
            "localStorage": false,
            "passwords": false,
            "serviceWorkers": false,
            "webSQL": false
        }, function () {
            res(true)
        });
    })
}

function closeBrowser(){
    chrome.storage.sync.set({action: {}})
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.remove(tabs[i].id);
        }
    });
}

function closeOldTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (var i = tabs.length - 1; i >= 0; i--) {
            if (tabs[i].active) {
                if (tabs[i].url.indexOf('localhost') == -1) {
                    chrome.tabs.remove(tabs[i].id);
                    closeOldTabs()
                    break;
                }
            } else {
                chrome.tabs.remove(tabs[i].id);
            }
        }
    });
}

function closeAdsTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            if (i > 0) {
                chrome.tabs.remove(tabs[i].id);
            }
        }
    });
}

function getTotalTabs () {
    return new Promise((res, rej) => {
        chrome.tabs.query({}, function (tabs) {
            res(tabs.length)
        });
    })
}

// trong code
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (RE_SET_USER_AGENT) {}
        return {requestHeaders: details.requestHeaders};
}, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders']);

// var CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';
// chrome.webRequest.onBeforeSendHeaders.addListener(
//     function(details) {
//         for (var i = 0; i < details.requestHeaders.length; ++i) {
//             if (details.requestHeaders[i].name === 'User-Agent') {
//                 details.requestHeaders[i].value = CHROME_USER_AGENT;
//                 break;
//             }
//         }
//         return {requestHeaders: details.requestHeaders};
//     }, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders']);

// check report time
setInterval(_=> {
    chrome.storage.sync.get('action', function(data) {
        try{
            if(Date.now() - data.action.lastReport > 5*60*1000){
                let report = {pid: data.action.pid,id: data.action.id, status: 0, stop: true, msg: 'TIMEOUT'}
                let param = new URLSearchParams(report).toString();
                fetch(REPORT_URL + request.url+ '?' + param).catch(error => console.log('error',error))
                closeBrowser()
            }
        }
        catch (e) {
            console.log(e)
        }
    })
},60000)

chrome.webRequest.onAuthRequired.addListener(
    function(details, callbackFn) {
        console.log("onAuthRequired!", details, callbackFn);
        chrome.storage.sync.get('action', function(data) {
            callbackFn({
                authCredentials: {username: data.action.proxy_username, password: data.action.proxy_password}
            });
        })
    },
    {urls: ["<all_urls>"]},
    ['asyncBlocking']
);