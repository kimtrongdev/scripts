let LOGIN_STATUS = {
    ERROR: 0,
    SUCCESS: 1,
}

async function userLogin(action) {
    try {
        if (action.is_processing_bat) {
            return
        }

        await sleep(5000)
        reportLive(action.pid)

        if (action.is_start_handle_rename_channel) {
            await renameChannel(action)
            return
        }

        let url = window.location.toString()

        if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
            //action.
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'VERY')
            return
        }

        if (url.indexOf('accounts.google.com/b/0/PlusPageSignUp') > -1) {
            await userCreateChannel(action)
            return
        }

        if (url.indexOf('https://consent.youtube.com/m') > -1) {
            try {
                let btnRejectAll = document.querySelectorAll('form').item(1)
                if (btnRejectAll) {
                    await userClick(action.pid, 'btnRejectAll', btnRejectAll)
                } else {
                    await goToLocation(action.pid,'accounts.google.com')
                    await sleep(60000)
                }
                return
            } catch (error) {
                console.log(error);
            }
        }
    
        if(url.indexOf('localhost') > 0 || url.indexOf('https://accounts.google.com/signin/v2/identifier') == 0) await sleep(10000)
        let emailRecovery = action.recover_mail
        let recoverPhone = action.recover_phone
        if (url == 'https://www.youtube.com/') {
            await sleep(5000)

            let checkCreateChannel1 = await getElementContainsInnerText('yt-formatted-string', 'CREATE CHANNEL')
            let checkCreateChannel2 = await getElementContainsInnerText('yt-formatted-string', 'TẠO KÊNH')
            let checkCreateChannel3 = await getElementContainsInnerText('yt-formatted-string', 'চ্যানেল তৈরি করুন')
    
            let checkCreateChannel = checkCreateChannel1 || checkCreateChannel2 || checkCreateChannel3
            if (checkCreateChannel) {
                await userClick(action.pid, 'checkCreateChannel', checkCreateChannel)
                await sleep(60000)
            }

            let avatar = document.querySelector('#avatar-btn')
            if (avatar) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
                return
            }

            let signinBtn = document.querySelector('ytd-button-renderer > a[href^="https://accounts.google.com/ServiceLogin"]')
            if (signinBtn) {
                await goToLocation(action.pid,'accounts.google.com')
                await sleep(60000)
            }

            let createChannelLayer = document.querySelectorAll('.button-layer a yt-formatted-string[id="text"]')
            if (createChannelLayer) {
                let createChannelBtn = createChannelLayer.item(1)
                if (createChannelBtn) {
                    await userClick(action.pid, 'createChannelBtn', createChannelBtn)
                    await sleep(15000)
                }
            } 
            // else {
            //     if (action.isCreateChannel) {
            //         await goToLocation(action.pid, 'youtube.com/create_channel')
            //         await sleep(15000) 
            //     }
            // }
        }

        if (url.indexOf('/challenge/iap/verify') > -1) {
            let phoneRs = await getPhoneCode(action.order_id, action.api_name)
            console.log('getPhoneCode',phoneRs);
            if (phoneRs.error || action.entered_code) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '[getPhoneCode] ' + phoneRs.error)
            } else {
                action.entered_code = true
                await setActionData(action)
                let code = phoneRs.code + ''
                if (code.length == 5) {
                    code = '0' + code
                }
                await userTypeEnter(action.pid, '#idvAnyPhonePin', code)
                await sleep(30000)
            }
        }
        else if (action.allow_verify && url.indexOf('/challenge/iap') > -1) {
            let phoneRs = await getPhone()
            console.log('getPhone',phoneRs);
            if (phoneRs.error || action.entered_phone) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '[getPhone] ' + phoneRs.error)
            } else {
                if (phoneRs.err) {
                    phoneRs = await getPhone()
                }
                
                action.order_id = phoneRs.orderID
                action.api_name = phoneRs.api_name
                action.entered_phone = true
                await setActionData(action)

                if (phoneRs.phone.startsWith('0')) {
                    phoneRs.phone = phoneRs.phone.replace('0', '+84')
                } else if (!phoneRs.phone.startsWith('+84')) {
                    phoneRs.phone = '+84' + phoneRs.phone
                }
                await userTypeEnter(action.pid, '#phoneNumberId', phoneRs.phone)
                await sleep(30000)
            }
        }
        else
        if (url.indexOf('https://myaccount.google.com/u/5/language') > -1) {
            await goToLocation(action.pid,'youtube.com/feed/history')
            await sleep(30000)
        }
        else if (url.indexOf('myaccount.google.com/language') > -1) {
            // if (action.allow_verify) {
            //     await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, "verify_ok")
            //     return
            // }

            if (!getElementContainsInnerText('div', 'Preferred Language')) {
                await userClick(action.pid, 'path[d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z"]')
                await userType(action.pid, 'label input', 'english')
                await userClick(action.pid, 'li[lang="en"]')
                await userClick(action.pid, 'li[aria-label="United States"]')

                let ok = document.querySelectorAll('div[data-is-touch-wrapper="true"] button[data-mdc-dialog-action]').item(2)
                await userClick(action.pid, 'ok', ok)
                await sleep(3000)
            }
            await goToLocation(action.pid,'youtube.com/feed/history')
            await sleep(30000)
        }
        else if (action.id == 'change_pass' && url.indexOf('myaccount.google.com/security-checkup-welcome') > -1) {
            await beforeLoginSuccess(action)
            return
        }
        else if (action.id == 'change_pass' && url.indexOf('myaccount.google.com/signinoptions/password') > -1) {
            action.new_password = makeid(10)
            await userType(action.pid, 'input[name="password"]', action.new_password)
            await userTypeEnter(action.pid, 'input[name="confirmation_password"]', action.new_password)
            await setActionData(action)
            return
        }
        else if (action.id == 'change_pass' && url.indexOf('/speedbump/changepassword') > -1) {
            action.new_password = makeid(10)
            await userType(action.pid, 'input[name="Passwd"]', action.new_password)
            await userTypeEnter(action.pid, 'input[name="ConfirmPasswd"]', action.new_password)
            await setActionData(action)
            return
        }
        else if (action.id == 'recovery_mail' && url.indexOf('/disabled/appeal/confirmation') > -1) {
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'recovery_ok')
            return
        }
        else if (action.id == 'recovery_mail' && url.indexOf('/disabled/appeal/contactaddress') > -1) {
            if (document.querySelector('#view_container input')) {
                await userTypeEnter(action.pid, '#view_container input', action.contact_mail)
                return
            }
        }
        else if (action.id == 'recovery_mail' && url.indexOf('/disabled/appeal/additionalinformation') > -1) {
            if (document.querySelector('#view_container textarea')) {
                await userTypeEnter(action.pid, '#view_container textarea', action.comment)
                return
            }
        }
        else if (action.id == 'recovery_mail' && url.indexOf('/disabled/appeal/reviewconsent') > -1) {
            if (document.querySelector('#view_container button')) {
                await userClick(action.pid, '#view_container button')
                return
            }
        }
        else if (action.id == 'recovery_mail' && url.indexOf('/disabled/explanation') > -1) {
            // 
            if (document.querySelector('#view_container button')) {
                await userClick(action.pid, '#view_container button')
                return
            }
        }
        else if (url.indexOf('accounts.google.com/speedbump/idvreenable/sendidv') > -1 && action.order_id) {
            //enter code
            let phoneRs = await getPhoneCode(action.order_id, action.api_name)
            console.log('getPhoneCode',phoneRs);
            if (phoneRs.error || action.entered_code) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
            } else {
                action.entered_code = true
                await setActionData(action)
                await userTypeEnter(action.pid, '#smsUserPin', phoneRs.code)
                await sleep(30000)
            }
        }
        else if (url.indexOf('accounts.google.com/speedbump/idvreenable') > -1 && action.is_ver_mail_type) {
            //enter phone number
            let phoneRs = await getPhone()
            console.log('getPhone',phoneRs);
            if (phoneRs.error || action.entered_phone) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
            } else {
                if (phoneRs.err) {
                    phoneRs = await getPhone()
                }
                
                action.order_id = phoneRs.orderID
                action.api_name = phoneRs.api_name
                action.entered_phone = true
                await setActionData(action)
                await userTypeEnter(action.pid, '#deviceAddress', phoneRs.phone)
                await sleep(30000)
            }
        }
        else if (url.indexOf('https://myaccount.google.com/security') > -1) {
            if(!action.newRecoveryMail){
                await userClick(action.pid,'a[href^="recovery/email"]')
            }
            if(!action.newPassword){
                await userClick(action.pid,'a[href^="signinoptions/password"]')
            }
            else{
                await beforeLoginSuccess(action)
            }
            return
        }
        else if (url.indexOf('https://myaccount.google.com/signinoptions/password') > -1) {
            let newPassword = Math.random().toString(36).slice(9).toLocaleUpperCase() + Math.random().toString(36).slice(randomRanger(2,5))
            action.newPassword = newPassword
            await setActionData(action)
            await userType(action.pid,'input[name="password"]',newPassword)
            await sleep(randomRanger(3,5)*1000)
            await userType(action.pid,'input[name="confirmation_password"]',newPassword)
            await sleep(randomRanger(3,5)*1000)
            await userClick(action.pid,'button[type="submit"]')
            await sleep(10000)
            await beforeLoginSuccess(action)
            return
        }
        else if (url.indexOf('youtube.com/oops') > -1) {
            await goToLocation(action.pid, 'youtube.com?skip_registered_account_check=true')
            await sleep(15000)
        }
        else if (url.indexOf('consent.youtube.com') > -1) {
            await sleep(2000)
            await userScroll(action.pid, 5)
            let btnElement = document.querySelectorAll('div[data-is-touch-wrapper] > button').item(1)
            if (btnElement) {
                await userClick(action.pid, 'arrgre consent.youtube.com', btnElement)
                await sleep(30000)
            }
            throw "consent.youtube.com"
        }
        else if (url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/v3/signin/identifier') > -1) {
            console.log('enter email')
            if (['vivaldi-stable', 'vivaldi'].includes(action.browser_name)) {
                let xPos = (window.outerWidth / 2) + (window.screen.width - window.screen.availWidth) - 194
                let yPos = 339
                if (action.os_vm == 'vps') {
                    yPos = 317
                }
                await await updateUserInput(action.pid,'CLICK', xPos, yPos,0,0,"",'close vival btn')
            }

            await waitForSelector('#identifierId')
            await userTypeEnter(action.pid, '#identifierId', action.email)
            await sleep(180000)
        }
        else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
            //action.
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'PlusPageSignUpIdvChallenge')
            throw 'PlusPageSignUpIdvChallenge'
        }
        else if(url.indexOf('https://accounts.google.com/ServiceLogin/signinchooser') == 0){
            console.log('choose account')
            await waitForSelector('ul li[class]')
            let list = [...document.querySelectorAll('ul li[class]')]
            await userClick(action.pid,'ul li[class]',list[list.length - 2])
            await sleep(60000)
        }
        else if(url.indexOf('https://accounts.google.com/ServiceLogin/identifier') == 0){
            if(action.backup && !action.retry_backup){
                action.retry_backup = true
                await setActionData(action)
                await goToLocation(action.pid,'accounts.google.com')
                return
            }
            console.log('enter email')
            await waitForSelector('#identifierId')
            document.querySelector('#identifierId').value = ""
            await userTypeEnter(action.pid, '#identifierId', action.email)
            await sleep(190000)
        }
        else if (url.indexOf('accounts.google.com/v3/signin/challenge/pwd') > -1) {
            console.log('enter password')
            action.relogin = true
            await setActionData(action)
            await waitForSelector("input[name='Passwd']")
            await userTypeEnter(action.pid, "input[name='Passwd']", action.password)
            await sleep(190000)
        }
        else if (url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
            console.log('enter password')
            action.relogin = true
            await setActionData(action)
            await waitForSelector("input[name='password']")
            await userTypeEnter(action.pid, "input[name='password']", action.password)
            await sleep(190000)
        }
        else if (url.indexOf("accounts.google.com/signin/v2/sl/pwd") > -1) {
            const msgEle = document.querySelector("div[aria-live='assertive']")
            if (msgEle && msgEle.textContent.trim().length) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, "Invalid Password: " + msgEle.textContent.trim())
                return
            }
        }
        else if (url.indexOf("accounts.google.com/signin/selectchallenge") > -1 || url.indexOf("https://accounts.google.com/signin/v2/challenge/selection") > -1 || url.indexOf("https://accounts.google.com/v3/signin/challenge/selection") > -1) {
            let Unavailable = getElementContainsInnerText('em', ['Unavailable because of too many attempts. Please try again later'])
            if (Unavailable) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Unavailable because of too many attempts')
                return
            }
            if (document.querySelector("[data-challengetype='12']") && emailRecovery && emailRecovery.length > 0) {
                await userClick(action.pid, "[data-challengetype='12']")
            } else if (await document.querySelector("[data-challengetype='13']") && recoverPhone && recoverPhone.length > 0) {
                await userClick(action.pid, "[data-challengetype='13']")
            } else {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'unknown challengetype')
                return
            }

            await sleep(180000)
        }
        else if (url.indexOf("challenge/kpe") > -1) {
            async function enterMail (mail) {
                let enterMail = mail || emailRecovery
                let emailInput = document.querySelector("input[name='email']")
                if (emailInput != null) {
                    await userTypeEnter(action.pid, "input[name='email']", enterMail)
                } else {
                    emailInput = document.querySelector("input[type='email']")
                    if (emailInput != null) {
                        await userTypeEnter(action.pid, "input[type='email']", enterMail)
                    }
                }
            }
    
            if (action.scan_check_recovery) {
                let wrapRecoMail = getElementContainsInnerText('div', ['Confirm the recovery email address you added to your account: '], '', 'equal')
                let recoMail = ''
                let firstChar = ''
                if (wrapRecoMail) {
                    recoMail = wrapRecoMail.querySelector('strong').innerText
                    if (recoMail) {
                    let startStr = ''
                    for (var i = 0; i < recoMail.length; i++) {
                        if (recoMail[i] == '•') {
                        startStr += '•'
                        }
                    }
                    firstChar = recoMail.split(startStr)[0] || '-'
                    recoMail = recoMail.replace(startStr, `.{${startStr.length}}`)
                }

                console.log('firstChar', firstChar);
                if (emailRecovery.startsWith(firstChar)) {
                    await enterMail()
                    await sleep(5000)
                }

                if (wrapRecoMail) {
                    let match = `^${recoMail}$`
                    
                    let rs = await getRecoMails(match, action.pid)
                    if (rs && rs.emails) {
                        for await (let mail of rs.emails) {
                            action.current_reco_mail = mail
                            await setActionData(action)
                            await enterMail(mail)
                        }
                    }
                    }
                }
            } else {
                await enterMail()
                await sleep(2000)
            }

            await sleep(180000)
        }
        else if (url.indexOf("challenge/kpp") > -1) {
            let phoneInput = document.querySelector("input#phoneNumberId")
            if (phoneInput != null) {
                await userTypeEnter(action.pid, "input#phoneNumberId", recoverPhone)
            } else {
                phoneInput = document.querySelector("input[type='tel']")
                if (phoneInput != null) {
                    await userTypeEnter(action.pid, "input#phoneNumberId", recoverPhone)
                }
            }
            await sleep(60000)
        }
        else if (url.indexOf('https://accounts.google.com/signin/privacyreminder') > -1) {
            while (document.querySelector('[role="button"][jsshadow]')) {
                await userClick(action.pid, '[role="button"][jsshadow]')
                await sleep(15000)
            }
        }
        else if (url.indexOf('accounts.google.com/speedbump/gaplustos') > -1) {
            await userClick(action.pid, 'input[type="submit"]')
            await sleep(60000)
        }
        // else if (url.indexOf('youtube.com/channel/') > -1) {
        //     await goToLocation(action.pid,'myactivity.google.com/product/youtube/controls')  
        //     // if (action.total_channel_created) {
        //     //     await goToLocation(action.pid,'youtube.com/feed/history')
        //     // } else {
        //     //     await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
        //     // }
            
        //     return
        // }
        else if (url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1 
        || url.indexOf('m.youtube.com/feed/library') > -1 ) {
            await goToLocation(action.pid,'youtube.com/feed/history')
            return
        }
        else if (url.indexOf('https://m.youtube.com/channel/') == 0 || url.indexOf('https://m.youtube.com/user/') == 0 || url.indexOf('https://m.youtube.com/c/') == 0) {
            await beforeLoginSuccess(action) // login success
            return
        }
        else if (url.indexOf('myactivity.google.com/product/youtube') > -1 || url.indexOf('myactivity.google.com/product/youtube/controls') > -1) {
            await pauseHistory(action)
            return
        }
        else if (url.indexOf('myactivity.google.com/activitycontrols') > -1) {
            await pauseInfo(action)
            return
        }      
        else if (url.indexOf('https://m.youtube.com/create_channel') == 0) {
            await createChannelMobile(action)
            return
        }        
        else if (url.indexOf('https://myaccount.google.com/gender') == 0 || url.indexOf('https://myaccount.google.com/birthday') == 0) {
            await updateInfo(action)
            return
        } else if (url.indexOf('youtube.com/feed/history') > -1) {
            console.log('------pauseHistory');
            await oldPauseHistory(action)
            if (action.id == 'reg_user') {
                await handleLoginSuccess(action)
            } else {
                await goToLocation(action.pid,'myactivity.google.com/product/youtube')
            }
            
            //await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
            return
        }
        else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUp') > -1) {
            await userCreateChannel(action)
            return
        }
        else if (url.indexOf('youtube.com/account') > -1) {
            if (action.id == 'reg_user' && !action.login_success) {
                action.login_success = true
                await setActionData(action)
            }

            let channels = document.querySelectorAll('ytd-account-item-renderer')

            if (!channels || !channels.length) {
                await sleep(5000)
                channels = document.querySelectorAll('ytd-account-item-renderer')
            }
            if (!channels || !channels.length) {
                await sleep(5000)
                channels = document.querySelectorAll('ytd-account-item-renderer')
            }
            if (!channels || !channels.length) {
                await sleep(5000)
                channels = document.querySelectorAll('ytd-account-item-renderer')
            }

            if (channels.length) {
                // update users count to server
                updateTotalCreatedUsers(action.pid, channels.length)
            }

            if (action.id == 'reg_user') {
                let btnCreateChannel = document.querySelector('#contents ytd-button-renderer yt-button-shape')
                if (!btnCreateChannel) {
                    await sleep(7000)
                    btnCreateChannel = document.querySelector('#contents ytd-button-renderer yt-button-shape')
                }

                if (channels.length < 100 && btnCreateChannel) {
                    await userClick(action.pid,'',btnCreateChannel)
                } else {
                    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
                }
            } else {
                if (isRunBAT) {
                    action.is_processing_bat = true
                    await setActionData(action)
                    await handleBeforeTrickAds(action)
                }
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
            }
            
            return
        }
       
        else if(url != window.location.toString()) {
            return
        }
        if (
            url.indexOf("accounts.google.com/signin/newfeatures") > -1 ||
            url == "https://myaccount.google.com/" ||
            url.indexOf("https://myaccount.google.com/?") > -1 ||
            url.indexOf("RecycledEmailInterstitial") > -1 ||
            url.indexOf("gds.google.com/web/chip") > -1 ||
            url.indexOf("accounts.google.com/speedbump/gaplustos") > -1 ||
            url.indexOf("myaccount.google.com/security-checkup-welcome") > -1 ||
            url.indexOf("youtube.com/") > -1) {
                if(false && !action.updateInfo){
                    action.updateInfo = true
                    await setActionData(action)
                    await goToLocation(action.pid,'myaccount.google.com/gender')
                }
                else{
                    await beforeLoginSuccess(action) // login success
                    return
                }
        }
        else {
            await sleep(15000)
            if (!url.includes('challenge/iap/verify')) {
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '[else]' + getLoginError())
            }
        }
    } catch (e) {
        console.log('error', action.pid, e)
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR,'[catch error] ' + e.toString())
    }
}

