var newsNames = [
    "cnn.com",
    "theguardian.com",
    "news18.com",
    "kyma.com",
    "inquirer.com",
    "npr.org",
    "thehindu.com",
    "politico.com",
    "nbcnews.com",
    "click2houston.com",
    "kktv.com",
    "wsbtv.com",
    "al.com",
    "fox5atlanta.com",
    "sltrib.com",
    "pennlive.com",
    "kiro7.com",
    "wsfa.com",
]

async function runAction(action) {
    if (!action.client_config_allow_change_fb_page) {
        action.selected_page = true
    }

    if (action.id == 'fb_create_story') {
        await fbCreateStory(action)
    }
    else if (action.id == 'spam_fb_account') {
        await spamFbAccount(action)
    }
    else if (action.id == 'fb_comment_group') {
        await fbCommentGroup(action)
    }
    else if (action.id == 'fb_feed') {
        await fbFeed(action)
    }
    else if (action.id == 'view_fb_home') {
        await viewFbHome(action)
    }
    else if (action.id == 'fb_add_member') {
        await fbAddMember(action)
    }
    else if (action.id == 'unsub_youtube') {
        await unsubYoutube(action)
    }
    else if (action.id == 'check_recovery') {
        await checkRecovery(action)
    }
    else if (action.id == 'add_recovery_mail') {
        await addRecoveryMail(action)
    }
    else if (action.id == 'get_otp') {
        await getOtp(action)
    }
    else if (action.id == 'scan_profile') {
        await scanProfile(action)
    }
    else if (action.id == 'scan_group') {
        await scanGroup(action)
    }
    else if (action.id == 'scan_page') {
        await scanPage(action)
    }
    else if (action.id == 'post_fb') {
        await postFB(action)
    }
    else if (action.id == 'view_fb_video') {
        if (!Array.isArray(action.videos)) {
            action.videos = action.link.split(',')
            await setActionData(action)
        }
        await viewFBVideo(action)
    }
    else if (action.id == 'folow_fb') {
        await folowPage(action)
    }
    else if (action.id == 'comment_fb_post') {
        await commentPost(action)
    }
    else if (action.id == 'like_fb_post') {
        await likePost(action)
    }
    else if (action.id == 'like_fb_page') {
        await likePage(action)
    }
    else if (action.id == 'create_fb_page') {
        await regFbPage(action)
    }
    else if (action.id == 'direct_link') {
        await directLink(action)
    }
    else if (action.id == 'check_mail_1') {
        await checkMail1(action)
    }
    else if (action.id == 'reg_account') {
        if (action.account_type == 'facebook') {
            await reqFacebook(action)
        } else {
            if (action.process_login) {
                await userLogin(action)
            } else {
                await regMail(action)
            }
        }
    }
    else if (action.id == 'rename_channel' || action.id == 'recovery_mail' || action.id == 'change_pass') {
        if (action.is_fb) {
            if (action.login_fb_success) {
                await changePassFb(action)
            } else {
                await fbLogin(action)
            }
        } else {
            await userLogin(action)
        }
    }
    else if (action.id == 'end_script') {
        await reportScript(action)
    }
    else if (action.id == 'add_video_playlist') {
        await scriptAddVideoPlaylist(action)
    }
    else if (action.id == 'create_playlist') {
        await createPlaylistScript(action)
    }
    else if (action.id == 'like_youtube') {
        await youtubeLike(action)
    }
    else if (action.id == 'comment_youtube') {
        await youtubeComment(action)
    }
    else if (action.id == 'check_bat') {
        await scriptCheckBat(action)
    }
    else if (action.id == 'google_news') {
        await scriptGoogleNews(action)
    }
    else if (action.id == 'search') {
        await scriptSearch(action)
    }
    else if (action.id == 'map') {
        await scriptMap(action)
    }
    else if (action.id == 'youtube_sub') {
        action.is_sub = true
        await setActionData(action)
        await scriptYoutubeSub(action)
    }
    else if (action.id == 'reg_user_youtube') {
        await regUserYoutube(action)
    }
    else if (action.id == 'login' || action.id == 'reg_user') {
        console.log('login')
        if (action.is_tiktok) {
            await tiktokLogin(action)
        }
        else if (action.is_fb) {
            await fbLogin(action)
        } else {
            await userLogin(action)
        }
    }
    else if (action.id == 'confirm') {
        console.log('confirm')
        await userConfirm(action)
    }
    else if (action.id == 'changepass') {
        console.log('changepass')
        await changePassword(action)
    }
    else if (action.id == 'checkpremium') {
        console.log('checkpremium')
        await checkPremium(action)
    }
    else if (action.id == 'checkcountry') {
        console.log('checkcountry')
        await checkCountry(action)
    }
    else if (action.id == 'watch' || action.id == 'watch_video') {
        console.log('watch')
        !action.mobile ? await userWatch(action) : await userWatchMobile(action)
    }
    else if (action.id == 'sub') {
        console.log('sub')
        await userSub(action)
    }
    else if (action.id == 'logout') {
        if (window.location.toString().indexOf('https://accounts.google.com/ServiceLogin') == 0 || window.location.toString().indexOf('https://accounts.google.com/signin/v2/identifier') == 0) {
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
        }
    }
}

