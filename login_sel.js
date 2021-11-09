const request = require('request').defaults({ encoding: null });
const anticaptcha = require('./anticaptcha')('02b2df0436aa0a08c1124d4c8470a52a');
const utils = require('./utils')

module.exports.login = login
module.exports.checkLogin = checkLogin

const {By,Key} = require('selenium-webdriver');

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

function login(driver, email, password, emailRecovery, recoverPhone) {
    return new Promise(async resolve => {
        try {
            // resolve({status : "ok", msg : "already logged"})
            // return

            await driver.get("https://accounts.google.com/signin/v2/identifier?passive=true&ltmpl=mobile&service=youtube&hl=en&continue=https%3A%2F%2Fm.youtube.com%2Fsignin%3Fnoapp%3D1%26next%3Dhttps%253A%252F%252Fm.youtube.com%252Faccount_notifications%253Frdm%253D45ftxcj%26feature%3Dblazerbootstrap%26action_handle_signin%3Dtrue%26hl%3Den%26app%3Dm&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin")
            await utils.sleep(10000)

            if ((await driver.getCurrentUrl()).indexOf("signin/v2/") <= -1 && (await driver.getCurrentUrl()).indexOf("accounts.google.com/ServiceLogin") <= -1) {
                resolve({status : "ok", msg : "already logged"})
                return
            }

            if((await driver.getCurrentUrl()).indexOf("accounts.google.com/ServiceLogin/signinchooser") >= 0){
                let li  = await driver.findElements(By.css('form li > div'))
                if(li.length > 2){
                    await li[li.length-2].click()
                }
                else{
                    let li = await driver.findElements(By.css('form ul > li > div[data-identifier="'+email+'"]'))[0]
                    if(li){
                        await li.click()
                    }
                }
                await utils.sleep(7000)
            }

            if((await driver.getCurrentUrl()).indexOf('accounts.google.com/signin/v2/sl/pwd') > -1){
                let id = await driver.findElements(By.css('#profileIdentifier'))[0]
                if(id){
                    await id.click()
                    await utils.sleep(15000)
                    let li  = await driver.findElements(By.css('form li > div'))
                    if(li.length > 2){
                        await li[li.length-2].click()
                    }
                    else{
                        let li = await driver.findElements(By.css('form ul > li > div[data-identifier="'+email+'"]'))[0]
                        if(li){
                            await li.click()
                        }
                    }
                    await utils.sleep(15000)
                }
            }

            if ((await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/v2/identifier") > -1) {  // co truong nhap nhap thang password
                const emailInput = (await driver.findElements(By.css("#identifierId")))[0]
                await emailInput.sendKeys(email,Key.ENTER)
                await utils.sleep(15000)

                if ((await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/v2/identifier") > -1) {
                    const msgEle = (await driver.findElements(By.css("div[aria-live='assertive']")))[0]
                    const text = await msgEle.getText();
                    resolve({status: "error", msg: "Invalid email: " + text.trim()})
                    return
                }
            }

            if ((await driver.getCurrentUrl()).indexOf("accounts.google.com/ServiceLogin") > -1) {  //email ff 10


                let emailInput = (await driver.findElements(By.css("#Email")))[0]
                if(!emailInput){
                    emailInput = (await driver.findElements(By.css("#identifierId")))[0]
                }
                await emailInput.sendKeys(email,Key.ENTER)
                await utils.sleep(7000)

                const msgEle = (await driver.findElements(By.css("#errormsg_0_Email")))[0]
                if (msgEle != null) {
                    const text = await msgEle.getText();
                    if (text != "") {
                        resolve({status: "error", msg: "Invalid email: " + text.trim()})
                        return
                    }
                }

                let passwordInput = (await driver.findElements(By.css("#Passwd")))[0]
                if(!passwordInput){
                    passwordInput = (await driver.findElements(By.css("input[name='password']")))[0]
                }
                await passwordInput.sendKeys(password,Key.ENTER)
                await utils.sleep(15000)

                await checkCaptcha(driver, password)

                const msgElePass = (await driver.findElements(By.css("#errormsg_0_Passwd")))[0]
                if (msgElePass != null) {
                    const textPass = await msgElePass.getText();
                    if (textPass != "") {
                        resolve({status : "error", msg : "Invalid Password: " + text.trim()})
                        return
                    }
                }

            }else {
                const passwordInput = (await driver.findElements(By.css("input[name='password']")))[0]
                await passwordInput.sendKeys(password, Key.ENTER)
                await utils.sleep(15000)

                await checkCaptcha(driver, password)
                if ((await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/v2/sl/pwd") > -1) {
                    const msgEle = (await driver.findElements(By.css("div[aria-live='assertive']")))[0]
                    const text = await msgEle.getText()
                    resolve({status : "error", msg : "Invalid Password: " + text.trim()})
                    return
                }
            }

            await checkCaptcha(driver, password)

            if ((await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/selectchallenge") > -1 || (await driver.getCurrentUrl()).indexOf("https://accounts.google.com/signin/v2/challenge/selection") > -1) {
                if((await driver.findElements(By.css("[data-challengetype='12']")))[0] && emailRecovery && emailRecovery.length > 0){
                    await driver.findElement(By.css("[data-challengetype='12']")).click()
                }
                else if((await driver.findElements(By.css("[data-challengetype='13']")))[0] && recoverPhone && recoverPhone.length > 0){
                    await driver.findElement(By.css("[data-challengetype='13']")).click()
                }
                else{
                    resolve({status : "err", msg : "unknown challengetype"})
                    return
                }

                await utils.sleep(12000)
            }

            if ((await driver.getCurrentUrl()).indexOf("challenge/kpe") > -1){
                let emailInput = (await driver.findElements(By.css("input[name='email']")))[0]
                if (emailInput != null) {
                    await emailInput.sendKeys(emailRecovery, Key.ENTER)
                }else {
                    emailInput = (await driver.findElements(By.css("input[type='email']")))[0]
                    if (emailInput != null) {
                        await emailInput.sendKeys(emailRecovery, Key.ENTER)
                    }
                }
                await utils.Sleep(13000)
            }

            if ((await driver.getCurrentUrl()).indexOf("challenge/kpp") > -1){
                let phoneInput = (await driver.findElements(By.css("input#phoneNumberId")))[0]
                if (phoneInput != null) {
                    await phoneInput.sendKeys(recoverPhone, Key.ENTER)
                }else {
                    phoneInput = (await driver.findElements(By.css("input[type='tel']")))[0]
                    if (phoneInput != null) {
                        await phoneInput.sendKeys(recoverPhone, Key.ENTER)
                    }
                }
                await utils.sleep(13000)
            }

            if ((await driver.getCurrentUrl()).indexOf("deniedsigninrejected") > -1) {
                resolve({status : "err", msg : "BLOCKED"})
                return
            }

            if((await driver.getCurrentUrl()).indexOf("youtube.com/channel_switcher") > -1) {
                let channel = (await driver.findElements(By.css('a[role="button"]')))[0]
                if(channel) channel.click()
                await utils.sleep(12000)
            }

            if (
                (await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/newfeatures") > -1 ||
                (await driver.getCurrentUrl()).indexOf("myaccount.google.com/signinoptions") > -1 ||
                (await driver.getCurrentUrl()).indexOf("RecycledEmailInterstitial") > -1 ||
                (await driver.getCurrentUrl()).indexOf("youtube.com/") > -1
            ) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "Unknown error: " + (await driver.getCurrentUrl())})
        }catch (e) {
            if (
                (await driver.getCurrentUrl()).indexOf("accounts.google.com/signin/newfeatures") > -1 ||
                (await driver.getCurrentUrl()).indexOf("myaccount.google.com/signinoptions") > -1 ||
                (await driver.getCurrentUrl()).indexOf("RecycledEmailInterstitial") > -1 ||
                (await driver.getCurrentUrl()).indexOf("youtube.com/") > -1
            ) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "LOGIN EXCEPTION " + (await driver.getCurrentUrl()) + " " + e.toString()})
        }
    })
}
function checkCaptcha(driver, password) {
    return new Promise(async resolve => {
        try{
            const checkCaptcha1 = (await driver.findElements(By.css("#captchaimg")))[0]
            const checkCaptcha2 = (await driver.findElements(By.css(".captcha-img")))[0]
            if (checkCaptcha1 != null || checkCaptcha2 != null) {
                let captchaResult = await getCaptchaResult(driver)
                if (captchaResult.err) {
                    resolve({status : "error", msg : "Captcha detected: " + captchaResult.err})
                    return
                }

                let passwordInput = (await driver.findElements(By.css("input[name='password']")))[0]
                if(passwordInput != null) {
                    await passwordInput.sendKeys(password)
                }else {
                    passwordInput = (await driver.findElements(By.css("#Passwd")))[0]
                    if (passwordInput != null) {
                        await passwordInput.sendKeys(password)
                    }
                }

                let captchaInput = (await driver.findElements(By.css("input#ca")))[0]
                if (captchaInput != null) {
                    await captchaInput.sendKeys(captchaResult.data)
                }else {
                    captchaInput = (await driver.findElements(By.css("input#logincaptcha")))[0]
                    if (captchaInput != null) {
                        await captchaInput.sendKeys(captchaResult.data)
                    }
                }
                if (captchaInput != null) {
                    await captchaInput.sendKeys(Key.ENTER);
                }
                await utils.sleep(4000)
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
async function getCaptchaResult(driver) {
    return new Promise(async resolve => {
        let imgUrl = ""
        let captchaTag = (await driver.findElements(By.css('#captchaimg')))[0]
        if (captchaTag != undefined && captchaTag != null) {
            imgUrl = (await driver.findElements(By.css('#captchaimg')))[0]
            imgUrl = imgUrl?imgUrl.getAttribute("src"):''
        }else {
            captchaTag = await driver.$(".captcha-img img")
            if (captchaTag != undefined && captchaTag != null) {
                imgUrl = (await driver.findElements(By.css('.captcha-img img')))[0]
                imgUrl = imgUrl?imgUrl.getAttribute("src"):''
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