async function beforeLoginSuccess (action) {
    if (action.current_reco_mail) {
        await updateProfileData({ pid: action.pid, recovery_mail: action.current_reco_mail })
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'scan_reco_mail_success')
        return
    }
    console.log('beforeLoginSuccess');
    if (action.id == 'change_pass') {
        if (action.new_password) {
            action.username = action.email
            action.password = action.new_password
            action.verify = action.recover_mail
            action.end_script = true
            await setActionData(action)
            await reportAccount(action)
        } else {
            await goToLocation(action.pid, 'https://myaccount.google.com/signinoptions/password')
            await sleep(20000)
        }
    }

    if (action.id == 'reg_account' && action.process_login) {
        action.process_login = false
        await setActionData(action)
        await goToLocation(action.pid, 'https://ads.google.com/home/')
        //await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
        return
    }

    if (action.is_rename_channel_type) {
        action.is_start_handle_rename_channel = true
        await setActionData(action)
        await goToLocation(action.pid,'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
    }
    else if (action.is_ver_mail_type) {
        let msg = action.order_id ? 'verify_success':'account_ok'
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, msg)

        // if (action.newPassword) {
        //     let msg = action.order_id ? 'verify_success':'account_ok'
        //     await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, msg)
        // } else {
        //     await goToLocation(action.pid,'myaccount.google.com/security')
        // }
    } else {
        if (action.skip_pau_history) {
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
        } else {
            await goToLocation(action.pid, 'https://myaccount.google.com/language')
            //await goToLocation(action.pid,'youtube.com/feed/history')
        }
    }
    await sleep(60000)

    if (isNonUser) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    } else {
        await goToLocation(action.pid, action.mobile ? 'https://m.youtube.com/feed/library' : 'youtube.com/create_channel')
        await sleep(60000)
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    }
}