async function initActionData(action) {
    let mobileRate = action.mobile_percent
    action.mobile = (action.pid % 10) * 10 < mobileRate ? true : false;

    if (!action.client_config_allow_change_fb_page) {
        action.selected_page = true
    }
    if (action.mobile) {
        await setUserAgent(action.pid);
    }

    if (action.id == 'watch' || action.id == 'watch_video') {
        setWatchParam(action)
    }

    if (action.id == 'sub') {
        setSubParam(action)
    }

    console.log(action)
    await setActionData(action)

    if (action.mobile) await switchMobile(action)

    if (action.id == 'fb_create_story') {
        await goToLocation(action.pid, 'https://www.facebook.com/profile.php/')
    }
    else if (action.id == 'fb_comment_group') {
        await goToLocation(action.pid, action.group_link)
    }
    else if (action.id == 'spam_fb_account') {
        await goToLocation(action.pid, 'https://www.facebook.com/profile.php?id=' + action.fb_id)
    }
    else if (action.id == 'fb_feed') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, 'https://www.facebook.com//')
        }
    }
    else if (action.id == 'view_fb_home') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, 'https://www.facebook.com//')
        }
    }
    else if (action.id == 'fb_add_member') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, action.link)
        }
    }
    else if (action.id == 'unsub_youtube') {
        closeTabs()
        await sleep(3000)
        await goToLocation(action.pid, 'https://myaccount.google.com/brandaccounts?hl=en')
    }
    else if (action.id == 'check_recovery') {
        await goToLocation(action.pid, 'https://myaccount.google.com/security')
    }
    else if (action.id == 'add_recovery_mail') {
        await goToLocation(action.pid, 'https://myaccount.google.com/recovery/email')
    }
    else if (action.id == 'get_otp') {
        await goToLocation(action.pid, 'google.com/search?q=hot')
    }
    else if (action.id == 'scan_profile') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            let linkGroup = action.group_link
            if (!linkGroup.includes('members')) {
                linkGroup += '/members'
                linkGroup = linkGroup.replace('//members', '/members')
            }
            await goToLocation(action.pid, linkGroup)
        }
    } else if (action.id == 'scan_group') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, `https://www.facebook.com/search/groups?q=${action.keyword}&filters=eyJwdWJsaWNfZ3JvdXBzOjAiOiJ7XCJuYW1lXCI6XCJwdWJsaWNfZ3JvdXBzXCIsXCJhcmdzXCI6XCJcIn0ifQ%3D%3D`)
        }
    } else if (action.id == 'scan_page') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, `https://www.facebook.com/search/pages/?q=${action.keyword}`)
        }
    } else if (action.id == 'post_fb') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, action.group_link)
        }
    }
    else if (action.id == 'direct_link') {
        await goToLocation(action.pid, action.link)
    }
    else if (action.id == 'folow_fb') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, action.link)
        }
    }
    else if (action.id == 'view_fb_video') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            if (!Array.isArray(action.videos)) {
                action.videos = action.link.split(',')
            }
            let link = action.videos.pop()
            await setActionData(action)
            await goToLocation(action.pid, link)
        }
    }
    else if (action.id == 'comment_fb_post') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, action.post_link)
        }
    }
    else if (action.id == 'like_fb_post') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            await goToLocation(action.pid, action.post_link)
        }
    }
    else if (action.id == 'like_fb_page') {
        if (!action.selected_page) {
            await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        } else {
            action.after_selected_page = false
            await setActionData(action)
            await goToLocation(action.pid, action.page_link)
        }
    }
    else if (action.id == 'create_fb_page') {
        await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.id == 'reg_user_youtube') {
        await goToLocation(action.pid, 'https://www.youtube.com/channel_switcher?next=%2Faccount&feature=settings')
    }
    else if (['check_mail_1', 'recovery_mail', 'change_pass', 'reg_user'].includes(action.id)) {
        let continueLink = 'https://accounts.google.com'
        if (action.is_fb) {
            continueLink = 'https://mbasic.facebook.com/'
        }

        if (action.browser_name.includes('brave')) {
            await handleBraveSetting(action, continueLink)
        }
        await goToLocation(action.pid, continueLink)
    }
    else if (action.id == 'reg_account') {
        let continueLink = ''
        if (action.process_login) {
            continueLink = 'accounts.google.com'
        } else if (action.account_type == 'gmail') {
            continueLink = 'https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=SignUp'
        } else if (action.account_type == 'facebook') {
            continueLink = 'facebook.com/reg'
        }

        if (['brave', 'brave-browser', 'brave-browser-stable'].includes(action.browser_name)) {
            await handleBraveSetting(action, continueLink)
        } else {
            await goToLocation(action.pid, continueLink)
        }
    }
    else if (action.id == 'rename_channel') {
        if (Number(action.total_created_users)) {
            action.channel_position = Number(action.total_created_users)
        } else {
            action.channel_position = -1
        }

        await setActionData(action)
        await handleBraveSetting(action)
    }
    else if (action.id == 'end_script') {
        await reportScript(action)
    }
    else if (action.id == 'add_video_playlist') {
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
    }
    else if (action.id == 'create_playlist') {
        action.fisrtStart = true
        await setActionData(action)
        await goToLocation(action.pid, 'https://www.youtube.com/')
    }
    else if (action.id == 'like_youtube') {
        if (action.selected_user) {
            await goToLocation(action.pid, 'https://www.youtube.com//')
        } else {
            await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        }
    }
    else if (action.id == 'comment_youtube') {
        action.commented_count = 0
        action.video_ids = action.video_ids.split(',')
        action.channel_ids = action.channel_ids.split(',')
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        // await goToLocation(action.pid, 'https://www.youtube.com/')
    }
    else if (action.id == 'check_bat') {

    }
    else if (action.id == 'google_news') {
        if (!action.is_searched) {
            action.is_searched = true
            await setActionData(action)
            let randomPoSite = randomRanger(0, newsNames.length - 1)
            let link = action.news_link || `https://www.${newsNames[randomPoSite]}/`
            await goToLocation(action.pid, link)
        }
    }
    else if (action.id == 'search') {
        action.search_keywords = action.search_keywords.split(',')
        await setActionData(action)
        await goToLocation(action.pid, 'https://www.google.com/')
    }
    else if (action.id == 'map') {
        await goToLocation(action.pid, 'google.com/maps')
    }
    else if (action.id == 'youtube_sub') {
        if (action.selected_user) {
            await goToLocation(action.pid, 'https://www.youtube.com//')
        } else {
            await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        }
        //await goToLocation(action.pid, 'https://www.youtube.com//')
        //await goToLocation(action.pid,action.mobile?'m.youtube.com//':'youtube.com//')
    }
    else if (action.id == 'login') {
        await updateUserInput(action.pid, 'GO_TO_FISRT_TAB', 0, 0, 0, 0, "", 'GO_TO_FISRT_TAB')
        if (action.browser_name == 'iridium-browser') {
            await updateUserInput(action.pid, 'NEW_TAB', 0, 0, 0, 0, "", 'New TAB')
            await goToLocation(action.pid, `chrome://settings/cookies`)
            await sleep(4000)

            await updateUserInput(action.pid, 'IRIDIUM_SETTING', 8, 0, 0, 0, "", 'IRIDIUM_SETTING')

            await updateUserInput(action.pid, 'GO_TO_FISRT_TAB', 0, 0, 0, 0, "", 'GO_TO_FISRT_TAB')
            await goToLocation(action.pid, 'accounts.google.com')
        } else {
            let continueLink = 'https://accounts.google.com'
            if (action.is_fb) {
                continueLink = 'https://www.facebook.com/'
            } else if (action.is_tiktok) {
                continueLink = 'https://www.tiktok.com/login/phone-or-email/email'
            }

            await handleSelectExOption(action)
            if (['brave', 'brave-browser', 'brave-browser-stable'].includes(action.browser_name)) {
                await handleBraveSetting(action, continueLink)
            } else {
                await goToLocation(action.pid, continueLink)
                await sleep(15000)
            }
        }
    }
    else if (action.id == 'logout') {
        await goToLocation(action.pid, 'accounts.google.com/logout')
    }
    else if (action.id == 'confirm') {
        // await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
        await goToLocation(action.pid, 'families.google.com')
    }
    else if (action.id == 'changepass') {
        await goToLocation(action.pid, 'myaccount.google.com/security')
    }
    else if (action.id == 'checkpremium') {
        await goToLocation(action.pid, 'm.youtube.com//')
    }
    else if (action.id == 'checkcountry') {
        await goToLocation(action.pid, 'pay.google.com/gp/w/u/0/home/settings')
    }
    else if (action.id == 'watch' || action.id == 'watch_video') {
        // await goToLocation(action.pid,'youtube.com/feed/history//')
        // await goToLocation(action.pid,action.mobile?'m.youtube.com//':'myactivity.google.com/activitycontrols/youtube')
        if (action.google) {
            await goToLocation(action.pid, 'google.com/search?q=' + action.video + ' ' + action.playlist_url)
            await sleep(3000)
        } else {
            if (!action.selected_user) {
                await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
            } else {
                await goToLocation(action.pid, 'https://www.youtube.com//')
            }
            //await goToLocation(action.pid,action.mobile?'m.youtube.com//':'https://www.youtube.com//')
        }
    }
}

