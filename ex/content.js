'use strict';

let action
let checkMiniPlayerRef
var windowWide
var mobileMenuBarHeight
var menuBarWidth
var zoom
var isNonUser = false
var isRunBAT = false

var widthCustom = 0
var heightCustom = 0
var IS_MOBILE = false
const APP_URL = 'http://localhost:8080/#'
async function loadPage(){
    try{
       // await sleep(4000)
        await initAction()
        checkMiniPlayer(action)
        console.log('loadPage',action.id, action.pid)
        await runAction(action)
    }
    catch (e) {
        console.log('error',e)
    }
}

let lastChange
window.addEventListener('load', _ => {
    console.log('load');
    lastChange = Date.now()
    loadPage()
})

let oldURL = "";
function checkURLchange(currentURL){
    if(currentURL.split('?')[0] != oldURL.split('?')[0] && lastChange && Date.now() - lastChange > 3000){
        console.log('oldURL:',oldURL,'currentURL:',currentURL,lastChange,Date.now())
        console.log('url changed:',currentURL)
        
        oldURL = currentURL;
        lastChange = Date.now()
        loadPage()
    }
    else if(currentURL.split('?')[0] != oldURL.split('?')[0] && lastChange && Date.now() - lastChange < 3000){
        oldURL = currentURL
        lastChange = Date.now()
    }
    else{
        oldURL = currentURL
    }
}

setInterval(function() {
    checkURLchange(window.location.href);
}, 1000);

async function initAction(){
    if(window.location.toString().indexOf('localhost') > -1){
        // closeTabs()
        let url = new URL(window.location.href);
        action = {id: 'admin_test', pid: 1}//JSON.parse(url.searchParams.get("data"))

        action.lastRequest = Date.now()
        initSettingData(action)
        await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

        await initActionData(action)
        
        await sleep(5000)
    }
    else{
        let data = await getActionData()
        action = data.action
        initSettingData(action) 

        console.log('action:',action)
    }
}

function initSettingData (action) {
    zoom = action.zoom || 1
}

function checkMiniPlayer(action){
    if(!checkMiniPlayerRef){
        console.log('INFO','checkMiniPlayer')
        checkMiniPlayerRef = setInterval(pid =>
            {
                if(document.querySelector('ytd-miniplayer[active]')){
                    sendKey(pid,"i")
                }
            }
        ,5000,action.pid)
    }
}