async function handleLoginSuccess (action) {
    await goToLocation(action.pid,'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
}

async function checkLogin(action) {
    await waitForSelector('ytd-topbar-menu-button-renderer,.topbar-menu-button-avatar-button')
    if (!document.querySelector('#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')) {
        // recheck
        let allowBtn = document.querySelector('.dialog-buttons .consent-bump-button-wrapper button')
        if(allowBtn){
            await userClick(action.pid,'.dialog-buttons .consent-bump-button-wrapper button',allowBtn)
            await sleep(5000)
        }
        if (!action.check_login) {
            action.check_login = true
            await setActionData(action)
            await goToLocation(action.pid, 'accounts.google.com')
        }
        else {
            return
        }
    }
    else if(window.location.toString().split('?')[0] == 'https://m.youtube.com/'){
        let iconLength = [...document.querySelectorAll('#home-icon path')].length
        await updateActionStatus(action.pid, 'login', LOGIN_STATUS.SUCCESS,iconLength==3?'PREMIUM':'FREE',false)
    }
}

async function checkPremium(action){
    try{
        let url = window.location.toString()
        await waitForSelector('ytd-topbar-menu-button-renderer,.topbar-menu-button-avatar-button')
        if(window.location.toString().split('?')[0] == 'https://m.youtube.com/'){
            let iconLength = [...document.querySelectorAll('#home-icon path')].length
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS,iconLength==3?'PREMIUM':'FREE')
        }
        else{
            console.log('unknown url',url)
            await beforeLoginSuccess(action) // login success
        }
    }
    catch(e){
        console.log('error',checkPremium,e)
        await beforeLoginSuccess(action) // login success
    }
}

async function checkCountry(action){
    try{
        let url = window.location.toString()
        if(url.indexOf('https://pay.google.com/') == 0 && url.indexOf('settings') > 0){
            let i = 0
            while(!action.current_country){
                i++
                if(i > 30) throw 'GET_COUNTRY'
                console.log('wait for country info...')
                let data = await getActionData()
                action = data.action
                await sleep(2000)
            }
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS,action.current_country)
        }
        else if(url.indexOf('https://payments.google.com/payments') == 0 && url.indexOf('embedded_settings') > 0){
            if(document.querySelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text')){
                await waitForSelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text')
                let country = document.querySelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text').textContent
                console.log('country',country)
                action.current_country = country
                await setActionData(action)
            }
        }
        else{
            console.log('unknown url',url)
            await beforeLoginSuccess(action) // login success
        }
    }
    catch(e){
        console.log('error',checkPremium,e)
        await beforeLoginSuccess(action) // login success
    }
}

function getLoginError() {
    let url = window.location.toString().split('?')[0]
    try {
        let msg
        if (url.indexOf("/v2/identifier") > -1) {
            if (document.querySelector('#captchaimg[src*="Captcha"]')) {
                msg = 'CAPTCHA'
            }
        }
        else if (url.indexOf("/v2/challenge/pwd") > -1) {
            if (document.querySelector('#captchaimg[src*="Captcha"]')) {
                msg = 'CAPTCHA'
            }
            else {
                msg = document.querySelector('div[aria-live="assertive"]').textContent
            }
        }
        else if (url.indexOf('/v2/challenge/kpe') > -1) {
            msg = document.querySelector('div[aria-live="assertive"][class]').textContent
        }
        else if (url.indexOf("/v2/deniedsigninrejected") > -1) {
            msg = document.querySelector('#headingText').textContent
        }
        else if (url.indexOf("/v2/challenge/ipp") > -1) {
            msg = 'CODE_TO_MOBILE'
        }
        else if (url.indexOf("/v2/challenge/ipp") > -1) {
            msg = 'CALLING_VERIFICATION'
        }
        else if (url.indexOf("/v2/challenge/sq") > -1) {
            msg = 'SECURITY_QUESTION:' + document.querySelector('div[aria-live="assertive"]').textContent
        }
        else if (url.indexOf("/signin/selectchallenge") > -1 || url.indexOf("/v2/challenge/selection") > -1) {
            let challenges = Array.from(document.querySelectorAll('[data-challengetype]:not([data-challengetype="undefined"])')).map(e => e.getAttribute("data-sendmethod")).join(",")
            msg = 'UNKNOWN_CHALLENGE_TYPE:' + challenges
        }
        return url + ":" + msg
    }
    catch (e) {
        return url + ":" + e.toString()
    }
}

async function userCreateChannel(action){
    let fullname = await randomFullName()
    await waitForSelector('#PlusPageName')
    await userTypeEnter(action.pid, '#PlusPageName', fullname)

    await sleep(1000)
    await userClick(action.pid,'.consent-checkmark')
    await sleep(1000)

    await userClick(action.pid,'#submitbutton')
}

async function createChannelMobile(action){
    await sleep(5000)
    for(let i = 0; i < 5; i++){
        if(document.querySelector('[data-style="STYLE_PRIMARY"]')) break
        await sleep(2000)
    }
    let firstName = document.querySelector('input[dir="auto"]')
    if(firstName && !firstName.value){
        await userType(action.pid,'input[dir="auto"]',randomString(),firstName)
    }
    let lastName = document.querySelector('input.ytm-create-core-identity-channel-content-renderer-family-name-input')
    if(lastName && !lastName.value){
        await userType(action.pid,'input.ytm-create-core-identity-channel-content-renderer-family-name-input',randomString(),lastName)
    }
    await userClick(action.pid,'[data-style="STYLE_PRIMARY"]')
    await sleep(10000)
    await updateActionStatus(action.pid,action.id,LOGIN_STATUS.SUCCESS)
}

async function updateInfo(action){
    let url = window.location.toString()
    try{
        if(url.indexOf('gender') > -1){
            if(document.querySelector('[name="c1"][value="4"][checked]')){
                await userClick(action.pid,`[name="c1"][value="${randomRanger(2,3)}"]`)
                await sleep(5000)
            }
        }
        else if(url.indexOf('birthday') > -1){
            if(![...document.querySelectorAll('input[type="text"][value]')].filter(x =>  x.value).length){
                await userClick(action.pid,'div[role="combobox"]')
                await sleep(1000)
                let months = [...document.querySelectorAll('ul li')]
                let randMonth = months[randomRanger(1,months.length - 1)]
                randMonth.scrollIntoView({block: "center"})
                await userClick(action.pid,'ul li',randMonth)
                await sleep(1000)
                await userType(action.pid,'#i7',randomRanger(1,30))
                await userType(action.pid,'#i9',randomRanger(1980,2001))
                await userClick(action.pid,'button[type="submit"] span')
                await sleep(randomRanger(3,5)*1000)
                await userClick(action.pid,'button[data-mdc-dialog-action="ok"] span')
                await sleep(randomRanger(3,5)*1000)
            }
        }
    }
    catch(e){
        console.log('error',changeInfo,e)
    }
    finally{
        if(url.indexOf('birthday') > -1){
            // await updateActionStatus(action.pid,action.id,LOGIN_STATUS.SUCCESS)
            await goToLocation(action.pid, 'youtube.com/create_channel')
        }
        else{
            await goToLocation(action.pid,'myaccount.google.com/birthday')
        }
    }
}

async function pauseInfo(action) {
    try {
        let btnOff = document.querySelector('div[data-is-touch-wrapper] > button[data-is-on="true"]')
        if (btnOff) {
            await userClick(action.pid,'div[data-is-touch-wrapper] > button[data-is-on="true"]', btnOff)
            await sleep(1000)
            await userScrollMobile(action.pid, 20)
            let pause = document.querySelectorAll('div[jsslot] div[data-is-touch-wrapper] > button > span').item(1)
            if (pause) {
                await userClick(action.pid,'Pause btn', pause)
            }
            await sleep(4000)
        }
    } catch (error) {
        
    } finally {
        handleLoginSuccess(action)
    }
}

async function pauseHistory(action){
    try {
        let btnOff = document.querySelector('div[data-is-touch-wrapper] > button[data-is-on="true"]')
        if (btnOff) {
            await userClick(action.pid,'div[data-is-touch-wrapper] > button[data-is-on="true"]', btnOff)
            await sleep(1000)
            await userScrollMobile(action.pid, 20)
            let pause = document.querySelectorAll('div[jsslot] div[data-is-touch-wrapper] > button > span').item(1)
            if (pause) {
                await userClick(action.pid,'Pause btn', pause)
            }
            await sleep(4000)
        }
    } catch (error) {
        
    } finally {
        await goToLocation(action.pid, 'https://myactivity.google.com/activitycontrols?time=' + Date.now())
        await sleep(60000)
    }
}

async function oldPauseHistory(action){
    try{
        let pauseIcon = document.querySelector('ytd-button-renderer path[d="M11,16H9V8h2V16z M15,8h-2v8h2V8z M12,3c4.96,0,9,4.04,9,9s-4.04,9-9,9s-9-4.04-9-9S7.04,3,12,3 M12,2C6.48,2,2,6.48,2,12 s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2L12,2z"]')
        if(!pauseIcon) return
        await userClick(action.pid,'saved history button',pauseIcon)
        await sleep(4000)
        let historyOnInput = document.querySelector('.yt-confirm-dialog-renderer #confirm-button')
        if(historyOnInput){
            console.log('pauseHistory')
            //historyOnInput.click()
            await userClick(action.pid,'.yt-confirm-dialog-renderer #confirm-button',historyOnInput)
            await sleep(4000)
           // await userClick(action.pid,'[role="dialog"] button[jsname] span')
           // await sleep(3000)
           // await waitForSelector('[role="dialog"] input:not([checked])')
           // await userClick(action.pid,'[role="dialog"] button')
           // await sleep(3000)
            // if(document.querySelector('[role="list"] [role="listitem"]')){
            //     await userClick(action.pid,'c-wiz[data-p*="activitycontrols"] > div > div > div:nth-child(2) > div:nth-child(2) button span')
            //     await sleep(2000)
            //     await userClick(action.pid,'[role="dialog"] ul > li:nth-child(3)')
            //     await sleep(3000)
            //     let btns = [...document.querySelectorAll('[role="dialog"] button:not([aria-label])')]
            //     await userClick(action.pid,'delete history',btns[btns.length-1])
            //     await sleep(5000)
            // }
        }
    }
    catch(e){
        console.log('error','pauseHistory',e)
    }
}