async function handleCapchaTiktok(data) {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/handle-capcha-tiktok', data }, function (response) {
        resolve(response);
    }))
}

function reportAccount(action) {
    let isStop = false
    if (action.id == 'reg_account') {
        if (action.reg_ga_success || action.is_stop) {
            isStop = true
        } else {
            isStop = false
        }
    } else if (action.reg_ga_success || action.end_script) {
        isStop = true
    }

    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { pid: action.pid, id: action.id, reg_ga_success: action.reg_ga_success, username: action.username, password: action.password, verify: action.verify, type: action.account_type, stop: isStop }
    }, function (response) {
        resolve(response);
    }))
}

function getComment() {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/get-comment', data: {} }, function (response) {
        resolve(response);
    }))
}

function getPhone(rePhone) {
    let data = {}
    if (rePhone) {
        data.re_phone = rePhone
    }
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/get-phone', data }, function (response) {
        resolve(response);
    }))
}

function resetProfile(action) {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/reset-profile-by-pid', data: { pid: action.pid } }, function (response) {
        resolve(response);
    }))
}

function reportFBGroup(action) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        url: '/report-fb-group',
        data: { group_link: action.group_link, fb_topic_code: action.fb_topic_code }
    }, function (response) {
        resolve(response);
    }))
}

