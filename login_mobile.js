const request = require('request').defaults({ encoding: null });
const anticaptcha = require('./anticaptcha')('02b2df0436aa0a08c1124d4c8470a52a');

module.exports.login = login
module.exports.checkLogin = checkLogin

async function checkLogin(page,pid){
    try{
        // return true
        // await page.goto("https://accounts.google.com/signin/v2/identifier?passive=true&ltmpl=mobile&service=youtube&hl=en&continue=https%3A%2F%2Fm.youtube.com%2Fsignin%3Fnoapp%3D1%26next%3Dhttps%253A%252F%252Fm.youtube.com%252Faccount_notifications%253Frdm%253D45ftxcj%26feature%3Dblazerbootstrap%26action_handle_signin%3Dtrue%26hl%3Den%26app%3Dm&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin")
        await page.goto('https://www.youtube.com/account_notifications')
        await page.waitFor(10000)

        if (page.url().indexOf("accounts.google.com") <= -1 ) {
            return true
        }
        else{
            console.log('error','pid: ', pid, ' not login, url: ', page.url())
            return false
        }
    }
    catch (e) {
        console.log('error',' pid: ',pid,' checkLogin ',e)
        return true
    }
}

function login(page, email, password, emailRecovery, recoverPhone) {
    return new Promise(async resolve => {
        try {
            // resolve({status : "ok", msg : "already logged"})
            // return

            await page.goto("https://accounts.google.com/signin/v2/identifier?passive=true&ltmpl=mobile&service=youtube&hl=en&continue=https%3A%2F%2Fm.youtube.com%2Fsignin%3Fnoapp%3D1%26next%3Dhttps%253A%252F%252Fm.youtube.com%252Faccount_notifications%253Frdm%253D45ftxcj%26feature%3Dblazerbootstrap%26action_handle_signin%3Dtrue%26hl%3Den%26app%3Dm&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin")
            await page.waitFor(10000)

            if (page.url().indexOf("signin/v2/") <= -1 && page.url().indexOf("accounts.google.com/ServiceLogin") <= -1) {
                resolve({status : "ok", msg : "already logged"})
                return
            }

            if(page.url().indexOf("accounts.google.com/ServiceLogin/signinchooser") >= 0){
                let li  = await page.$$('form li > div')
                if(li.length > 2){
                    await page.evaluate(x => x.click(),li[li.length-2])
                }
                else{
                    let li = await page.$('form ul > li > div[data-identifier="'+email+'"]')
                    if(li){
                        await page.evaluate(x => x.click(),li)
                    }
                }
                await page.waitFor(7000)
            }

            if(page.url().indexOf('accounts.google.com/signin/v2/sl/pwd') > -1){
                let id = await page.$('#profileIdentifier')
                if(id){
                    await page.evaluate(x => x.parentNode.click(),id)
                    await page.waitFor(15000)
                    let li  = await page.$$('form li > div')
                    if(li.length > 2){
                        await page.evaluate(x => x.click(),li[li.length-2])
                    }
                    else{
                        let li = await page.$('form ul > li > div[data-identifier="'+email+'"]')
                        if(li){
                            await page.evaluate(x => x.click(),li)
                        }
                    }
                    await page.waitFor(15000)
                }
            }

            if (page.url().indexOf("accounts.google.com/signin/v2/identifier") > -1) {  // co truong nhap nhap thang password
                const emailInput = await page.$("#identifierId")
                await emailInput.type(email, {delay: 10})
                await emailInput.type(String.fromCharCode(13));
                await page.waitFor(15000)

                if (page.url().indexOf("accounts.google.com/signin/v2/identifier") > -1) {
                    const msgEle = await page.$("div[aria-live='assertive']")
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    resolve({status: "error", msg: "Invalid email: " + text.trim()})
                    return
                }
            }

            if (page.url().indexOf("accounts.google.com/ServiceLogin") > -1) {  //email ff 10


                let emailInput = await page.$("#Email")
                if(!emailInput){
                    emailInput = await page.$("#identifierId")
                }
                await emailInput.type(email, {delay: 100})
                await page.waitFor(7000)
                await emailInput.type(String.fromCharCode(13));
                await page.waitFor(7000)

                const msgEle = await page.$("#errormsg_0_Email")
                if (msgEle != null) {
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    if (text != "") {
                        resolve({status: "error", msg: "Invalid email: " + text.trim()})
                        return
                    }
                }

                let passwordInput = await page.$("#Passwd")
                if(!passwordInput){
                    passwordInput = await page.$("input[name='password']")
                }
                await passwordInput.type(password, {delay: 10})
                await passwordInput.type(String.fromCharCode(13));
                await page.waitFor(15000)

                await checkCaptcha(page, password)

                const msgElePass = await page.$("#errormsg_0_Passwd")
                if (msgElePass != null) {
                    const textPass = await page.evaluate(element => element.textContent, msgElePass);
                    if (textPass != "") {
                        resolve({status : "error", msg : "Invalid Password: " + text.trim()})
                        return
                    }
                }

            }else {
                const passwordInput = await page.$("input[name='password']")
                await passwordInput.type(password, {delay: 10})
                await passwordInput.type(String.fromCharCode(13));
                await page.waitFor(15000)

                await checkCaptcha(page, password)
                if (page.url().indexOf("accounts.google.com/signin/v2/sl/pwd") > -1) {
                    const msgEle = await page.$("div[aria-live='assertive']")
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    resolve({status : "error", msg : "Invalid Password: " + text.trim()})
                    return
                }
            }

            await checkCaptcha(page, password)

            if (page.url().indexOf("accounts.google.com/signin/selectchallenge") > -1 || page.url().indexOf("https://accounts.google.com/signin/v2/challenge/selection") > -1) {
                if(await page.$("[data-challengetype='12']") && emailRecovery && emailRecovery.length > 0){
                    await page.click("[data-challengetype='12']")
                }
                else if(await page.$("[data-challengetype='13']") && recoverPhone && recoverPhone.length > 0){
                    await page.click("[data-challengetype='13']")
                }
                else{
                    resolve({status : "err", msg : "unknown challengetype"})
                    return
                }

                await page.waitFor(12000)
            }

            if (page.url().indexOf("challenge/kpe") > -1){
                let emailInput = await page.$("input[name='email']")
                if (emailInput != null) {
                    await emailInput.type(emailRecovery, {delay: 10})
                    await emailInput.type(String.fromCharCode(13));
                }else {
                    emailInput = await page.$("input[type='email']")
                    if (emailInput != null) {
                        await emailInput.type(emailRecovery, {delay: 10})
                        await emailInput.type(String.fromCharCode(13));
                    }
                }
                await page.waitFor(13000)
            }

            if (page.url().indexOf("challenge/kpp") > -1){
                let phoneInput = await page.$("input#phoneNumberId")
                if (phoneInput != null) {
                    await phoneInput.type(recoverPhone, {delay: 10})
                    await phoneInput.type(String.fromCharCode(13));
                }else {
                    phoneInput = await page.$("input[type='tel']")
                    if (phoneInput != null) {
                        await phoneInput.type(recoverPhone, {delay: 10})
                        await phoneInput.type(String.fromCharCode(13));
                    }
                }
                await page.waitFor(13000)
            }

            if (page.url().indexOf("deniedsigninrejected") > -1) {
                resolve({status : "err", msg : "BLOCKED"})
                return
            }

            if(page.url().indexOf("youtube.com/channel_switcher") > -1) {
                await page.$$eval('a[role="button"]', elements => elements[1].click());
                await page.waitFor(12000)
            }

            if (
                page.url().indexOf("accounts.google.com/signin/newfeatures") > -1 ||
                page.url().indexOf("myaccount.google.com/signinoptions") > -1 ||
                page.url().indexOf("RecycledEmailInterstitial") > -1 ||
                page.url().indexOf("youtube.com/") > -1
            ) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "Unknown error: " + page.url()})
        }catch (e) {
            if (
                page.url().indexOf("accounts.google.com/signin/newfeatures") > -1 ||
                page.url().indexOf("myaccount.google.com/signinoptions") > -1 ||
                page.url().indexOf("RecycledEmailInterstitial") > -1 ||
                page.url().indexOf("youtube.com/") > -1
            ) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "LOGIN EXCEPTION " + page.url() + " " + e.toString()})
        }
    })
}
function checkCaptcha(page, password) {
    return new Promise(async resolve => {
        try{
            const checkCaptcha1 = await page.$("#captchaimg")
            const checkCaptcha2 = await page.$(".captcha-img")
            if (checkCaptcha1 != null || checkCaptcha2 != null) {
                let captchaResult = await getCaptchaResult(page)
                if (captchaResult.err) {
                    resolve({status : "error", msg : "Captcha detected: " + captchaResult.err})
                    return
                }

                let passwordInput = await page.$("input[name='password']")
                if(passwordInput != null) {
                    await passwordInput.type(password, {delay: 10})
                }else {
                    passwordInput = await page.$("#Passwd")
                    if (passwordInput != null) {
                        await passwordInput.type(password, {delay: 10})
                    }
                }

                let captchaInput = await page.$("input#ca")
                if (captchaInput != null) {
                    await captchaInput.type(captchaResult.data, {delay: 10})
                }else {
                    captchaInput = await page.$("input#logincaptcha")
                    if (captchaInput != null) {
                        await captchaInput.type(captchaResult.data, {delay: 10})
                    }
                }
                if (captchaInput != null) {
                    await captchaInput.type(String.fromCharCode(13));
                }
                await page.waitFor(4000)
                resolve({status : "ok"})
            }else {
                console.log('no captcha')
                resolve({status : "ok"})
            }
        }
        catch (e) {
            console.log('error','checkCaptcha',e)
            resolve({status : "error", msg : "checkCaptcha error: " + e.toString()})
        }
    })
}
async function getCaptchaResult(page) {
    return new Promise(async resolve => {
        let imgUrl = ""
        let captchaTag = await page.$('#captchaimg')
        if (captchaTag != undefined && captchaTag != null) {
            imgUrl = await page.$eval('#captchaimg', a => a.src);
        }else {
            captchaTag = await page.$(".captcha-img img")
            if (captchaTag != undefined && captchaTag != null) {
                imgUrl = await page.$eval('.captcha-img img', a => a.src);
            }
        }
        if(imgUrl.indexOf("https://accounts.google.com") == -1) {
            imgUrl = "https://accounts.google.com" + imgUrl
        }
        console.log("Captcha URL := ", imgUrl)

        request.get(imgUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let captchaBase64 = new Buffer(body).toString('base64')
                resolve(resolveCaptcha(captchaBase64))
            }else {
                resolve({err : error})
            }
        });
    })
}
async function resolveCaptcha(bodyBase64) {
    return new Promise(resolve => {
        anticaptcha.getBalance(function (err, balance) {
            if (err) {
                resolve({err : err})
                return;
            }
            // captcha params can be set here
            anticaptcha.setMinLength(5);

            if (balance > 0) {
                anticaptcha.createImageToTextTask({
                        case: true, // or params can be set for every captcha specially
                        body: bodyBase64
                    },
                    function (err, taskId) {
                        if (err) {
                            resolve({err : err})
                            return;
                        }

                        anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
                            resolve({err : err, data : taskSolution})
                        });
                    }
                );
            }else {
                resolve({err : "balance = 0"})
            }
        });
    })
}