async function changePassword(action){
    try{
        await sleep(5000)
        let url = window.location.toString()
        if (url.indexOf('https://myaccount.google.com/security') == 0) {
            if(!action.newRecoveryMail){
                await userClick(action.pid,'a[href^="recovery/email"]')
            }
            if(!action.newPassword){
                await userClick(action.pid,'a[href^="signinoptions/password"]')
            }
            else{
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS,'PASSWORD_'+action.newPassword)
            }
            return
        }
        else if (url.indexOf('https://myaccount.google.com/signinoptions/password') == 0) {
            let newPassword = Math.random().toString(36).slice(9).toLocaleUpperCase() + Math.random().toString(36).slice(randomRanger(2,5))
            action.newPassword = newPassword
            await setActionData(action)
            await userType(action.pid,'input[name="password"]',newPassword)
            await sleep(randomRanger(3,5)*1000)
            await userType(action.pid,'input[name="confirmation_password"]',newPassword)
            await sleep(randomRanger(3,5)*1000)
            await userClick(action.pid,'button[type="submit"]')
            await sleep(10000)
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS,'PASSWORD_'+action.newPassword)
            return
        }
        else if (url.indexOf('https://myaccount.google.com/recovery/email') == 0) {
            let chars = 'abcdefghijklmnopqrstuvwxyz'
            let domain = Math.random() < 0.5?'@hotmail.com':'@outlook.com'
            let newRecoveryMail = chars[randomRanger(0,chars.length-1)] + Math.random().toString(36).slice(9).toLocaleUpperCase() + Math.random().toString(36).slice(randomRanger(2,5)) + domain
            action.newRecoveryMail = newRecoveryMail
            await setActionData(action)
            document.querySelector('form input[placeholder]').value = ""
            await userType(action.pid,'form input[placeholder]',newRecoveryMail)
            await sleep(randomRanger(3,5)*1000)
            await userClick(action.pid,'button[type="submit"]')
            await sleep(randomRanger(3,5)*1000)
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS,'RECOVERYMAIL_'+action.newRecoveryMail,false)
            await sleep(randomRanger(3,5)*1000)
            await goToLocation(action.pid, 'myaccount.google.com/security')
            return
        }
        else if (url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
            console.log('enter password')
            await userTypeEnter(action.pid, "input[name='password']", action.password)
            await sleep(60000)
        }
        else{
            await beforeLoginSuccess(action) // login success
        }
    }
    catch(e){
        await beforeLoginSuccess(action) // login success
    }
}

async function userConfirm(action) {
    try {
        await sleep(5000)
        let url = window.location.toString()
        if(url == 'https://families.google.com/families'){
            let leaveFamilyGroup = document.querySelector('[aria-label="Leave family group"],[aria-label="Delete family group"]')
            if(leaveFamilyGroup){
                leaveFamilyGroup.click()
            }
            else{
                await goToLocation(action.pid,'gmail.com')
            }
            
        }
        else if(url.indexOf('https://families.google.com/families/member/') == 0 && url.indexOf('/remove') > 0){
            let leaveFamilyGroupConfirm = document.querySelector('[role=button][data-removeself="true"]')
            await userClick(action.pid,'[role=button][data-removeself="true"]',leaveFamilyGroupConfirm)
        }
        else if(url.indexOf('https://families.google.com/families/delete') == 0){
            let deleteButton = [...document.querySelectorAll('[data-age] [role=button]')][1]
            await userClick(action.pid,'[data-age] [role=button]',deleteButton)
        }
        else if(url.indexOf('https://pay.google.com/') == 0 && url.indexOf('settings') > 0){
            let i = 0
            while(!action.current_country){
                i++
                if(i > 30) throw 'GET_COUNTRY'
                console.log('wait for country info...')
                let data = await getActionData()
                action = data.action
                await sleep(2000)
            }
            if(action.current_country != action.country){
                await userClick(action.pid,('c-wiz a[jsaction][jslog]'))
                await sleep(5000)
            }
            else{
                throw 'SAME_COUNTRY'
            }
        }
        else if(url.indexOf('https://payments.google.com/payments') == 0 && url.indexOf('embedded_settings') > 0){
            if(document.querySelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text')){
                await waitForSelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text')
                let country = document.querySelector('[data-title="Country/Region"] .b3id-collapsing-form-summary-text').textContent
                console.log('country',country)
                if(!country) throw 'COUNTRY_UNDEFINED'
                if(country != action.country){
                    action.current_country = country
                    await setActionData(action)
                }
                else {
                    // await goToLocation(action.pid,'gmail.com')
                    action.country = 'Taiwan (TW)'
                    action.current_country = country
                    await setActionData(action)
                }
            }
        }
        else if(url.indexOf('https://payments.google.com/payments/') == 0 && url.indexOf('wipeout') > 0){
            if(document.querySelector('[data-name="closureReasonSelector"] [role="listbox"]')){
                await waitForSelector('[data-name="closureReasonSelector"] [role="listbox"]')
                document.querySelector('.b3id-form-field.b3-simple-form-form-field').remove()
                await sleep(1000)
                //process closing payment profile
                await userClick(action.pid,'[data-name="closureReasonSelector"] [role="listbox"]')
                await sleep(3000)
                let items = [...document.querySelectorAll('.goog-menu .goog-menuitem')]
                let item = items[randomRanger(0,items.length - 2)]
                item.scrollIntoView({block: "center"})
                console.log(item.getBoundingClientRect())
                await userSelect(action.pid,randomRanger(1,items.length - 3))
                // await userClick(action.pid,'.goog-menu .goog-menuitem',item)
                await sleep(3000)
                document.querySelector('[data-component-name="SIMPLE_FORM"] [role="button"][class*="button-action"]').click()
                await userClick(action.pid,'[data-component-name="SIMPLE_FORM"] [role="button"][class*="button-action"]')
                await sleep(5000)
                await waitForSelector('[role="button"][class*="primary-button"]')
                await userClick(action.pid,'[role="button"][class*="primary-button"]')
            }
        }
        else if(url.indexOf('https://payments.google.com/payments/') == 0 && url.indexOf('instrument_manager') > 0){
            if(document.querySelector('input[name="cardnumber"]')){
                await waitForSelector('input[name="cardnumber"]')
                // fill card detail
                
                await userType(action.pid,'input[name="cardnumber"]',action.cardnumber)
                await sleep(2000)
                await userType(action.pid,'.b3id-card-month-input .b3-text-input-container',randomRanger(1,12))
                await sleep(3000)
                await userType(action.pid,'.b3id-card-year-input .b3-text-input-container',randomRanger(22,25))
                await sleep(2000)
                await userType(action.pid,'.b3id-security-code-input .b3-text-input-container input',randomRanger(101,900))
                await sleep(10000)

                document.querySelector('.b3-credit-card-flexy-numeric-fields-container').remove()
                document.querySelector('.b3id-cardholder-name-input').remove()
                await sleep(1000)
                let country = document.querySelector('.b3id-countryselector-editable-container .goog-menuitem-content')
                await userClick(action.pid,'.b3-credit-card-billing-address-collapsing-form .b3-collapsing-form-placeholder-text')
                await sleep(5000)
                country.scrollIntoView({block: "center"})
                await userClick(action.pid,'.b3id-countryselector-editable-container .goog-menuitem-content',country)
                await sleep(3000)
                await userClick(action.pid,`.goog-menuitem[data-value="${action.country.split('(').pop().split(')')[0]}"] .goog-menuitem-content`)
                await sleep(5000)
                if(country.textContent != action.country){
                    return
                }
                
                // get suggest address 1
                i = 0
                if(action.country != 'Taiwan (TW)'){
                    let addresses = [...document.querySelectorAll('.ac-renderer[role="listbox"] .ac-row')]
                    while(addresses.length == 0){
                        i++
                        if(i > 5) throw 'SELECT_ADDRESS'
                        document.querySelector('[data-name="ADDRESS_LINE_1"] input').value = ""
                        await sleep(1000)
                        let chars = 'abcdefghijklmnopqrstuvwxyz'
                        await userType(action.pid,'[data-name="ADDRESS_LINE_1"] input',randomRanger(1,9) + chars[randomRanger(0,chars.length-1)])
                        await sleep(3000)
                        addresses = [...document.querySelectorAll('.ac-renderer[role="listbox"] .ac-row')]
                        if(addresses.length){
                            let address = addresses[randomRanger(0,addresses.length-1)]
                            address.scrollIntoView({block: "center"})
                            await userSelect(action.pid,randomRanger(1,addresses.length))
                            break
                        }
                        else{
                            await sleep(2000)
                        }
                    }
                }
                else{
                    let streets = ['Civic Boulevard','Dihua Street','Dunhua Road','Fuxing Road','Guangfu Road','Heping Road','Jianguo Road','Keelung Road','Ketagalan Boulevard','Minsheng Road','Nanjing Road','Renai Road','Roosevelt Road','Xinsheng Road','Xinyi Road','Zhongshan Road','Zhongxiao Road','Sanxia Old Street','Shenkeng Old Street','Tamsui Old Street','Wulai Old Street','Yizhong Street','Anping Old Street','Ciaonan Street','Xinhua Old Street','Sanfong Central Street','Fenchihu Old Street','Boyu Road','Mofan Street','Central Street','Daxi Old Street','Toucheng Old Street']
                    let address = document.querySelector('input[name="ADDRESS_LINE_1"]')
                    while(!address.value){
                        try{
                            await userType(action.pid,'input[name="ADDRESS_LINE_1"]',streets[randomRanger(0,streets.length - 1)])
                            await sleep(3000)
                            if(!document.querySelector('[data-name="ADMIN_AREA"] .goog-menuitem-content')){
                                // fix fail first time
                                await userClick(action.pid,'[data-name="LOCALITY"] .addressedit-select')
                                await sleep(2000)
                                await userSelect(action.pid,randomRanger(1,7))
                                await sleep(5000)
                                await userClick(action.pid,'[data-name="LOCALITY"] .addressedit-select')
                                await sleep(2000)
                            }
                            else{
                                await userClick(action.pid,'[data-name="ADMIN_AREA"] .goog-menuitem-content')
                            }
                            
                            await sleep(2000)
                            await userSelect(action.pid,randomRanger(1,22))
                            await sleep(5000)
                            await userClick(action.pid,'[data-name="LOCALITY"] .addressedit-select')
                            await sleep(2000)
                            await userSelect(action.pid,randomRanger(1,7))
                            await sleep(2000)
                            let city = document.querySelector('[data-name="ADMIN_AREA"] .goog-menuitem-content').textContent.trim()
                            let district = document.querySelector('[data-name="LOCALITY"] .addressedit-select').textContent.trim()
                            let zc = getTWZipcode(city,district) || ""
                            await userType(action.pid,'input[name="POSTAL_CODE"]',zc)
                            await sleep(2000)
                            if([...document.querySelectorAll('.b3-address-edit-error-message')].map(x => x.textContent).join("") || district == 'City/District' || city == 'County/City'){
                                address.value = ""
                                document.querySelector('input[name="POSTAL_CODE"]').value = ""
                                await sleep(1000)
                            }
                            else{
                                break
                            }
                        }
                        catch(e){
                            console.log(e)
                            address.value = ""
                            document.querySelector('input[name="POSTAL_CODE"]').value = ""
                        }
                    }
                }

                await sleep(3000)
                document.querySelector('.b3-credit-card-billing-address-collapsing-form').remove()
                await sleep(3000)
                document.querySelector('.submit-button').click()
                await userClick(action.pid,'.submit-button')
                await sleep(30000)
                await goToLocation(action.pid,'gmail.com')
            }
        }
        else if(url.indexOf('https://support.google.com/pay/') == 0){
            await goToLocation(action.pid,'pay.google.com')
        }
        else if(url.indexOf('https://pay.google.com/gp/w/u/0/home/signup') == 0){
            await userClick(action.pid,'c-wiz button div')
        }
        else if(url.indexOf('https://accounts.google.com/signin/v2/challenge/pwd') == 0){
            await waitForSelector('input[type="password"]')
            document.querySelector('input[type="password"]').value = action.password
            await sleep(5000)
            document.querySelector('#passwordNext button').click()
        }
        else if(url.indexOf('https://mail.google.com/') == 0){
            let webLink = document.querySelector('a')
            if(webLink && webLink.textContent.indexOf('web version') >=0){
                await userClick(action.pid,'a',webLink)
                await sleep(5000)
            }
            await waitForSelector('[role="listitem"] div')
            await sleep(5000)
            // check invited
            // let invited = [...document.querySelectorAll('[role="listitem"]')].filter(x => x.textContent.indexOf('Welcome to YouTube Premium') >= 0).length > 0
            // if(invited){
            //     throw 'INVITED'
            // }
            // get invite item
            // search
            await userClick(action.pid,'input[type="search"]')
            await sleep(2000)
            await userTypeEnter(action.pid,'input[type="search"]','invited you')
            await sleep(3000)
            let inviteMail = [...document.querySelectorAll('[role="listitem"]')].filter(x => x.textContent.indexOf('invited you') > 0)
            if(inviteMail.length == 0) throw 'NO_INVITE_MAIL'
            await userClick(action.pid,'invite mail',inviteMail[0])
            await sleep(5000)
            await waitForSelector('a[href^="https://families.google.com/"],a[href^="https://notifications.googleapis.com/email/redirect"]')
            let inviteLink = document.querySelector('a[href^="https://families.google.com/"],a[href^="https://notifications.googleapis.com/email/redirect"]')
            await goToLocation(action.pid,inviteLink.href)
        }
        else if(url.indexOf('https://families.google.com/join/promo') == 0){
            let familiesLink = document.querySelector('[href="https://myaccount.google.com/preferences#family"]')
            if(familiesLink) throw 'INVITED'
            await waitForSelector('div[role="button"] span')
            await userClick(action.pid,'div[role="button"] span')
        }
        else if(url.indexOf('https://families.google.com/join/profile') == 0){
            let joinLink = [...document.querySelectorAll('div[role="button"]')].filter(x => x.textContent.toLowerCase().indexOf('join') >= 0)
            if(joinLink.length == 0) throw 'JOIN_PROFILE_NO_BUTTON'
            await userClick(action.pid,'join profile button',joinLink[0])
            await sleep(10000)
            let alertMsg = document.querySelector('[role="alertdialog"] > span')
            if(alertMsg){
                let joinRetry = !action.country?0:2
                if(action.join_wait && action.join_wait > joinRetry) throw alertMsg.textContent
                action.join_wait = action.join_wait ? action.join_wait + 1 : 1
                await setActionData(action)
                await sleep(30000)
                await goToLocation(action.pid,url)
            }
        }
        else if(url.indexOf('https://families.google.com/join/done') == 0){
            await beforeLoginSuccess(action) // login success
        }
        else if(url.indexOf('https://www.google.com/gmail/about') == 0){
            await goToLocation(action.pid,'gmail.com')
        }
        // else if(url.indexOf('https://payments.google.com/payments') == 0){
        //     console.log(url)
        // }
        else{
            throw 'unknown_url_' + url.split('?')[0]
        }
    }
    catch(e){
        console.log('error',e)
        if(e.toString().indexOf('different country') > -1 && action.country != 'Taiwan (TW)'){
            // action.country = !action.country ? 'United States (US)':'Taiwan (TW)'
            action.country = !action.country ? 'United Kingdom (GB)':'Taiwan (TW)'
            await setActionData(action)
            await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
        }
        else{
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR,e.toString() == 'INVITED'?'CONFIRM_SUCCESS_INVITED':'CONFIRM_ERROR_'+e.toString())
        }
    }
}