function getRecoMails(mail, pid) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        url: '/get-reco-mails',
        data: { mail, pid }
    }, function (response) {
        resolve(response);
    }))
}

function getMailCode(mail) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        url: '/get-mail-code',
        data: { mail }
    }, function (response) {
        resolve(response);
    }))
}

function reportMailCode(data) {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/report-mail-code', data }, function (response) {
        resolve(response);
    }))
}

async function userPasteImage(pid, selector, element, iframe) {
    console.log('userPasteImage', selector)
    let el = element ? element : (iframe ? iframe.contentWindow.document.querySelector(selector) : document.querySelector(selector))
    el.scrollIntoViewIfNeeded()
    let pos = getElementPosition(el, iframe)
    await updateUserInput(pid, 'PASTE_IMAGE', pos.x, pos.y, scrollX, scrollY, '', selector)
}

async function userDragRecapcha(pid, selector, element, toX, iframe) {
    console.log('userPasteImage', selector)
    let el = element ? element : (iframe ? iframe.contentWindow.document.querySelector(selector) : document.querySelector(selector))
    el.scrollIntoViewIfNeeded()
    let pos = getElementPosition(el, iframe)
    await updateUserInput(pid, 'DRAG', pos.x, pos.y, toX, pos.y, '', selector)
}

