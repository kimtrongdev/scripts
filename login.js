const request = require('request').defaults({ encoding: null });
const anticaptcha = require('./anticaptcha')('d4664c469dea48de2f9ac8f9d7c7613b');

module.exports.login = login
function login(page, email, password, emailRecovery) {
    return new Promise(async resolve => {
        try {
            await page.goto("https://www.youtube.com/dashboard?o=U&ar=2")
            await page.waitFor(1000)

            if (page.url().indexOf("https://www.youtube.com/dashboard?") > -1) {
                resolve({status : "ok", msg : "already logged"})
                return
            }
            //https://accounts.google.com/signin/v2/identifier
            await page.goto("https://accounts.google.com/signin/v2/identifier?uilel=3&hl=en&service=youtube&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Fhl%3Den%26app%3Ddesktop%26next%3D%252Fdashboard%253Fo%253DU%2526ar%253D2%2526hl%253Den%26action_handle_signin%3Dtrue%26feature%3Dredirect_login&flowName=GlifWebSignIn&flowEntry=ServiceLogin")
            await page.waitFor(1000)


            if (page.url().indexOf("https://accounts.google.com/signin/v2/identifier") > -1) {  // co truong nhap nhap thang password
                const emailInput = await page.$("#identifierId")
                await emailInput.type(email, {delay: 10})
                await emailInput.type(String.fromCharCode(13));
                await page.waitFor(4000)

                if (page.url().indexOf("https://accounts.google.com/signin/v2/identifier") > -1) {
                    const msgEle = await page.$("div[aria-live='assertive']")
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    resolve({status: "error", msg: "Invalid email: " + text.trim()})
                    return
                }
            }
            if (page.url().indexOf("https://accounts.google.com/ServiceLogin") > -1) {  //email ff 10
                const emailInput = await page.$("#Email")
                await emailInput.type(email, {delay: 10})
                await emailInput.type(String.fromCharCode(13));
                await page.waitFor(3000)

                const msgEle = await page.$("#errormsg_0_Email")
                if (msgEle != null) {
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    if (text != "") {
                        resolve({status: "error", msg: "Invalid email: " + text.trim()})
                        return
                    }
                }

                const passwordInput = await page.$("#Passwd")
                await passwordInput.type(password, {delay: 10})
                await passwordInput.type(String.fromCharCode(13));
                await page.waitFor(4000)

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
                await page.waitFor(4000)

                await checkCaptcha(page, password)
                if (page.url().indexOf("https://accounts.google.com/signin/v2/sl/pwd") > -1) {
                    const msgEle = await page.$("div[aria-live='assertive']")
                    const text = await page.evaluate(element => element.textContent, msgEle);
                    resolve({status : "error", msg : "Invalid Password: " + text.trim()})
                    return
                }
            }

            await checkCaptcha(page, password)

            if (page.url().indexOf("https://accounts.google.com/signin/selectchallenge") > -1 || page.url().indexOf("https://accounts.google.com/signin/v2/challenge/selection") > -1) {
                // const optionMailRecover = await page.$$("#challengePickerList li")
                // if(optionMailRecover == null) {
                //     resolve({status : "err", msg : "Option confirm recover mail not found"})
                //     return
                // }
                // for (var i = 0; i < optionMailRecover.length; i++) {
                //     const text = await page.evaluate(element => element.textContent, optionMailRecover[i]);
                //     if (text.indexOf("recovery email") > -1) {
                //         await optionMailRecover[i].click()
                //         break
                //     }
                // }
                await page.click("[data-challengetype='12']")

                await page.waitFor(2000)

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

                await page.waitFor(3000)
                // const msgEle = await page.$("#errormsg_0_Email")
                // if (msgEle != null) {
                //     const text = await page.evaluate(element => element.textContent, msgEle);
                //     if (text != "") {
                //         resolve({status: "error", msg: "Invalid email recovery: " + text.trim()})
                //         return
                //     }
                // }
            }

            if (page.url().indexOf("deniedsigninrejected") > -1) {
                resolve({status : "err", msg : "BLOCKED"})
                return
            }

            if (page.url().indexOf("https://accounts.google.com/signin/newfeatures") > -1 || page.url().indexOf("https://myaccount.google.com/signinoptions/recovery-options-collection") > -1 ) {
                await page.goto("https://www.youtube.com/dashboard?o=U&ar=2")
                await page.waitFor(3000)

                if(page.url().indexOf("https://www.youtube.com/dashboard") > -1) {
                    resolve({status : "ok"})
                    return
                }
                await page.goto("https://www.youtube.com/dashboard?o=U&ar=2")
                await page.waitFor(3000)

                if(page.url().indexOf("https://www.youtube.com/dashboard") > -1) {
                    resolve({status : "ok"})
                    return
                }else {
                    resolve({status : "err", msg : "unknown login url: " + page.url()})
                    return
                }
            }
            if (page.url().indexOf("https://www.youtube.com/dashboard?") > -1) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "Unkown error: " + page.url()})
        }catch (e) {
            if (page.url().indexOf("https://www.youtube.com/dashboard?") > -1) {
                resolve({status : "ok"})
                return
            }
            resolve({status : "err", msg : "LOGIN EXCEPTION " + page.url() + " " + e.toString()})
        }
    })
}
function checkCaptcha(page, password) {
    return new Promise(async resolve => {
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
            resolve({status : "ok"})
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