async function runAction (action) {
    if (action.id == 'admin_test') {
        await adminTest(action)
    }
}

async function initActionData(action) {
    let mobileRate = action.mobile_percent 
    action.mobile = (action.pid % 10) * 10 < mobileRate ? true : false;

    console.log(action)
    await setActionData(action)

    if(action.mobile) await switchMobile(action)

    if (action.id == 'admin_test') {
        //await adminTest(action)
    }
}

function getComment () {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/get-comment', data: {} }, function (response) {
        resolve(response);
    }))
}

function clearBSData () {
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'CLEAR_BROWSER_DATA', url: '/report',
        data: {}}, function (response) {
        resolve(response);
    }))
}

async function reportScript(action, status = true) {
    let isBreak = false
    if ([1, '1', 'true', true].includes(action.is_break)) {
        isBreak = true
        if (action.is_clear_browser_data) {
            await clearBSData()
            await sleep(5000)
        }
    }

    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: { isScriptReport: true, script_code: action.id, service_id: action._id, pid: action.pid, isBreak: action.is_break, stop: isBreak, status, data_reported: action.data_reported }}, 
    async function (response) {
        if (response) {
            if (action.watch_time) {
                action.watch_time = 0
            }
            Object.assign(action, response)
            action.data_reported = ''

            await initActionData(action)
            await runAction(action)
        }
        resolve()
    }))
}

function reportLive(pid){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {id: 'live_report', pid}}, function (response) {
        resolve(response);
    }))
}

function closeTabs () {
    return new Promise(resolve => chrome.runtime.sendMessage({
            type: 'CLOSE_OLD_TABS', 
            url: '/report',
        }, function (response) {
        resolve(response);
    }))
}

function closeUnactiveTabs () {
    return new Promise(resolve => chrome.runtime.sendMessage({
            type: 'CLOSE_UNACTIVE_TABS', 
            url: '/report',
        }, function (response) {
        resolve(response);
    }))
}

function closeBrowser () {
    return new Promise(resolve => chrome.runtime.sendMessage({
            type: 'CLOSE_BROWSER', 
            url: '/report',
        }, function (response) {
        resolve(response);
    }))
}

async function getActionData(){
    return new Promise(resolve => chrome.storage.sync.get('action', function(data) {
            resolve(data);
        })
    )
}

async function setActionData(data){
    if (Number(data.id)) {
        data.id = data.script_code
    }
    return new Promise(resolve => chrome.storage.sync.set({action: data}, function() {
            resolve();
        })
    )
}

async function sendUserAction(action){
    return new Promise(resolve => chrome.runtime.sendMessage(action, function (response) {
        resolve(response);
    }))
}

async function updateActionStatus(pid, action, status, msg, stop = true){
    console.log('updateActionStatus',pid,status)
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {pid: pid, id: action, status: status, stop: stop, msg: msg}}, function (response) {
        resolve(response);
    }))
}

function updateLoginStatus(pid, status, msg){
    console.log('updateLoginStatus',pid,status)
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/login',
        data: {pid: pid, stop: true, status: status, msg: msg}}, function (response) {
        resolve(response);
    }))
}

function simpleClick(x,y){
    var ev = document.createEvent("MouseEvent");
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        x, y, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

function simpleSendKey(keyCode) {
    const ke = new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true, keyCode: keyCode
    });
    document.body.dispatchEvent(ke);
}

function updateUserInput(pid, action, x, y, sx, sy, str, selector){
    console.log('updateUserInput',pid,action)
    let event = new Event('input');
    switch (action) {
        case 'CLICK':
            simpleClick(x, y)
            break;
        case 'TYPE':
            document.querySelector(selector).value = str
            document.querySelector(selector).dispatchEvent(event);
            break;
        case 'TYPE_ENTER':
            document.querySelector(selector).value = str
            document.querySelector(selector).dispatchEvent(event);
            break;
        case 'GO_ADDRESS':
            window.location.assign(str)
            break;

        case 'SCROLL':
        case 'ESC':
            break;
        default:
            // return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/input',
            //     data: {pid: pid, action: action, x: x, y: y, sx: sx, sy: sy,str: str, selector: selector}}, function (response) {
            //     resolve(response);
            // }))
    }
}

function elementInViewport (el) {
    if (typeof el == 'string') {
        el = document.querySelector(el)
    }

    if (!el) {
        return false
    }

    let pos = el.getBoundingClientRect()
    return pos.x || pos.y || pos.width || pos.height
}