function getPhoneCode(order_id, api_name) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        url: '/get-phone-code',
        data: { order_id: order_id, api_name: api_name }
    }, function (response) {
        resolve(response);
    }))
}

function updateTotalCreatedUsers(pid, count = 0) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { pid: pid, id: 'total_created_channel', count }
    }, function (response) {
        resolve(response);
    }))
}

function clearBSData() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'CLEAR_BROWSER_DATA', url: '/report',
        data: {}
    }, function (response) {
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

    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { isScriptReport: true, script_code: action.id, service_id: action._id, pid: action.pid, isBreak: action.is_break, stop: isBreak, status, data_reported: action.data_reported }
    },
        async function (response) {
            if (response) {
                if (action.watch_time) {
                    action.watch_time = 0
                }
                Object.assign(action, response)
                action.data_reported = ''
                //if (action.id != 'check_bat') {
                //await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
                //await scrollForViewAds(action)
                //}

                await initActionData(action)
                await runAction(action)
            }
            resolve()
        }))
}

function updateProfileData(data) {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/update-profile-data', data: data }, function (response) {
        resolve(response);
    }))
}

function reportPlaylistJCT(data) {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/report-playlist-jct', data: data }, function (response) {
        resolve(response);
    }))
}

function reportLive(pid) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { id: 'live_report', pid }
    }, function (response) {
        resolve(response);
    }))
}

function getNewPlaylistData(action) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        url: '/get-new-playlist',
        data: {}
    }, function (response) {
        if (response && response.playlist_url) {
            action.playlist_data = response.playlist_url
            Object.assign(action, response)
        }
        resolve(action);
    }))
}

function closeTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'CLOSE_OLD_TABS',
        url: '/report',
    }, function (response) {
        resolve(response);
    }))
}

function closeUnactiveTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'CLOSE_UNACTIVE_TABS',
        url: '/report',
    }, function (response) {
        resolve(response);
    }))
}

function reportPositionChannel(pid, position) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { id: 'channel-position', position, pid }
    }, function (response) {
        resolve(response);
    }))
}

function getPlaylistData(action) {
    if (action.id == 'watch') {
        let items = action.playlist_data.split(',')
        let playlist_id = items[Math.floor(Math.random() * items.length)];
        let data = playlist_id.split('&list=')
        action.playlist_url = data[1]
        action.playlist_video = data[0]
    }
}

async function getActionData() {
    return new Promise(resolve => chrome.storage.sync.get('getActionData action', function (data) {
        console.log('getActionData', data)

        resolve(data);
    })
    )
}

async function setActionData(data) {
    if (Number(data.id)) {
        data.id = data.script_code
    }
    return new Promise(resolve => chrome.storage.sync.set({ action: data }, function () {
        resolve();
    })
    )
}

async function sendUserAction(action) {
    return new Promise(resolve => chrome.runtime.sendMessage(action, function (response) {
        resolve(response);
    }))
}

function updateWatchingTime(pid, action, readingTime, playlistTime, lastPlaylist) {
    // return new Promise(resolve => chrome.runtime.sendMessage({type: 'POST', url: '/profile/update-watch-time',
    //         data: {pid: pid, action: action, reading_time: readingTime, playlist_time: playlistTime, last_playlist: lastPlaylist}}, function (response) {
    //     resolve(response);
    // }))
}