function getTWZipcode(city,district){
    let tw = {
        "Changhua County": {
            "Beidou Township": "52141 52142 52143 52144 52145 52146 52147 52148 52149",
            "Changhua City": "50001 50002 50003 50004 50005 50006 50007 50008 50009 50041 50042 50043 50044 50045 50046 50047 50048 50049 50050 50051 50052 50053 50054 50055 50056 50057 50058 50059 50060 50061 50062 50063 50064 50065 50066 50067 50068 50069 50070 50071 50072 50073 50074 50075 50076 50077 50078 50079 50080 50081 50082 50083 50084 50085 50086 50087 50088 50089 50090 50091 50092 50093 50094 50095 50096 50097",
            "Dacheng Township": "52742 52743 52744 52745 52746 52747 52748 52751 52752 52753 52754 52755 52756 52761 52762 52763 52764 52765 52766 52767 52771 52772 52773 52774 52775",
            "Dacun Township": "51541 51542 51543 51544 51545 51546 51547 51591",
            "Erlin Township": "52601 52641 52642 52651 52652 52653 52654 52655 52656 52657 52658 52662 52663 52665 52666",
            "Ershui Township": "53041 53042 53043 53044",
            "Fangyuan Township": "52851 52858 52859 52860 52861 52862 52863 52864 52865",
            "Fenyuan Township": "50241 50242 50243 50244 50245",
            "Fuxing Township": "50641 50642 50643 50644 50645 50646 50647 50648 50649 50660 50661 50662",
            "Hemei Township": "50841 50842 50843 50844 50845 50846 50847 50848 50849 50850 50851 50852 50853 50854 50855 50856 50860 50861 50862",
            "Huatan Township": "50301 50341 50342 50343 50344 50345 50346 50347 50348 50349 50350 50351 50352 50353",
            "Lukang Township": "50541 50542 50543 50544 50545 50546 50547 50548 50549 50550 50551 50562 50563 50564 50565 50566 50567 50568 50569 50570 50571",
            "Pitou Township": "52341 52342 52343 52344 52345 52350 52391",
            "Puxin Township": "51341 51342 51343 51344 51345 51346 51347",
            "Puyan Township": "51641 51642 51643 51644 51645 51646 51647 51648 51649",
            "Shengang Township": "50941 50951 50952 50953 50954 50955 50956 50971",
            "Shetou Township": "51141 51143 51145 51147 51149 51151 51153 51155",
            "Tianwei Township": "52241 52242 52243 52244 52245 52249 52250",
            "Tianzhong Township": "52041 52042 52043 52044 52045 52046 52047 52048 52049",
            "Xianxi Township": "50741 50742 50743 50744",
            "Xihu Township": "51441 51442 51443 51444 51445 51446 51447 51448 51449"
        },
        "Chiayi County": {
            "Alishan Township": "60592",
            "Budai Township": "62541 62542 62543 62544 62545 62546 62547 62548 62549",
            "Dalin Township": "62241 62242 62243 62244 62245 62246 62247 62248 62249 62250 62251 62252 62253 62254 62255",
            "Dapu Township": "60741 60791 60792 60793 60794",
            "Dongshi Township": "61441 61442 61443 61444 61445 61446 61447 61448 61449 61450 61451 61452 61453",
            "Fanlu Township": "60241 60242 60243 60244 60245 60246 60247",
            "Liujiao Township": "61541 61542 61543 61544 61545 61546 61547 61548 61549 61550 61551 61552 61553 61554 61555 61556 61557 61558 61559 61560 61561 61562 61563 61564 61565",
            "Lucao Township": "61141 61142 61143 61144 61145 61146 61147 61149 61150 61151 61152 61153 61154 61155 61156 61157 61158 61159 61160 61161 61163",
            "Meishan Township": "60341 60342 60343 60344 60345 60346 60347 60348 60349 60391",
            "Minxiong Township": "62102 62103 62141 62142 62143 62144 62145 62146 62147 62148 62149 62150 62151 62152 62153 62154 62155 62156 62157 62158 62159",
            "Puzi City": "61341 61343 61345 61347 61349 61351 61353 61355 61357 61359 61361 61363",
            "Shuishang Township": "60841 60842 60843 60845 60848 60849 60850 60851 60852 60853 60854 60855 60856 60857 60858 60859 60860",
            "Taibao City": "61241 61242 61243 61244 61245 61246 61247 61248 61249 61250 61251 61252 61253 61254 61255 61256 61257",
            "Xikou Township": "62341 62342 62343 62345 62346 62347 62348 62349 62350",
            "Xingang Township": "61641 61642 61691 61692 61693",
            "Yizhu Township": "62441 62442 62443 62444 62445 62446 62447",
            "Zhongpu Township": "60641 60642 60643 60644 60645 60646 60647 60648 60649 60650 60651 60652 60653 60654 60655 60656 60657 60658 60659 60660 60661 60662 60663 60664 60665 60666 60667 60668 60669 60691",
            "Zhuqi Township": "60441 60442 60443 60444 60445 60446 60447 60491 60492 60493 60494 60495 60496 60497 60498"
        },
        "Chiayi City": {
            "East District": "60001 60002 60003 60004 60005 60006 60007 60041 60042 60043 60044 60045 60046 60047 60048 60049 60050 60057 60061 60062 60063 60064 60065 60066 60067 60068 60069 60070 60071 60072 60073 60074 60075 60076 60077 60078 60079 60080 60081 60082 60094",
            "West District": "60041 60042 60043 60044 60045 60046 60047 60048 60049 60050 60051 60052 60053 60054 60055 60056 60057 60058 60059 60060 60061 60062 60064 60068 60080 60081 60082 60083 60084 60085 60086 60088 60089 60090 60091 60092 60093 60094 60095 60096 60097"
        },
        "Hsinchu County": {
            "Baoshan Township": "30075 30076 30077 30841 30842 30843 30844 30845",
            "Beipu Township": "31441 31442 31443 31444",
            "Emei Township": "31541 31542 31543",
            "Guanxi Township": "30641 30642 30643 30644 30645 30646 30647 30648 30649",
            "Hengshan Township": "31241 31242 31243 31244",
            "Hukou Township": "30301 30341 30342 30343 30344 30345 30346 30347 30348 30349 30350 30351 30352 30353 30371 30372 30373",
            "Jianshi Township": "31341 31342 31343 31344 31345",
            "Qionglin Township": "30740 30741 30742 30743 30744 30745 30746",
            "Wufeng Township": "31141",
            "Xinfeng Township": "30401 30441 30442 30443 30444 30445 30446 30447 30448 30471 30472 30473",
            "Xinpu Township": "30541 30542 30543 30544 30545 30546 30547 30548 30550 30595 30597 30598 30599",
            "Zhubei City": "30210 30211 30213 30241 30242 30243 30244 30251 30252 30253 30259 30261 30262 30263 30264 30265 30266 30267 30268 30269 30271 30272 30273 30274 30281 30282 30283 30284 30285 30286 30287 30288 30295",
            "Zhudong Township": "31040 31041 31042 31043 31044 31045 31046 31047 31048 31051 31052 31053 31054 31055 31061 31062 31063 31064 31065 31066"
        },
        "Hsinchu City": {
            "East District": "30010 30011 30013 30014 30016 30017 30041 30042 30043 30044 30045 30046 30050 30051 30052 30054 30059 30060 30061 30062 30063 30064 30065 30066 30067 30068 30069 30070 30071 30072 30073 30074 30075 30076 30077 30078 30079 30080",
            "North District": "30041 30042 30044 30045 30046 30047 30048 30049 30050 30051 30052 30053 30054 30055 30056 30057 30058 30059 30060 30063 30065",
            "Xiangshan District": "30012 30015 30046 30047 30056 30058 30060 30065 30067 30090 30091 30092 30093 30094 30095"
        },
        "Hualien County": {
            "Fengbin Township": "97791 97792",
            "Fenglin Township": "97541 97542 97543 97544 97545 97546",
            "Fuli Township": "98341 98342 98343 98347 98391 98392",
            "Guangfu Township": "97641 97642 97643 97644 97645",
            "Hualien City": "97001 97002 97004 97005 97041 97042 97043 97044 97045 97046 97047 97048 97049 97050 97051 97052 97053 97054 97055 97056 97057 97058 97059 97060 97061 97062 97063 97064 97065 97066 97067 97068 97069 97070 97071 97072 97073 97074 97075 97076 97077 97078",
            "Ji'an Township": "97341 97342 97343 97344 97345 97346 97347 97348 97349 97350 97351 97352 97353 97354 97355 97356 97357 97358 97359 97360 97361 97362 97363 97364 97365 97366 97367 97368 97369 97370",
            "Ruisui Township": "97841 97842 97843 97844",
            "Shoufeng Township": "97401 97441 97442 97443 97444 97445 97446 97447 97448 97449 97450 97451 97491",
            "Wanrong Township": "97942 97943 97991 97992",
            "Xincheng Township": "97141 97142 97143 97144 97145 97146 97147 97148 97149 97150 97151 97161 97162 97163",
            "Xiulin Township": "97241 97242 97243 97244 97245 97251 97252 97253 97261 97262 97291",
            "Yuli Township": "98141 98142 98143 98144 98145 98146 98147 98148 98149 98191",
            "Zhuoxi Township": "98241 98246 98249 98291 98292"
        },
        "Kaohsiung City": {
            "Alian District": "82241 82242 82243 82244 82245 82246 82247 82248",
            "Daliao District": "83101 83102 83141 83142 83143 83144 83145 83146 83147 83148 83149 83150 83151 83152 83153 83154 83155 83156 83157 83158 83159 83160 83161 83162 83163 83164 83165 83166 83167",
            "Dashe District": "81541 81542 81543 81544 81545 81546 81547 81549 81566 81567 81568",
            "Dashu District": "84001 84041 84042 84043 84044 84045 84046 84047 84048 84049 84050",
            "Fengshan District": "83001 83002 83003 83004 83005 83041 83042 83043 83044 83045 83046 83047 83048 83049 83050 83051 83052 83053 83054 83055 83056 83057 83058 83059 83060 83061 83062 83063 83064 83065 83066 83067 83068 83069 83070 83071 83072 83073 83074 83075 83076 83077 83078 83079 83080 83081 83082 83083 83084 83085 83086 83087 83088 83089 83090 83091 83092 83093 83094 83095 83096",
            "Gangshan District": "82041 82042 82043 82044 82045 82046 82047 82048 82049 82050 82051 82052 82053 82054 82055 82056 82057 82058 82059 82060 82061 82062 82063 82064 82065 82066 82091",
            "Gushan District": "80402 80424 80441 80442 80443 80444 80445 80446 80447 80448 80449 80450 80451 80452 80453 80454 80455 80456 80457 80458 80459 80460 80461 80462 80463 80464 80465 80466 80467 80468 80469 80470 80471 80472",
            "Hunei District": "82941 82942 82943 82944 82945 82946 82947",
            "Jiaxian District": "84741 84742",
            "Lingya District": "80201 80203 80241 80242 80243 80244 80245 80247 80248 80249 80250 80251 80252 80253 80261 80262 80263 80264 80265 80266 80271 80272 80273 80274 80275 80276 80281 80282 80283 80284 80285 80286 80287 80288 80289 80290 80292 80293",
            "Linyuan District": "83241 83242 83243 83244 83245 83246 83247 83248 83249 83250 83251 83252 83253 83254",
            "Liugui District": "84441 84442 84443 84444 84445",
            "Luzhu District": "82141 82142 82143 82144 82145 82146 82147 82148 82149 82150 82151 82152",
            "Meinong District": "84341 84342 84343 84344 84345 84346 84347 84348 84349 84350",
            "Mituo District": "82741 82742 82743"
        },
        "Keelung City": {
            "Anle District": "20401 20402 20441 20442 20443 20444 20445 20446 20447 20448 20449 20491",
            "Nuannuan District": "20541 20542 20543 20544 20545 20546 20547",
            "Qidu District": "20641 20642 20643 20644 20645 20646 20647 20648 20649 20650 20651 20652 20653",
            "Ren'ai District": "20001 20018 20041 20042 20043 20044 20045 20046 20047 20048 20049 20050 20051",
            "Xinyi District": "20101 20102 20103 20141 20142 20143 20144 20145 20146 20147 20148 20150 20151",
            "Zhongshan District": "20301 20341 20342 20343 20344 20345 20346 20347 20348 20349 20350",
            "Zhongzheng District": "20201 20202 20203 20224 20241 20242 20243 20244 20245 20246 20247 20248 20249 20250 20251"
        },
        "Kinmen County": {
            "Jincheng Township": "89344 89345 89346 89347 89348 89350",
            "Jinhu Township": "89141 89142 89143 89146 89148 89149 89150",
            "Jinning Township": "89244 89246 89248 89250",
            "Jinsha Township": "89041 89042 89043 89049",
            "Lieyu Township": "89441 89442"
        },
        "Lienchiang County": {
            "Beigan Township": "21041 21042",
            "Dongyin Township": "21241",
            "Juguang Township": "21141 21191",
            "Nangan Township": "20941 20942"
        },
        "Miaoli County": {
            "Dahu Township": "36441 36442 36443 36444 36445 36446 36447",
            "Gongguan Township": "36341 36342 36343 36344 36345 36346 36347 36348 36350",
            "Houlong Township": "35641 35642 35643 35644 35645 35646 35647 35648 35649 35650 35651 35652 35653 35654 35655 35656 35657 35658 35659 35660 35661 35662 35663 35664 35665 35666 35667 35668 35669 35670",
            "Miaoli City": "36001 36002 36003 36041 36042 36043 36044 36045 36046 36047 36048 36049 36050 36051 36052 36053 36054 36055 36056 36057 36058 36059 36060 36061 36062 36063",
            "Nanzhuang Township": "35341 35342 35343 35344 35345 35346",
            "Sanwan Township": "35241 35242 35243 35244",
            "Sanyi Township": "36741 36742 36743 36744 36745",
            "Shitan Township": "35441 35442 35443",
            "Tai'an Township": "36541 36542 36543 36544 36545",
            "Tongluo Township": "36641 36642 36643 36645 36646 36647",
            "Tongxiao Township": "35741 35742 35743 35744 35745 35746 35747 35748 35749 35750",
            "Toufen Township": "35141 35142 35143 35144 35145 35146 35147 35148 35149 35150 35151 35152 35153 35154 35155 35156 35157 35158 35159 35160 35161 35162 35163",
            "Touwu Township": "36241 36242 36243 36244",
            "Xihu Township": "36841 36842 36843",
            "Yuanli Township": "35841 35842 35843 35844 35845 35846 35847 35848 35849 35850 35851 35852 35853 35854 35855 35856 35857 35858 35859 35860 35861 35862 35863 35864 35865 35866 35867 35868 35869 35870 35871 35872 35873 35874 35875 35876 35877 35878 35879",
            "Zaoqiao Township": "36141 36142 36143 36144",
            "Zhunan Township": "35041 35042 35043 35044 35045 35046 35047 35048 35049 35050 35051 35053 35054 35055 35056 35057 35058 35059",
            "Zhuolan Township": "36941 36942 36943 36944 36945 36951"
        },
        "Nantou County": {
            "Caotun Township": "54241 54242 54243 54244 54245 54246 54247 54248 54249 54250 54251 54252 54253 54254 54255 54256 54257 54258 54259 54260 54261 54262 54263 54264 54265",
            "Guoxing Township": "54441 54442 54443 54444 54445 54446 54447 54448",
            "Jiji Township": "55241 55242 55243 55244",
            "Lugu Township": "55841 55842 55843 55844 55851 55855 55861 55896",
            "Mingjian Township": "55141 55142 55143 55144 55145 55146 55147 55148 55151 55152 55153",
            "Nantou City": "54001 54002 54003 54041 54042 54043 54044 54045 54046 54047 54048 54049 54050 54051 54052 54056 54057 54058 54059 54060 54061 54062 54063 54064 54065 54066 54067 54068 54069 54070 54071",
            "Puli Township": "54541 54542 54543 54544 54545 54546 54547 54548 54549 54550 54551 54552 54553 54554 54555 54556 54557 54558 54559 54560 54561 54568",
            "Ren'ai Township": "54641 54651 54652 54653 54661 54662 54663 54664 54665 54666 54667 54668 54669 54670 54671 54691 54692",
            "Shuili Township": "55341 55342 55343 55344 55345 55346 55347 55348 55349 55350 55351 55352 55353 55381 55382",
            "Xinyi Township": "55641 55642 55643 55644 55646 55647 55648 55649 55650 55651 55652 55653 55654 55681 55682 55691 55692",
            "Yuchi Township": "55541 55542 55543 55544 55545 55546 55547 55548",
            "Zhongliao Township": "54151 54153 54154 54155",
            "Zhushan Township": "55741 55742 55743 55744 55745 55746 55747 55748 55749 55750 55751 55752 55753 55754 55755 55756 55757 55758 55759 55760 55761 55762 55763 55764 55765 55766 55767 55768 55769 55770 55771 55772 55773 55774 55775 55776 55777 55778 55779 55780 55781 55782 55783 55784 55791 55792 55793 55794 55795"
        },
        "New Taipei City": {
            "Bali Township": "24906 24931 24932 24933 24935 24936 24937 24941 24942 24943 24944 24945 24946 24947",
            "Banqiao District": "22001 22002 22005 22006 22007 22008 22041 22042 22043 22044 22045 22046 22047 22048 22049 22050 22051 22052 22053 22054 22055 22056 22057 22058 22060 22061 22062 22063 22064 22065 22066 22067 22068 22069 22070 22071 22072",
            "Danshuei Township": "25103 25135 25137 25141 25142 25143 25144 25145 25146 25147 25148 25149 25150 25151 25152 25153 25154 25155 25156 25157 25158 25159 25160 25161 25162 25163 25164 25165 25166 25167 25168 25169 25170 25171 25172 25173 25174",
            "Gongliao District": "22841 22842 22843 22844",
            "Jhonghe City": "23501 23503 23504 23505 23506 23507 23508 23509 23510 23511 23512 23541 23542 23543 23544 23545 23546 23547 23548 23549 23550 23551 23552 23553 23554 23555 23556 23557 23558 23559 23560 23561 23562 23563 23564 23565 23566 23567 23568 23569 23570 23571 23572 23573 23574 23575 23576 23577 23578 23579 23580 23581 23582 23583 23584 23585 23586",
            "Jinshan District": "20841 20842 20843 20844 20845 20846",
            "Linkou Township": "24441 24442 24443 24444 24445 24446 24447 24448 24449 24450 24451 24452 24453 24455 24456 24457 24458 24459 24460 24461 24462 24463 24464 24465 24466 24467",
            "Lujhou City": "24701 24741 24742 24743 24744 24745 24746 24747 24748 24749 24750 24751 24752 24753 24754 24755 24756 24757 24758 24759 24760 24761 24762 24763 24764 24765 24766 24767",
            "Pinglin District": "23241 23242 23243",
            "Pingxi District": "22641 22642 22643 22644",
            "Ruifang District": "22441 22442 22443 22444 22445 22446 22447 22448 22449 22450 22451 22452 22453 22454",
            "Sanchong City": "24101 24102 24103 24104 24141 24142 24143 24144 24145 24146 24147 24148 24149 24150 24151 24152 24153 24154 24155 24156 24157 24158 24159 24160 24161 24162",
            "Sanjhih Township": "25241 25242 25243 25244 25245 25246",
            "Sansia Township": "23701 23702 23703 23741 23742 23743",
            "Shenkeng District": "22201 22202 22203 22204 22205 22206 22241"
        },
        "Penghu County": {
            "Baisha Township": "88441 88442 88443 88444 88445 88446 88491",
            "Huxi Township": "88541 88542 88543 88591 88592 88593",
            "Magong City": "88041 88042 88043 88044 88045 88046 88047 88048 88049 88050 88051 88052 88053 88054 88055 88056 88057 88058 88059 88060",
            "Wang'an Township": "88241 88242 88243 88244 88245 88246",
            "Xiyu Township": "88141 88142 88143"
        },
        "Pingtung County": {
            "Changzhi Township": "90841 90842 90843 90844 90845 90846 90847",
            "Chaozhou Township": "92041 92042 92043 92044 92045 92046 92047 92048 92049 92050 92051 92052 92053 92054 92055 92061",
            "Checheng Township": "94441 94442 94443 94444 94445 94446 94447 94448 94449 94450",
            "Chunri Township": "94248 94249 94254",
            "Donggang Township": "92841 92842 92843 92844 92845 92846 92847 92848 92849 92850 92851",
            "Fangliao Township": "94041 94042 94043 94044 94045 94046 94047 94048 94049",
            "Fangshan Township": "94145 94150 94151 94152",
            "Gaoshu Township": "90641 90642 90643 90644 90645 90646",
            "Hengchun Township": "94641 94642 94643 94644 94645 94646 94647 94648",
            "Jiadong Township": "93141 93142 93143 93144 93145",
            "Jiuru Township": "90441 90442 90443 90444",
            "Kanding Township": "92441 92442 92443",
            "Laiyi Township": "92241 92242 92243 92244",
            "Ligang Township": "90541 90542 90543 90544 90545 90546",
            "Linbian Township": "92741 92742 92743 92744 92745 92746 92747 92748 92749",
            "Linluo Township": "90941 90942 90943",
            "Liuqiu Township": "92941 92942 92943",
            "Majia Township": "90341 90342",
            "Manzhou Township": "94741 94742 94743 94744",
            "Mudan Township": "94541 94542 94543 94544 94545 94591 94592",
            "Nanzhou Township": "92641 92642 92643",
            "Neipu Township": "91201 91202 91241 91242 91243 91244 91245 91246 91247 91248 91249 91250 91251 91252 91291",
            "Pingtung City": "90001 90002 90003 90004 90005 90006 90007 90008 90009 90010 90011 90012 90041 90042 90043 90044 90045 90046 90047 90048 90049 90050 90051 90052 90053 90054 90055 90056 90057 90058 90059 90060 90061 90062 90063 90064 90065 90066 90067 90068 90069 90070 90071 90073 90074 90075 90076 90077 90078 90079 90080 90081 90082 90083 90084 90085 90086 90087 90088 90089 90090 90091 90092 90093 90094 90095",
            "Sandimen Township": "90141 90142 90143 90191",
            "Shizi Township": "94350 94351 94352 94353",
            "Taiwu Township": "92141 92142 92143",
            "Wandan Township": "91341 91342 91343 91344 91345 91346 91347 91348 91349 91350",
            "Wanluan Township": "92341 92342 92343 92344 92345 92360 92361",
            "Wutai Township": "90241 90242 90243",
            "Xinpi Township": "92541 92542 92543 92544",
            "Xinyuan Township": "93241 93242 93243 93244 93245 93246 93247 93248 93249",
            "Yanpu Township": "90741 90742 90743 90744 90745"
        },
        "Taichung City": {
            "Beitun District": "40601 40641 40642 40643 40644 40645 40646 40647 40648 40649 40650 40651 40652 40653 40654 40661 40662 40663 40666 40667 40668 40669 40670 40671 40672 40673 40674 40675 40676 40677 40678 40679 40680 40681 40682 40683",
            "Central District": "40001 40010 40041 40042 40043 40044 40045 40046",
            "Da'an District": "43951 43952 43953 43954 43963 43964",
            "Dadu District": "43214 43241 43242 43243 43244 43245 43246 43247 43248 43249 43250 43251 43252",
            "Dajia District": "43741 43742 43743 43744 43745 43746 43747 43748 43749 43750 43752 43754 43755 43759 43761 43762 43765 43767 43768 43769 43770 43771 43773 43774",
            "Dali District": "41200 41241 41242 41243 41244 41245 41246 41247 41248 41249 41250 41251 41252 41253 41254 41255 41256 41257 41258 41259 41260 41261 41262 41263 41264 41265 41266 41267 41268 41269 41270 41271 41272 41273 41274 41275 41276 41277 41278 41279 41280 41281 41282 41283 41284 41285",
            "Daya District": "42800 42841 42842 42843 42844 42845 42846 42847 42848 42849 42850 42851 42852 42853 42854 42856 42857 42858 42859 42860 42861 42863 42864 42865 42866 42867 42869 42870 42871 42872 42873 42874 42875 42876 42877 42878 42879 42880 42881 42882",
            "Dongshi District": "42341 42342 42343 42344 42345 42346 42347 42348 42349 42350 42351 42352 42353 42354 42391",
            "East District": "40141 40142 40143 40144 40145 40146 40147 40148 40149 40150 40151 40152 40153 40154 40155",
            "Fengyuan District": "42007 42008 42026 42041 42042 42043 42044 42045 42046 42047 42048 42049 42050 42051 42052 42053 42054 42055 42056 42057 42058 42059 42060 42061 42071 42072 42073 42074 42075 42076 42077 42078 42079 42080 42081 42082 42083 42084 42085 42086 42087 42088",
            "Heping District": "42441 42442 42444 42445 42447 42448 42450 42451 42491 42492 42493 42494 42495",
            "Houli District": "42141 42142 42143 42144 42145 42146 42147 42148 42149 42150 42151 42152 42153 42154 42156 42157"
        },
        "Tainan City": {
            "Anding District": "74543 74544 74545 74546 74548 74549 74550 74551 74552 74553 74554 74555 74556 74557 74558 74559 74560 74561 74562",
            "Annan District": "70941 70942 70943 70944 70945 70946 70947 70948 70949 70950 70951 70952 70953 70954 70955 70956 70957 70958 70959 70960 70961 70962 70963 70964 70965 70966 70967 70968 70969 70970 70973 70975 70976",
            "Anping District": "70801 70802 70841 70842 70843 70844 70845 70846 70847 70848 70849 70850",
            "Baihe District": "73241 73242 73251 73252 73253 73254 73255 73256 73257 73258 73259",
            "Beimen District": "72742 72744 72746",
            "Danei District": "74242 74243 74244 74245 74246 74247 74248 74249 74250 74251 74252 74253 74254 74255 74256 74257 74258",
            "Dongshan District": "73343 73349 73350 73351 73352 73353 73354",
            "East District": "70101 70102 70141 70142 70143 70144 70145 70146 70147 70148 70149 70150 70151 70152 70153 70154 70155 70156 70157 70158 70159 70160 70161 70162 70163 70164 70165 70166 70167 70168 70169 70170 70171 70172 70173 70174 70175 70176",
            "Guanmiao District": "71841 71842 71843 71844 71845 71846 71847 71848",
            "Guantian District": "72041 72042 72043 72044 72045 72046 72047 72048 72081",
            "Guiren District": "71101 71102 71103 71104 71105 71141 71142 71143 71144 71145 71146 71147 71148 71149 71150 71151 71152",
            "Houbi District": "73141 73142 73143 73144 73145 73146 73147 73148 73149 73150 73151 73191",
            "Jiali District": "72241 72242 72243 72244 72245 72246 72247 72248 72249 72250 72251 72252 72253 72254 72255 72256 72257 72258 72259 72260 72261 72262 72263 72264 72265 72266 72267 72268 72269 72270",
            "Jiangjun District": "72541 72542 72543 72544 72545 72546 72547 72548 72549 72550",
            "Liujia District": "73441 73442 73443 73444 73445 73446",
            "Liuying District": "73656 73657 73658 73659 73663 73667 73691 73692",
            "Longqi District": "71941 71942",
            "Madou District": "72141 72142 72143 72144 72145 72146 72147 72148 72149 72150 72151 72152 72153 72154",
            "Nanhua District": "71641 71642 71651 71652",
            "Nanxi District": "71541 71542 71543 71544 71551",
            "North District": "70401 70402 70403 70441 70442 70443 70444 70445 70446 70447"
        },
        "Taipei City": {
            "Beitou District": "11201 11202 11217 11218 11219 11220 11221 11230 11241 11242 11243 11244 11245 11246 11247 11248 11249 11250 11251 11252 11253 11254 11255 11256 11257 11258 11259 11260 11261 11262 11263 11264 11265 11266 11267 11268 11269 11270 11271 11272 11273 11274 11275 11276 11277 11278 11279 11280 11281 11282 11283 11284 11285 11286 11287 11288 11289 11290 11291 11292",
            "Da'an District": "10601 10602 10603 10607 10608 10610 10612 10617 10622 10627 10629 10630 10633 10634 10636 10637 10641 10642 10643 10644 10645 10646 10647 10648 10649 10650 10651 10652 10653 10654 10655 10656 10657 10658 10659 10660 10661 10662 10663 10664 10665 10666 10667 10668 10669 10670 10671 10672 10673 10674 10675 10676 10677 10678 10679 10680 10681 10682 10683 10684 10685 10686 10687 10688 10689 10690 10691 10692 10693 10694 10695 10696 10697",
            "Datong District": "10341 10342 10343 10344 10345 10346 10347 10348 10349 10350 10351 10352 10353 10354 10355 10356 10357 10358 10359 10360 10361 10362 10363 10364 10365 10366 10367 10368 10369 10370 10371 10372 10373 10374 10375 10376",
            "Nangang District": "11501 11502 11503 11510 11529 11530 11551 11552 11553 11554 11555 11556 11557 11558 11559 11560 11561 11562 11563 11564 11565 11566 11567 11568 11569 11570 11571 11572 11573 11574 11575 11576 11577 11578 11579 11580 11581 11582",
            "Neihu District": "11441 11442 11443 11444 11445 11446 11447 11448 11449 11450 11451 11452 11453 11454 11455 11456 11457 11458 11459 11460 11461 11462 11463 11464 11465 11466 11467 11468 11469 11470 11471 11472 11473 11474 11475 11476 11477 11478 11479 11480 11481 11482 11483 11484 11485 11486 11487 11488 11489 11490 11491 11492 11493 11494",
            "Shilin District": "11101 11102 11103 11114 11141 11142 11143 11144 11145 11146 11147 11148 11149 11150"
        },
        "Taitung County": {
            "Beinan Township": "95441 95442 95443 95444 95483 95484 95491 95492 95493 95494 95495",
            "Changbin Township": "96241 96242 96243",
            "Chenggong Township": "96141 96142 96143 96144 96145",
            "Chishang Township": "95841 95842 95843 95844 95845 95851 95852 95853 95854 95855 95861 95862 95863 95864 95865 95871 95872 95873 95874 95875 95876",
            "Daren Township": "96692 96693 96694 96695",
            "Dawu Township": "96541 96542 96543 96544",
            "Donghe Township": "95941 95942 95983 95991 95992",
            "Guanshan Township": "95641 95642 95643 95644 95645 95651 95652 95653 95654 95655 95656 95657 95658 95661 95662 95663 95664",
            "Haiduan Township": "95741 95742 95744 95745 95791 95792 95793",
            "Jinfeng Township": "96441 96443 96444",
            "Lanyu Township": "95241 95242",
            "Ludao Township": "95141 95142",
            "Luye Township": "95541 95542 95543 95544",
            "Taimali TownshipHeping Road": "96341 96346",
            "Taitung City": "95001 95002 95041 95042 95043 95044 95045 95046 95047 95048 95049 95050 95051 95052 95053 95054 95055 95056 95057 95058 95059 95060 95062 95063 95064 95065 95091 95092 95093 95094",
            "Yanping Township": "95341 95342 95344 95383"
        },
        "Taoyuan City": {
            "Bade District": "33441 33442 33443 33444 33445 33446 33447 33448 33449 33450 33451 33452 33453 33454 33455 33456 33457 33458 33459 33460 33461 33462 33463 33464 33465 33466 33467",
            "Daxi District": "33509 33541 33542 33543 33544 33545 33546 33547 33548 33549 33550 33551 33552 33553 33554 33555 33556 33557 33558 33559 33560 33561 33591",
            "Dayuan District": "33741 33742 33743 33744 33745 33746 33747 33748 33749 33750 33751 33752 33753 33754 33755 33756 33757 33758 33759",
            "Fuxing District": "33641 33642 33643 33644",
            "Guanyin District": "32841 32842 32843 32844 32845 32846 32847 32848 32849 32850 32851 32852 32853",
            "Guishan District": "33301 33302 33303 33304 33305 33306 33307 33341 33342 33343 33344 33345 33346 33347 33348 33349 33350 33351 33352 33353 33354 33355 33356 33370 33371 33372 33373 33375 33376 33377 33378 33379 33380 33381 33382 33383 33391 33392 33393",
            "Longtan District": "32541 32542 32543 32544 32545 32546 32547 32548 32549 32550 32551 32552 32553 32554 32555 32556 32557 32558 32559 32560 32571 32572 32573",
            "Luzhu District": "33801 33841 33842 33843 33844 33845 33846 33847 33848 33849 33850 33851 33852 33853 33854 33855 33856 33857 33858 33859 33860 33861 33862",
            "Pingzhen District": "32441 32442 32443 32444 32445 32446 32447 32448 32449 32450 32451 32452 32453 32454 32455 32456 32457 32458 32459 32460 32461 32462 32463 32464 32465 32466 32467 32468 32469 32470 32471 32472 32473 32474",
            "Taoyuan District": "33001 33003 33004 33005 33006 33041 33042 33043 33044 33045 33046 33047 33048 33049 33050 33051 33052 33053 33054 33055 33056 33057 33058 33059 33060 33061 33062 33063 33064 33065 33066 33067 33068 33069 33070 33071 33072 33073 33074 33075 33076 33077 33078",
            "Xinwu District": "32741 32742 32743 32744 32745 32746 32747 32748 32749 32750",
            "Yangmei District": "32641 32642 32643 32644 32645 32646 32647 32648 32649 32650 32651 32652 32653 32654 32655 32656 32657"
        },
        "Yilan City": {
            "Datong Township": "26741 26742 26743 26744 26745 26766",
            "Dongshan Township": "26941 26942 26943 26944 26945 26946 26947 26948 26949 26950 26966",
            "Jhuangwei Township": "26341 26342 26343 26344 26345 26356",
            "Jiaosi Township": "26241 26242 26243 26244 26245 26246 26247 26248 26249 26291",
            "Luodong Township": "26541 26542 26543 26544 26545 26546 26547 26548 26549 26550 26561 26562 26563 26566",
            "Nan'ao Township": "27241 27242 27243 27244 27245 27246 27247 27291",
            "Sansing Township": "26641 26642 26643 26644 26645 26646 26647",
            "Su-Ao Township": "27041 27042 27043 27044 27045 27046 27047 27048 27049 27050 27051 27091 27092 27093 27094 27095 27096",
            "Toucheng Township": "26141 26142 26143 26144 26145 26146 26147 26148",
            "Wujie Township": "26841 26842 26843 26844 26845 26846 26847 26849 26862 26866",
            "Yilan City": "26041 26042 26043 26044 26045 26046 26047 26048 26049 26050 26051 26052 26053 26054 26055 26056 26057 26058 26059 26060 26066 26067 26068 26069",
            "Yuanshan Township": "26441 26442 26443 26444 26445 26446 26447 26448"
        },
        "Yunlin County": {
            "Baozhong Township": "63441 63442 63443 63444",
            "Beigang Township": "65141 65142 65143 65144 65145 65146 65147 65148 65149 65150 65152",
            "Citong Township": "64741 64742 64743 64745 64746 64747",
            "Dapi Township": "63141 63142 63143 63144 63145 63146 63147",
            "Dongshi Township": "63541 63542 63543 63544 63545 63551 63552 63553 63554 63555 63561 63562 63563 63565 63575",
            "Douliu City": "64001 64002 64041 64042 64043 64044 64045 64046 64047 64048 64049 64050 64051 64052 64054 64055 64056 64057 64058 64059 64060 64061 64062 64063 64064 64065 64067 64068 64069 64070 64071 64072 64073",
            "Dounan Township": "63041 63042 63043 63044 63045 63046 63047 63048 63049 63050 63051 63052",
            "Erlun Township": "64941 64942 64943 64944 64945 64946",
            "Gukeng Township": "64641 64642 64643 64644 64645 64646 64647 64648 64649 64650",
            "Huwei Township": "63201 63241 63242 63243 63244 63245 63246 63247 63248 63249 63250 63251 63252 63253 63254 63255 63256 63257 63259",
            "Kouhu Township": "65341 65342 65343 65344 65345 65346",
            "Linnei Township": "64341 64342 64343 64344 64345 64346",
            "Lunbei Township": "63741 63742 63743 63744 63745 63746 63747",
            "Mailiao Township": "63801 63841 63842 63843 63845 63846 63847 63848 63849 63850 63851 63852 63853 63854 63855 63856 63857 63858 63859 63860 63861 63862 63863 63864 63865 63866 63867 63868 63869",
            "Shuilin Township": "65241 65242 65243 65244 65245 65246 65247 65248",
            "Sihu Township": "65441 65442 65443 65444 65445 65446 65447",
            "Taixi Township": "63637 63641 63642 63643 63646 63647 63648 63651 63652 63653 63654 63655 63656 63657 63658 63659 63660 63661 63662 63663 63664 63665 63666 63667 63668 63669 63670 63671 63672 63673 63674 63675 63676 63677 63678 63679 63680 63681 63682 63683",
            "Tuku Township": "63341 63342 63343 63344 63345 63346 63347 63348 63349 63350 63351 63352 63353 63354 63355 63356 63357 63358 63359 63360 63361 63362 63363 63364 63365 63366",
            "Xiluo Township": "64841 64842 64843 64845 64846 64847 64848 64849 64850 64851 64852 64853 64855 64856 64857 64858 64861 64862 64863 64865 64866 64867 64869"
        }
    }
    if(!tw[city] || !tw[city][district]) return ""
    let zc =  tw[city][district].split(" ")
    return zc[randomRanger(0,zc.length - 1)]
}

