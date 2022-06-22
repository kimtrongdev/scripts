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

async function userClick(pid, selector,element,iframe, xPlus = 0){
    console.log('userClick',selector)
    let el = element?element:(iframe?iframe.contentWindow.document.querySelector(selector):document.querySelector(selector))
    if(el){
        el.scrollIntoViewIfNeeded()
        // await userScrollTo(pid,selector,element)
        // el.click()
        let pos = getElementPosition(el,iframe)
        await updateUserInput(pid,'CLICK',pos.x + xPlus,pos.y,scrollX,scrollY,"",selector)
    }
    else{
        console.log('error',selector,'not found')
    }
}

async function userScrollTo(pid,selector,element){
    console.log('userScrollTo',selector)
    let el = element?element:document.querySelector(selector)
    if(el){
        let menuBarHeight = window.outerHeight - window.innerHeight
        let x = window.screenX + window.innerWidth*0.5
        let y = window.screenY + menuBarHeight + window.innerHeight*0.5
        let pos = el.getBoundingClientRect()
        if(pos.x > 0 && pos.x < window.innerWidth - pos.width && pos.y > 0 && pos.y < window.innerHeight - pos.height){
            return
        }
        let i = 0
        while(i < 20){
            await updateUserInput(pid,'SCROLL',x, y ,0, 0,  pos.y<0?-5:5,selector)
            pos = el.getBoundingClientRect()
            console.log(selector,pos)
            if(pos.x > 0 && pos.x < window.innerWidth - pos.width && pos.y > 0 && pos.y < window.innerHeight - pos.height){
                return
            }
            i++
        }
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
    let menuBarHeight = window.outerHeight - window.innerHeight
    let x = window.screenX + window.innerWidth*randomRanger(40,60)/100
    let y = window.screenY + menuBarHeight + window.innerHeight*randomRanger(40,60)/100

    await updateUserInput(pid,'SCROLL',x, y ,0, 0,  n)
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
}

async function switchMobile(action){
    console.log('switchMobile')
}

async function screenshot(pid){
    console.log('screenshot')
    await updateUserInput(pid,'SCREENSHOT')
}

async function userSelect(pid,n){
    console.log('userSelect')
    await updateUserInput(pid,'SELECT_OPTION',0, 0 ,0, 0,  n)
}