function updateWatchedVideo(viewedAds, pid) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { id: 'watched', viewedAds: viewedAds, pid }
    }, function (response) {
        resolve(response);
    }))
}

function subStatusReport(pid, channelId, vmId, status, preSub, postSub, note) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'POST', url: '/profile/sub-update',
        data: { pid: pid, vmId: vmId, channel_id: channelId, status: status, ip: '', pre_sub: preSub, post_sub: postSub, note: note }
    }, function (response) {
        resolve(response);
    }))
}

async function updateActionStatus(pid, action, status, msg, stop = true, report_error_profile = false) {
    console.log('updateActionStatus', pid, status)
    if (action.includes('fb')) {
        report_error_profile = true
    }

    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/report',
        data: { pid: pid, id: action, status: status, stop: stop, msg: msg, report_error_profile }
    }, function (response) {
        resolve(response);
    }))
}

async function getPublicDays(videoId) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'COMMENT', url: 'https://pll.dominhit.pro/playlist/api',
        data: { action: 'get-public-time-day-ago', id: videoId }
    }, function (response) {
        resolve(response);
    }))
}

async function getFirstVideo(pllId) {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'COMMENT', url: 'https://pll.dominhit.pro/playlist/api',
        data: { action: 'get-video-of-playlist', id: pllId }
    }, function (response) {
        resolve(response);
    }))
}

// function updateLoginStatus(pid, status, msg){
//     console.log('updateLoginStatus',pid,status)
//     return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/login',
//         data: {pid: pid, stop: true, status: status, msg: msg}}, function (response) {
//         resolve(response);
//     }))
// }

function updateUserInput(pid, action, x, y, sx, sy, str, selector) {
    console.log('updateUserInput', pid, action)
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'REPORT', url: '/input',
        data: { pid: pid, action: action, x: x, y: y, sx: sx, sy: sy, str: str, selector: selector }
    }, function (response) {
        resolve(response);
    }))
}
function elementInViewport(el) {
    if (typeof el == 'string') {
        el = document.querySelector(el)
    }

    if (!el) {
        return false
    }

    let pos = el.getBoundingClientRect()
    return pos.x || pos.y || pos.width || pos.height
}

function getElementPosition(el, iframe) {
    if (el) {
        let screenX = window.screen.width - window.screen.availWidth
        let screenY = window.screen.height - window.screen.availHeight
        let pos = el.getBoundingClientRect()
        let iframePost = iframe ? iframe.getBoundingClientRect() : undefined
        let menuBarHeight = mobileMenuBarHeight || (window.outerHeight - window.innerHeight)
        let menuLeftWith = (window.outerWidth - window.innerWidth)
        let x = zoom * (pos.left + (pos.width * 0.6) + (iframe ? iframePost.left : 0)) + screenX + menuLeftWith + (windowWide ? (windowWide - zoom * window.innerWidth) / 2 : 0) + widthCustom
        let y = zoom * (pos.top + (pos.height * 0.6) + (iframe ? iframePost.top : 0)) + screenY + menuBarHeight + heightCustom
        let scrollX = window.scrollX
        let scrollY = window.scrollY
        console.log({ x: x, y: y, scrollX: scrollX, scrollY: scrollY })
        return { x: x, y: y, scrollX: scrollX, scrollY: scrollY }
    }
}

function listenMsg() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
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

async function waitForSelector(selector, timeout = 30000, iframe) {
    let n = Math.ceil(timeout / 1000)
    for (let i = 0; i < n; i++) {
        let el = iframe ? iframe.contentWindow.document.querySelector(selector) : document.querySelector(selector)
        if (el && el.getBoundingClientRect().width) return
        await sleep(1000)
    }
    throw selector + '_NOT_FOUND'
}

