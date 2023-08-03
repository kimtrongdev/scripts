function makeName(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

async function userPasteImage(pid,selector,element,iframe){
    console.log('userPasteImage',selector)
    let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
    el.scrollIntoViewIfNeeded()
    let pos = getElementPosition(el,iframe)
    await updateUserInput(pid,'PASTE_IMAGE',pos.x,pos.y,scrollX,scrollY,'',selector)
}

async function userType(pid,selector,str,element,iframe){
    console.log('userType',selector,str)
    let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
    el.scrollIntoViewIfNeeded()
    let pos = getElementPosition(el,iframe)
    await updateUserInput(pid,'TYPE',pos.x,pos.y,scrollX,scrollY,str,selector)
}

async function userTypeEnter(pid,selector,str,element,iframe){
    try{
        console.log('userTypeEnter',selector,str)
        let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
        el.scrollIntoViewIfNeeded()
        let pos = getElementPosition(el,iframe)
        await updateUserInput(pid,'TYPE_ENTER',pos.x,pos.y,scrollX,scrollY,str,selector)
    }
    catch (e) {
        console.log(e)
    }
}

async function userOnlyTypeEnter(pid,selector,str,element,iframe){
    try{
        console.log('userTypeEnter',selector,str)
        let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
        el.scrollIntoViewIfNeeded()
        let pos = getElementPosition(el,iframe)
        await updateUserInput(pid,'ONLY_TYPE_ENTER',pos.x,pos.y,scrollX,scrollY,str,selector)
    }
    catch (e) {
        console.log(e)
    }
}

async function userClick(pid, selector,element,iframe, xPlus = 0, yPlus = 0){
    console.log('userClick',selector)
    let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
    if(el){
        el.scrollIntoViewIfNeeded()
        // await userScrollTo(pid,selector,element)
        // el.click()
        let pos = getElementPosition(el,iframe)
        await updateUserInput(pid,'CLICK',pos.x + xPlus,pos.y + yPlus,scrollX,scrollY,"",selector)
    }
    else{
        console.log('error',selector,'not found')
    }
}

async function userScrollTo(pid,selector,element){
    console.log('userScrollTo',selector)
    let el = element?element:document.querySelector(selector)
    if(el){
        el.scrollIntoView();
        // let menuBarHeight = window.outerHeight - window.innerHeight
        // let x = window.screenX + window.innerWidth*0.5
        // let y = window.screenY + menuBarHeight + window.innerHeight*0.5
        // let pos = el.getBoundingClientRect()
        // if(pos.x > 0 && pos.x < window.innerWidth - pos.width && pos.y > 0 && pos.y < window.innerHeight - pos.height){
        //     return
        // }
        // let i = 0
        // while(i < 20){
        //     await updateUserInput(pid,'SCROLL',x, y ,0, 0,  pos.y<0?-5:5,selector)
        //     pos = el.getBoundingClientRect()
        //     console.log(selector,pos)
        //     if(pos.x > 0 && pos.x < window.innerWidth - pos.width && pos.y > 0 && pos.y < window.innerHeight - pos.height){
        //         return
        //     }
        //     i++
        // }
    }
    else{
        console.log('error',selector,'not found')
    }
}

async function userClickAll(pid, selector){
    console.log('userClickAll',selector)
    let elements = Array.from(document.querySelectorAll(selector))
    for(let i = 0; i < elements.length; i++){
        let el = elements[i]
        let pos = getElementPosition(el)
        await updateUserInput(pid,'CLICK',pos.x,pos.y,scrollX,scrollY,"",selector)
    }
}

async function userScroll(pid, n){
    console.log('userScroll',n)
    // if (n > 0) {
    //     window.scrollTo(0, document.body.scrollHeight)
    // }
    // let menuBarHeight = window.outerHeight - window.innerHeight
    // let x = window.screenX + window.innerWidth*randomRanger(40,60)/100
    // let y = window.screenY + menuBarHeight + window.innerHeight*randomRanger(40,60)/100

    await updateUserInput(pid,'SCROLL',0, 0 ,0, 0,  n)
}

async function userScrollMobile(pid, n){
    console.log('userScroll',n)
    let x = window.screenX + windowWide/2
    let y = window.screenY + mobileMenuBarHeight + window.innerHeight/2
    await updateUserInput(pid,'SCROLL',x, y ,0, 0,  n)
}

async function userClickRandomVideo(pid) {
    console.log('userClickRandomVideo')
    let watches = document.querySelectorAll('#content a#thumbnail[href*="watch"]:not([href*="list="])')
    let visibles = Array.from(watches).filter(x => x.getBoundingClientRect().x > 0 && x.getBoundingClientRect().y > 100 && x.getBoundingClientRect().y < window.innerHeight - x.getBoundingClientRect().height)
    if(visibles.length){
        let random = visibles[randomRanger(0,visibles.length-1)]
        let pos = getElementPosition(random)
        await updateUserInput(pid,'CLICK',pos.x,pos.y,pos.scrollX,pos.scrollY,"", 'random video: #content a#thumbnail[href*="watch"]')
    }
    else{
        throw 'no random video'
    }
}

async function userClickRandomVideoMobile(pid) {
    console.log('userClickRandomVideoMobile')
    let watches = [...document.querySelectorAll('ytm-browse a.large-media-item-thumbnail-container[href*="watch"]:not([href*="list="])')]
    let visibles = watches  //Array.from(watches).filter(x => x.getBoundingClientRect().x > 0 && x.getBoundingClientRect().y > 0 && x.getBoundingClientRect().y < window.innerHeight - x.getBoundingClientRect().height)
    if(visibles.length){
        let random = visibles[randomRanger(0,visibles.length-1)]
        await userClick(pid,'random video: #content a#thumbnail[href*="watch"]',random)
        // let pos = getElementPosition(random)
        // await updateUserInput(pid,'CLICK',pos.x,pos.y,pos.scrollX,pos.scrollY,"", 'random video: ytm-browse a#thumbnail[href*="watch"]')
    }
    else{
        throw 'no random video'
    }
}

async function userClickRandomVideoMobileComplact(pid) {
    console.log('userClickRandomVideoMobile')
    let watches = [...document.querySelectorAll('ytm-search a.compact-media-item-image[href*="watch"]:not([href*="list="])')]
    let visibles = watches//Array.from(watches).filter(x => x.getBoundingClientRect().x > 0 && x.getBoundingClientRect().y > 0 && x.getBoundingClientRect().y < window.innerHeight - x.getBoundingClientRect().height)
    if(visibles.length){
        let random = visibles[randomRanger(0,visibles.length-1)]
        await userClick(pid,'random video: #content a#thumbnail[href*="watch"]',random)
        // let pos = getElementPosition(random)
        // await updateUserInput(pid,'CLICK',pos.x,pos.y,pos.scrollX,pos.scrollY,"", 'random video: #content a#thumbnail[href*="watch"]')
    }
    else{
        throw 'no random video'
    }
}

async function goToLocation(pid, url){
    console.log('goToLocation',url)
    await updateUserInput(pid,'GO_ADDRESS',0, 0 ,0, 0,  url)
}

async function sendKey(pid, key){
    console.log('sendKey',key)
    await updateUserInput(pid,'SEND_KEY',0, 0 ,0, 0,  key)
}

async function nextVideo(pid){
    console.log('nextVideo')
    if (IS_MOBILE) {
       await userClick(pid, 'ytm-playlist-controls c3-icon path[d="M5,18l10-6L5,6V18L5,18z M19,6h-2v12h2V6z"]') 
    } else {
       await userClick(pid, '.ytp-next-button')
    }
}

async function switchMobile(action){
    console.log('switchMobile')
    action.windowWide = 1920    //window.outerWidth
    action.mobileMenuBarHeight = 138

    await updateUserInput(action.pid,'OPEN_DEV',window.screenX,window.screenY)
    await sleep(3000)

    if(action.availWidth && action.userAgent){
        let temp = action.availHeight
        action.availHeight = action.availWidth
        action.availWidth = temp
        action.zoom = 576 > action.availHeight ? 1 : (576/action.availHeight).toFixed(2)
        if(576/action.availHeight > 2){
            action.zoom = 1
            action.availWidth = action.availWidth*2
            action.availHeight = action.availHeight*2
        }
        await setActionData(action)
        if(navigator.maxTouchPoints < 1 || navigator.maxTouchPoints == 10){
            await updateUserInput(action.pid,'OPEN_MOBILE_CUSTOM', action.availWidth, action.availHeight, 0, 0,  action.userAgent)
        }
        else if(window.outerHeight != action.availHeight || window.outerWidth != action.availWidth){            
            await updateUserInput(action.pid,'REOPEN_MOBILE_CUSTOM', action.availWidth, action.availHeight, 0, 0,  action.userAgent)
        }
        else{
            await updateUserInput(action.pid,'SELECT_MOBILE_CUSTOM')
        }
    }
    else{
        // G4, S5, Pixel 2, Pixel 2 XL, 5/SE, 6/7/8, 6/7/8 Plus, X
        //action.zoom = [0.9,0.9,0.79,0.7,1,0.86,0.78,0.71][action.pid%4]

        //action.zoom = [0.78, 0.5, 0.5, 0.61, 0.7, 0.57, 0.4, 0.5, 0.38, 0.7][action.pid%4]
        action.zoom = [0.68, 0.75, 0.63, 0.45, 0.5, 0.42, 0.8, 0.88, 0.5, 0.5][action.pid%10]
        // ipse 86
        // xr 50
        // ip 12 pro 50

        // pixel 5 68 
        // samsung s8 75 
        // sam sung s20 63   
        // ipad air 40 45 
        // ipad mini 50  
        // sur pro 7 38  42 
        // sur dou 70 80  
        // glx fold 88 --
        // samsung A51/71 50

        await setActionData(action)
        if(navigator.maxTouchPoints < 1 || navigator.maxTouchPoints == 10){
            await updateUserInput(action.pid,'OPEN_MOBILE')
        }
        else{
            await updateUserInput(action.pid,'SELECT_MOBILE')
        }
    }

    await sleep(1000)
    await updateUserInput(action.pid,'SHOW_PAGE')
}

async function screenshot(pid){
    console.log('screenshot')
    await updateUserInput(pid,'SCREENSHOT')
}

async function userSelect(pid,n){
    console.log('userSelect')
    await updateUserInput(pid,'SELECT_OPTION',0, 0 ,0, 0,  n)
}

async function userSelectAvatar(pid,gender){
    console.log('userSelectAvatar')
    await updateUserInput(pid,'SELECT_AVATAR',0, 0 ,0, 0, gender)
}