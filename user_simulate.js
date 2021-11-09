const utils = require('./utils')

async function userType(action,selector,str,element,iframe){
    console.log('userType',selector,str)
    let el = element?element:(iframe?await iframe.$(selector):await action.page.$(selector))
    if(el && !element && !iframe) await action.page.waitForSelector(selector,{timeout:30000,visible:true})
    if(!action.mobile) await el.click({ clickCount: 3 })
    await utils.sleep(1000)
    await el.type(str, {delay: 100})
}

async function userTypeEnter(action,selector,str,element,iframe){
    console.log('userTypeEnter',selector,str)
    let el = element?element:(iframe?await iframe.$(selector):await action.page.$(selector))
    if(el && !element && !iframe) await action.page.waitForSelector(selector,{timeout:30000,visible:true})
    if(!action.mobile) await el.click({ clickCount: 3 })
    await utils.sleep(1000)
    await el.type(str, {delay: 100})
    await action.page.waitFor(1000)
    await el.press('Enter')
}

async function userClick(action, selector,element,iframe){
    console.log('userClick',selector)
    let el = element?element:(iframe?await iframe.$(selector):await action.page.$(selector))
    if(el && !element && !iframe) await action.page.waitForSelector(selector,{timeout:30000,visible:true})
    action.mobile && !(await el.$('option')) ? await action.page.evaluate(e => { e.scrollIntoViewIfNeeded(); e.click() }, el) : await el.click()
}

async function userScroll(action, n){
    console.log('userScroll',n)
    n = Math.ceil(n/5)
    let m = n>0?n:-n
    for(let i = 0; i < n;i++){
        await action.page.evaluate(y => window.scrollBy(0,y),utils.randomRanger(200,400)*n/m)
        await utils.sleep(1000)
    }
}

async function userClickRandomVideo(action) {
    console.log('userClickRandomVideo')
    let watches = await action.page.$$('#content a#thumbnail[href*="watch"]:not([href*="list="])')
    let visibles = []
    for(let i = 0; i < watches.length; i++){
        if(await watches[i].boundingBox()) visibles.push(watches[i])
    }
    console.log('videos:',watches.length,'visibles:',visibles.length)
    if(visibles.length){
        let random = visibles[utils.randomRanger(0,visibles.length-1)]
        await random.click()
    }
    else{
        throw 'no random video'
    }
}

async function userClickRandomVideoMobile(action) {
    console.log('userClickRandomVideoMobile')
    let watches = await action.page.$$('ytm-browse a.large-media-item-thumbnail-container[href*="watch"]:not([href*="list="])')
    let visibles = []
    for(let i = 0; i < watches.length; i++){
        if(await watches[i].boundingBox()) visibles.push(watches[i])
    }
    if(visibles.length){
        let random = visibles[utils.randomRanger(0,visibles.length-1)]
        await random.click()
    }
    else{
        throw 'no random video'
    }
}

async function userClickRandomVideoMobileComplact(action) {
    console.log('userClickRandomVideoMobile')
    let watches = await action.page.$$('ytm-search a.compact-media-item-image[href*="watch"]:not([href*="list="])')
    let visibles = []
    for(let i = 0; i < watches.length; i++){
        if(await watches[i].boundingBox()) visibles.push(watches[i])
    }
    if(visibles.length){
        let random = visibles[utils.randomRanger(0,visibles.length-1)]
        await random.click()
    }
    else{
        throw 'no random video'
    }
}

async function goToLocation(pid, url){
    console.log('goToLocation',url)
    await updateUserInput(pid,'GO_ADDRESS',0, 0 ,0, 0,  url)
}

async function sendKey(action, key){
    console.log('sendKey',key)
    await action.page.keyboard.type(key);
}

async function nextVideo(action){
    console.log('nextVideo')
    await action.page.keyboard.down('Shift');
    await action.page.keyboard.press('KeyI');
    await action.page.keyboard.up('Shift');
}

module.exports.userClick = userClick
module.exports.userType = userType
module.exports.userTypeEnter = userTypeEnter
module.exports.userScroll = userScroll
module.exports.userClickRandomVideo = userClickRandomVideo
module.exports.userClickRandomVideoMobile = userClickRandomVideoMobile
module.exports.userClickRandomVideoMobileComplact = userClickRandomVideoMobileComplact
module.exports.sendKey = sendKey
module.exports.nextVideo = nextVideo