// trong code
async function setUserAgent(pid) {
    let userAgents = [
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; vivo 1713 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.124 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G570M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1; A37f Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.93 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; CPH1607 Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532M Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; vivo 1603 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; Lenovo-A6020l36 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.93 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 4.3; MediaPad 7 Youth 2 Build/HuaweiMediaPad) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; Redmi 4A Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.116 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; Lenovo-A6020l36 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.93 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G570M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; vivo 1606 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.124 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1; vivo 1716 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.98 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1; A1601 Build/LMY47I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; TRT-LX2 Build/HUAWEITRT-LX2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 4.4.2; de-de; SAMSUNG GT-I9195 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; CAM-L21 Build/HUAWEICAM-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.2; Redmi 4X Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 4.4.2; SM-G7102 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G610F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1; HUAWEI CUN-L22 Build/HUAWEICUN-L22; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; A37fw Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-J730GM Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Redmi Note 4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; A37fw Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-J730GM Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Redmi Note 4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.2; Redmi Note 5A Build/N2G47H; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; BLL-L22 Build/HUAWEIBLL-L22) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532M Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-J710F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.1; CPH1723 Build/N6F26Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.98 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0.0; FIG-LX3 Build/HUAWEIFIG-LX3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G610M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (5) Plus Build/NPNS25.137-92-14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G570M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0.0; WAS-LX3 Build/HUAWEIWAS-LX3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.1; Moto G (5S) Build/NPPS26.102-49-11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; TRT-LX3 Build/HUAWEITRT-LX3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-G570M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; vivo 1610 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.124 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 4.4.2; de-de; SAMSUNG GT-I9301I Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G610M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G610M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0; MotoG3 Build/MPIS24.65-33.1-2-16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.0.0; ANE-LX3 Build/HUAWEIANE-LX3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (5) Build/NPPS25.137-93-14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.1; Moto E (4) Plus Build/NMA26.42-162) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500M Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto C Build/NRD90M.059) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-G532M Build/MMB29T; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/55.0.2883.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJS25.93-14-18) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; Moto G (5)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.1.1; Moto G (5S) Plus Build/NPSS26.116-64-11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; SlimTab7_3GR Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 5.1.1; SM-J120M Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 7.0; SM-J710MN Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36',

        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_6 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0 Mobile/15D100 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C153 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_5 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0 Mobile/15D60 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C202 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B202 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_3 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A432 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 10_0_2 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A456 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1',
        'Mozilla/5.0 (iPad; CPU OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1',
        'Mozilla/5.0 (iPad; CPU OS 10_2 like Mac OS X) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0 Mobile/14C92 Safari/602.1',
        'Mozilla/5.0 (iPad; CPU OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_2_6 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0 Mobile/15D100 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_2_1 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C153 Safari/604.1',
        '"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_0_3 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A432 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_2_5 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0 Mobile/15D60 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B150 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C114 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0_2 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A421 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0 Mobile/15B202 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_2_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C202 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 12_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.3 Mobile/14E277 Safari/603.1.30',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 11_0_2 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A421 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B72 Safari/602.1',
        'Mozilla/5.0 (iPad; CPU OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C114 Safari/604.1'
    ]

    const userAgent = userAgents[pid % userAgents.length]

    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'SET_USER_AGENT',
        user_agent: userAgent
    }, function (response) {
        resolve(response);
    }))
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

async function randomFullName() {
    let rs = await fetch('https://random-data-api.com/api/name/random_name').then(response => {
        return response.json()
    }).then(response => response).catch(error => {
        return {
            name: makeName(5)
        }
    })

    return rs.name
}