function getElementPosition(el,iframe){
    if(el){
        // let screenX = window.screen.width - window.screen.availWidth
        // let screenY = window.screen.height - window.screen.availHeight
        let pos = el.getBoundingClientRect()
        let iframePost = iframe?iframe.getBoundingClientRect():undefined
        //let menuBarHeight = mobileMenuBarHeight || (window.outerHeight - window.innerHeight)
        //let menuLeftWith = (window.outerWidth - window.innerWidth)
        let x = zoom*(pos.left + (pos.width*0.6) + (iframe?iframePost.left:0)) //+ screenX + menuLeftWith + (windowWide?(windowWide-zoom*window.innerWidth)/2:0) + widthCustom
        let y = zoom*(pos.top + (pos.height*0.6) + (iframe?iframePost.top:0))  //+ screenY + menuBarHeight + heightCustom
        let scrollX = window.scrollX
        let scrollY = window.scrollY
        console.log({x: x, y: y, scrollX: scrollX, scrollY: scrollY})
        return {x: x, y: y, scrollX: scrollX, scrollY: scrollY}
    }
}

function listenMsg() {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            sendResponse('OK');
        });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(function () {
        resolve('ok')
    }, ms));
}

function randomRanger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function waitForSelector(selector,timeout = 30000, iframe){
    let n = Math.ceil(timeout/1000)
    for(let i = 0; i < n; i++){
        let el = iframe ? iframe.contentWindow.document.querySelector(selector) : document.querySelector(selector)
        if(el && el.getBoundingClientRect().width) return
        await sleep(1000)
    }
    throw selector + '_NOT_FOUND'
}

async function closeAdsTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'CLOSE_ADS_TAB',
    }, function (response) {
        resolve(response);
    }))
}

function getTotalTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'GET_TOTAL_TABS',
    }, function (response) {
        resolve(response);
    }))
}

async function randomFullName () {
    let rs = await fetch('https://random-data-api.com/api/name/random_name').then(response => {
        return response.json()
    }).then(response => response).catch(error => {
        return {
            name: makeName(5)
        }
    })

    return rs.name
}

function getElementContainsInnerText(tagName, innerText) {
    let headings = document.evaluate(
        `//${tagName}[contains(., '${innerText}')]`,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );

    if (headings) {
        const thisHeading = headings.iterateNext();
        return thisHeading
    }
    return null
}

async function handleSelectExOption (action) {
    if (action.trace_name && action.trace_name.indexOf('level_') > -1) {
        await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
        await goToLocation(action.pid, 'chrome-extension://njkmjblmcfiobddjgebnoeldkjcplfjb/html/settings.html')

        if (action.trace_name == 'level_minimum') {
            await updateUserInput(action.pid,'CLICK', 219, 800,0,0,"",'click')
        } else if (action.trace_name == 'level_standard') {
            await updateUserInput(action.pid,'CLICK', 529, 800,0,0,"",'click')
        } else if (action.trace_name == 'level_high') {
            await updateUserInput(action.pid,'CLICK', 835, 800,0,0,"",'click')
        } else if (action.trace_name == 'level_extreme') {
            await updateUserInput(action.pid,'CLICK', 1136, 800,0,0,"",'click')
        }

        await updateUserInput(action.pid,'GO_TO_FISRT_TAB',0,0,0,0,"",'GO_TO_FISRT_TAB')
    }
}

async function getRandomUSName () {
    let rs = await fetch('https://randomuser.me/api/').then(response => {
        return response.json()
    }).then(response => {
        let name = response.results[0].name
        let firstName = name.first
        let lastName = name.last
        return {
            last_name: lastName,
            first_name: firstName,
        }
    }).catch(error => {
        return {
            last_name: makeName(5),
            first_name: makeName(5),
        }
    })

    return rs
}

async function getRandomVietnamesName () {
    let rs = await fetch('https://story-shack-cdn-v2.glitch.me/generators/vietnamese-name-generator/male').then(response => {
        return response.json()
    }).then(response => {
        let fullName = response.data.name
        let firstName = fullName.split(' ').slice(0, -1).join(' ');
        let lastName = fullName.split(' ').slice(-1).join(' ');
        return {
            last_name: lastName,
            first_name: firstName,
        }
    }).catch(error => {
        return {
            last_name: makeName(5),
            first_name: makeName(5),
        }
    })

    return rs
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function getRandomAddress () {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/get-address-random', data: {} }, function (response) {
        resolve(response);
    }))
}