async function updateAvatar(action) {
    console.log('updateAvatar')
    try {
        if(!document.querySelector('[data-picker="https://docs.google.com/picker"] img[src*="lh3.googleusercontent.com/a-/"]')){
            let gender = document.querySelector('a[href="gender"]').textContent.indexOf('Female') >= 0 ? 'female' : 'male'
            await userClick(action.pid,'[data-picker="https://docs.google.com/picker"]')
            await sleep(5000)
            let iframe = await waitForSelector('iframe[src^="https://myaccount.google.com/profile-picture"]')
            let buttons = [...iframe.contentWindow.document.querySelectorAll('button .google-material-icons')]
            await userClick(action.pid,'button .google-material-icons',buttons[0],iframe)
            await sleep(1000*randomRanger(4,6))
            await userSelectAvatar(action.pid,gender)
            await sleep(1000*randomRanger(5,7))
            await waitForSelector('[alt="The picture being cropped"]',30000,iframe)
            await sleep(1000*randomRanger(3,5)) 
            let saveButton = [...iframe.contentWindow.document.querySelectorAll('button')].filter(x => x.textContent.indexOf('Save as profile picture') >= 0 && x.getBoundingClientRect().width)[0]
            if(!saveButton) throw 'NO_SAVE_BUTTON'
            await userClick(action.pid,'button save avatar',saveButton,iframe)
            await sleep(1000*randomRanger(5,7)) 
        }   
        // await goToLocation(action.pid,'youtube.com//')
    } 
    catch (err) {
        console.log('updateAvatar',err)
        // await goToLocation(action.pid,'youtube.com//') 
    }
}