async function handleUsersSelection(action) {
    action.fisrtStart = false
    await setActionData(action)
    await sleep(4000)
    let channels = document.querySelectorAll('ytd-account-item-renderer[class="style-scope ytd-channel-switcher-page-renderer"]')
    if (action.loadFirstUser) {
        action.loadFirstUser = false
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        await sleep(4000)
        return
    }

    if (!channels.length) {
        channels = document.querySelectorAll('ytd-account-item-renderer[class="style-scope ytd-channel-switcher-page-renderer"]')
        await sleep(4000)
    }

    if (document.querySelector('#primary-content')) {
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        await sleep(60000)
    }

    // handle not found channels
    if (!channels.length) {
        await userClick(action.pid, '#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')
        await sleep(5000)
        let switchChannelOpt = document.querySelectorAll('yt-multi-page-menu-section-renderer #endpoint #content-icon').item(3)
        if (switchChannelOpt) {
            await userClick(action.pid, 'switchChannelOpt', switchChannelOpt)
            await sleep(5000)
            let fisUser = document.querySelectorAll('ytd-account-item-section-renderer ytd-account-item-renderer #contentIcon img').item(1)
            if (fisUser) {
                await userClick(action.pid, 'fisUser', fisUser)
                await sleep(60000)
            }
        }
    }

    if (!channels || !channels.length) {
        action.loadFirstUser = true
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/account')
        await sleep(60000)
        return
    }

    action.channel_position += 1
    action.selected_user = true
    await setActionData(action)

    let filteredChannels = [];
    // Lặp qua danh sách các phần tử đã chọn
    channels.forEach(element => {
        // Kiểm tra xem phần tử có tồn tại children[3] không
        const children = element.children[0].children[3]
        if (children && children.hasAttribute('hidden')) {
            // Kiểm tra xem children[3] có thuộc tính hidden không (lọc ra những kênh bị khóa)
            // Thêm phần tử vào danh sách đã lọc
            filteredChannels.push(element);
        }
    });

    if (action.channel_position >= filteredChannels.length) {
        if (filteredChannels.length) {
            action.channel_position = 0
        }
    }
    let channel = filteredChannels[(action.channel_position)]
    await sleep(5000)
    if (channel) {
        if (action.channel_position == filteredChannels.length) {
            reportPositionChannel(action.pid, -1)
        } else {
            reportPositionChannel(action.pid, action.channel_position)
        }

        //if (action.id == 'watch') {
        getPlaylistData(action)
        //}
        await userClick(action.pid, '', channel)
    } else {
        isRunBAT ? (await reportScript(action)) : (await updateActionStatus(action.pid, action.id, 0, 'end playlist'))
    }
}

async function handleSelectExOption(action) {
    if (action.trace_name && action.trace_name.indexOf('level_') > -1) {
        await updateUserInput(action.pid, 'NEW_TAB', 0, 0, 0, 0, "", 'New TAB')
        await goToLocation(action.pid, 'chrome-extension://njkmjblmcfiobddjgebnoeldkjcplfjb/html/settings.html')

        if (action.trace_name == 'level_minimum') {
            await updateUserInput(action.pid, 'CLICK', 219, 800, 0, 0, "", 'click')
        } else if (action.trace_name == 'level_standard') {
            await updateUserInput(action.pid, 'CLICK', 529, 800, 0, 0, "", 'click')
        } else if (action.trace_name == 'level_high') {
            await updateUserInput(action.pid, 'CLICK', 835, 800, 0, 0, "", 'click')
        } else if (action.trace_name == 'level_extreme') {
            await updateUserInput(action.pid, 'CLICK', 1136, 800, 0, 0, "", 'click')
        }

        await updateUserInput(action.pid, 'GO_TO_FISRT_TAB', 0, 0, 0, 0, "", 'GO_TO_FISRT_TAB')
    }
}

async function getRandomUSName() {
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

async function getRandomVietnamesName() {
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
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function getRandomAddress() {
    return new Promise(resolve => chrome.runtime.sendMessage({ url: '/get-address-random', data: {} }, function (response) {
        resolve(response);
    }))
}

async function checkLang(action) {
    let url = window.location.toString()

    if (action.updated_lang) {
        return
    }

    if (url == 'https://www.youtube.com/') {
        await userClick(action.pid, '#avatar-btn')
        await sleep(1000)
        let langLink = document.querySelector('#manage-account a').href.split('?')[0] + 'language'
        await goToLocation(action.pid, langLink)
        await sleep(15000)
    } else if (url.indexOf('/language') > -1) {
        if (!getElementContainsInnerText('div', 'Preferred Language')) {
            await userClick(action.pid, 'path[d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z"]')
            await userType(action.pid, 'label input', 'english')
            await userClick(action.pid, 'li[aria-label="English"]')
            await userClick(action.pid, 'li[aria-label="United States"]')

            await userClick(action.pid, 'button[data-mdc-dialog-action="ok"]')
            await sleep(3000)
        }

        action.updated_lang = true
        await setActionData(action)
    }
}