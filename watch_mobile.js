const user_simulate = require('./user_simulate')
const request_api = require('./request_api')
const utils = require('./utils')

const SKIP_ADS_PERCENT = 1  //0.85
const LIKE_PERCENT = 0.01
const COMMENT_PERCENT = 0.0015
const VIEW_SUB_PERCENT = 0.002
const SEARCH_SKIP = 0   //0.7
const CHANNEL_VIDEO_WATCH = 3

async function userWatchMobile(action) {
    try {
        console.log('start watch')
        await utils.sleep(2000)
        let url = action.page.url()

        if (url == 'https://m.youtube.com/' || url == 'https://m.youtube.com//') {
            await processHomePageMobile(action)
        } else if (url.indexOf('https://m.youtube.com/results') > -1) {
            await processSearchPageMobile(action)
        }
        else if (url.indexOf('https://m.youtube.com/watch') > -1) {
            await processWatchPageMobile(action)
        }
        else if (url.indexOf('https://m.youtube.com/playlist?list=') > -1) {
            await processPlaylistPageMobile(action)
        }
        else if (url.indexOf('https://m.youtube.com/channel/') > -1 || url.indexOf('https://m.youtube.com/user/') > -1 || url.indexOf('https://m.youtube.com/c/') > -1) {
            await processWatchChannelPageMobile(action)
        }
        else if (url.indexOf('https://myaccount.google.com/') == 0) {
            await action.page.goto('https://m.youtube.com/')
        }
        else if (url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/ServiceLogin') > -1) {
            throw 'NOT_LOGIN'
        }
        else if (url.indexOf('youtube.com/oops') > -1 && await action.page.$('#alerts')) {
            throw new Error('NOT_LOGIN_' + await action.page.$('#alerts .yt-alert-message').textContent)
        }
        else {
            throw 'unknown url: ' + url
        }
    }
    catch (e) {
        console.log('error', action.pid, e)
        if (e.toString() == 'NOT_LOGIN') action.retry = true
        if (action.retry || action.page.url().indexOf('https://m.youtube.com/watch') > -1) {
            await request_api.updateActionStatus(action, action.id, 0, e.toString())
        }
        else if (e.toString() == 'SEARCH_SKIP') {
            action.retry = undefined
            action.filter = action.filter ? action.filter - 1 : undefined

            await action.page.goto('https://m.youtube.com/')
            await utils.sleep(2000)
        }
        else {
            await request_api.updateActionStatus(action, action.id, 1, e.toString(), false)
            action.retry = true
            action.filter = undefined

            await action.page.goto('https://m.youtube.com/')
            await utils.sleep(2000)
        }
    }
}

async function processHomePageMobile(action) {
    if (await checkLogin(action)) return
    // if(!(await deleteHistory(action))) return
    if (action.direct) {
        if (action.url_type == 'video') {
            await action.page.goto('https://m.youtube.com/watch?v=' + action.playlist_url)
            return
        }
        else {
            // playlist
            await action.page.goto('https://m.youtube.com/playlist?list=' + action.playlist_url)
            return
        }
    }
    if (action.preview == "home") {
        await user_simulate.userScroll(action, utils.randomRanger(5, 15))
        await utils.sleep(utils.randomRanger(1000, 5000))
        await user_simulate.userClickRandomVideoMobile(action)
    }
    else if (action.preview == "search") {
        await searchMobile(action, action.keyword)
    }
    else if (action.home) {
        await processBrowserFeatureMobile(action)
    }
    else if (action.suggest_videos) {
        await searchMobile(action, action.suggest_videos)
    }
    else {
        await searchMobile(action, action.video)
    }

    await utils.sleep(3000)
}

async function processPlaylistPageMobile(action) {
    await user_simulate.userClick(action, 'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
}

async function processSearchPageMobile(action) {
    let url = action.page.url()

    if (action.preview == "search") {
        await user_simulate.userScroll(action, utils.randomRanger(0, 20))
        await utils.sleep(utils.randomRanger(1000, 5000))
        await user_simulate.userClickRandomVideoMobileComplact(action)
        return
    }

    let suggestWatchSearch = await processSearchSuggestMobile(action)
    if (suggestWatchSearch) return

    // filter by hour if first search
    // if(action.url_type=='video' && !action.filter){
    //     let filter = action.filter?(action.filter+1):1
    //     action.filter = filter
    //     

    //     await user_simulate.userClick(action, '#filter-menu a > #button')
    //     await utils.sleep(2000)
    //     // this hour
    //     await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
    //     return
    // }

    let videoSelector = 'ytm-search a.compact-media-item-image[href*="' + action.playlist_url + '"]'
    // scroll result
    // if(!await action.page.$(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
    let element
    // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
    // element = await action.page.$(videoSelector)
    // if(!element){
    if (!action.filter || url.indexOf('253D%253D') > -1) {
        let randomScroll = utils.randomRanger(3, 5)
        while (randomScroll > 0 && !element) {
            await user_simulate.userScroll(action, 10)
            await utils.sleep(1000)
            randomScroll -= 1
            element = await action.page.$(videoSelector)
        }
    }

    if (element) {
        if (Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
        if (action.suggest_search) {
            let otherVideos = await action.page.$$('ytm-search a.compact-media-item-image:not([href*="' + action.playlist_url + '"])')
            if (otherVideos.length > 0) {
                let videoId = await action.page.evaluate(e => e.href, otherVideos[utils.randomRanger(0, otherVideos.length - 1)])
                videoId = videoId.substr(videoId.indexOf('?v=') + 3, 11)
                videoSelector = 'ytm-search a.compact-media-item-image[href*="' + videoId + '"]'
            }
        }
        await utils.sleep(2000)
        if (action.channel || action.suggest || action.home) {
            console.log('page_watch:', action.channel, ', suggest:', action.suggest, ',home:', action.home)
            let channelName = await action.page.evaluate(e => e.nextElementSibling.querySelector('.subhead > .compact-media-item-byline').textContent.trim(), element)
            console.log('channelName:', channelName)
            let allVideos = [...await action.page.$$('ytm-search a.compact-media-item-metadata-content')]
            let otherVideos = []
            for (let i = 0; i < allVideos.length; i++) {
                if (await action.page.evaluate((x, channelName, playlistUrl) => x.querySelector('.subhead > .compact-media-item-byline').textContent == channelName && x.href.indexOf(playlistUrl) < 0, allVideos[i], channelName, action.playlist_url)) {
                    otherVideos.push(allVideos[i])
                }
            }
            action.channelName = channelName
            if (otherVideos.length) {
                let otherVideo = otherVideos[utils.randomRanger(0, otherVideos.length - 1)]
                action.other_videos.push(await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0], otherVideo))
                await user_simulate.userClick(action, action.playlist_url + ' ' + channelName, otherVideo)
            }
            else if (action.suggest) {
                let otherRandomVideos = [...await action.page.$$('ytm-search a.compact-media-item-metadata-content:not([href*="' + action.playlist_url + '"])')]
                if (otherRandomVideos.length) {
                    await user_simulate.userClick(action, videoSelector, otherRandomVideos[utils.randomRanger(0, otherRandomVideos.length - 1)])
                }
                else {
                    await user_simulate.userClick(action, videoSelector)
                }
            }
            else {
                await user_simulate.userClick(action, videoSelector)
            }
        }
        else {
            await user_simulate.userClick(action, videoSelector)
        }
        await utils.sleep(3000)
    }
    else if (action.url_type == 'video') {
        // if filtered, go to home page
        if (url.indexOf('253D%253D') > -1) {
            await user_simulate.userClick(action, 'button.search-bar-text')
            await utils.sleep(1000)
            await user_simulate.userClick(action, 'ytm-searchbox path[d^="M15"]')
            return
        }

        if (!action.query_correction && await action.page.$('a.search-query-correction-endpoint:nth-of-type(2)')) {
            action.query_correction = true
            await user_simulate.userClick(action, 'a.search-query-correction-endpoint:nth-of-type(2)')
            return
        }

        let filter = action.filter ? (action.filter + 1) : 2
        if (filter > 4) {
            console.log('error', 'retry all')
            await request_api.updateActionStatus(action, action.id, 0, 'video not found')
            return
        }
        else {
            action.filter = filter
        }

        // await user_simulate.userScrollTo(action.pid,'#filter-menu a > #button')
        // await utils.sleep(1000)
        await user_simulate.userScroll(action, -5)
        await user_simulate.userClick(action, 'button.search-filter-icon')
        await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2)')

        await utils.sleep(2000)

        if (filter == 1) {
            // this hour
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        }
        if (filter == 2) {
            // today
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(2)')
        }
        else if (filter == 3) {
            // this week
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(3)')
        }
        else if (filter == 4) {
            // this month
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(4)')
        }
        await utils.sleep(2000)
    }
    else if (action.url_type == 'playlist') {
        let filter = action.filter ? (action.filter + 1) : 1
        if (filter > 1) {
            console.log('error', 'retry all')
            await request_api.updateActionStatus(action, action.id, 0, 'playlist not found')
            return
        }
        else {
            action.filter = filter

        }

        await user_simulate.userScroll(action, -5)
        await user_simulate.userClick(action, 'button.search-filter-icon')
        await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(1)')

        if (filter == 1) {
            // playlist
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(1) option:nth-of-type(3)')
        }
    }
    else {
        throw 'unknown url_type'
    }
}

async function processWatchChannelPageMobile(action) {
    let url = action.page.url()
    if (url.indexOf('/videos') > -1) {
        // process videos page
        let i = 50
        while (i > 0 && !await action.page.$('ytm-browse lazy-list a.compact-media-item-metadata-content[href*="' + action.playlist_url + '"]')) {
            await user_simulate.userScroll(action, 5)
            await utils.sleep(1000)
            i--
        }
        let video = await action.page.$('ytm-browse lazy-list a.compact-media-item-metadata-content[href*="' + action.playlist_url + '"]')
        if (video) {
            await user_simulate.userClick(action, 'ytm-browse lazy-list a.compact-media-item-metadata-content[href*="' + action.playlist_url + '"]', video)
            await utils.sleep(2000)
        }
        else {
            throw 'video in page not found'
        }
    }
    else {
        // click videos tab
        if (await action.page.$('.scbrr-tabs a:nth-of-type(2)')) {
            await user_simulate.userClick(action, '.scbrr-tabs a:nth-of-type(2)')
        }
        else {
            throw 'no videos link'
        }
    }
}

async function processSearchSuggestMobile(action) {
    let url = action.page.url()
    if (action.suggest_videos) {
        // get public days
        try {
            action.public_days = action.public_days == undefined ? (action.url_type == 'video' ? (await getPublicDays(action.playlist_url)).data : 7) : action.public_days

        }
        catch (e) {
            console.log('getPublicDays err:', e)
        }

        // check public days
        // if(action.public_days <= 1/24 && url.indexOf('253D%253D') < 0){
        //     // filter by hour
        //     await user_simulate.userClick(action, '#filter-menu a > #button')
        //     await utils.sleep(2000)
        //     await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        // }
        // else if(action.public_days <= 1/24 && Array.from(await action.page.$$('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail')).length < 20){
        //     // filter by hour by not enough results
        //     action.public_days = 1
        //     
        //     await user_simulate.userClick(action, '#search-icon-legacy')
        // }
        if (action.public_days <= 1 && url.indexOf('253D%253D') < 0) {
            // filter by day
            await user_simulate.userClick(action, 'button.search-filter-icon')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(2)')

        }
        else if (action.public_days <= 7 && url.indexOf('253D%253D') < 0) {
            // filter by week
            await user_simulate.userClick(action, 'button.search-filter-icon')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(3)')
        }
        else if (action.public_days <= 30 && url.indexOf('253D%253D') < 0) {
            // filter by month
            await user_simulate.userClick(action, 'button.search-filter-icon')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await user_simulate.userClick(action, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(4)')
        }
        else {
            let randomScroll
            if (action.url_type == 'video' && (action.public_days == undefined || action.public_days > 1)) {
                randomScroll = utils.randomRanger(0, 9)
            }
            else {
                randomScroll = utils.randomRanger(0, 4)

            }
            if (randomScroll > 0) {
                await user_simulate.userScroll(action, randomScroll * 5)
            }
            await utils.sleep(utils.randomRanger(1000, 5000))
            await user_simulate.userClickRandomVideoMobileComplact(action)
        }
        return true
    }
}

async function processWatchPageMobile(action) {
    let watchVideo = await preWatchingVideoMobile(action)
    if (watchVideo) {
        let finishVideo = await watchingVideoMobile(action)
        await afterWatchingVideoMobile(action, finishVideo)
    }
}

async function preWatchingVideoMobile(action) {
    let url = action.page.url()
    // removeSuggest()
    if (url.indexOf(action.playlist_url) < 0) {
        await skipAdsMobile(action)
        await utils.sleep(utils.randomRanger(10000, 30000))
        if (action.preview) {
            action.preview = false
            action.lastRequest = Date.now()

            await searchMobile(action, action.video)
            return
        }
        if (action.home) {
            if (Math.random() < 0.5) {
                await user_simulate.userClick(action, '#app #home-icon')
            }
            else {
                await action.page.goto('https://youtube.com//')
            }
            return
        }
        if (action.page) {
            let channel = await action.page.$('ytm-slim-owner-renderer a.slim-owner-icon-and-title')
            await user_simulate.userClick(action, 'channel link', channel)
        }
        if (action.suggest) {
            let scroll = utils.randomRanger(3, 5)
            for (let i = 0; i < scroll; i++) {
                await user_simulate.userScroll(action, 10)
                let video = await action.page.$('ytm-single-column-watch-next-results-renderer lazy-list ytm-compact-video-renderer a.compact-media-item-image[href*="' + action.playlist_url + '"]')
                if (video) {
                    await user_simulate.userClick(action, action.playlist_url, video)
                    return
                }
            }
            if (!action.channelName || action.other_videos.length >= CHANNEL_VIDEO_WATCH) {
                action.suggest = false

                let randomNext = utils.randomRanger(1, 4)
                let nextSelector = `ytm-single-column-watch-next-results-renderer lazy-list ytm-compact-video-renderer:nth-of-type(${randomNext})`
                let next = await action.page.$(nextSelector)
                await action.page.evaluate(e => e.insertAdjacentHTML('beforebegin', '<ytm-compact-video-renderer class="item"><div class="compact-media-item"><a class="compact-media-item-image" aria-hidden="true" href="/watch?v=zf8Lu8-eFrY"><div class="video-thumbnail-container-compact center"><div class="cover video-thumbnail-img video-thumbnail-bg"></div><img alt="" class="cover video-thumbnail-img" src="https://i.ytimg.com/vi/zf8Lu8-eFrY/default.jpg"><div class="video-thumbnail-overlay-bottom-group"><ytm-thumbnail-overlay-time-status-renderer data-style="DEFAULT">8:52</ytm-thumbnail-overlay-time-status-renderer></div></div></a><div class="compact-media-item-metadata" data-has-badges="false"><a class="compact-media-item-metadata-content" href="/watch?v=zf8Lu8-eFrY"><h4 class="compact-media-item-headline">Chị em thi nhau rụng tim với giọng hát ngọt ngào của rapper BIGCITYBOI</h4><div class="subhead" extend-height="false" aria-hidden="true"><div class="compact-media-item-byline small-text">DONG TAY ENTERTAINMENT</div><div class="compact-media-item-stats small-text">6.4M views</div></div></a><ytm-menu-renderer class="compact-media-item-menu"><ytm-menu><button class="icon-button " aria-label="Action menu" aria-haspopup="true"><c3-icon flip-for-rtl="false"><svg viewBox="0 0 24 24" fill=""><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></c3-icon></button></ytm-menu></ytm-menu-renderer></div></div></ytm-compact-video-renderer>'), next)
                let videoHref = action.url_type == 'video' ? "/watch?v=" + action.playlist_url : "/watch?v=" + (await getFirstVideo(action.playlist_url)).data + "&list=" + action.playlist_url
                await action.page.evaluate((e, videoHref) => e.previousElementSibling.querySelector('a').href = videoHref, next, videoHref)
                await user_simulate.userClick(action, `${nextSelector} a.compact-media-item-image`)
                return
            }
            else {
                // get other video of channel, click if not empty
                let channelName = action.channelName
                let allVideos = [...await action.page.$$('ytm-single-column-watch-next-results-renderer lazy-list a.compact-media-item-metadata-content')]
                let otherVideos = []
                for(let i = 0; i < otherVideos.length; i++){
                    if (await action.page.evaluate((x, channelName, other_videos) => x.querySelector('.subhead > .compact-media-item-byline').textContent == channelName && !other_videos.includes(x.parentElement.parentElement.href.split('v=')[1].split('&')[0])), allVideos[i], channelName, action.other_videos) {
                        otherVideos.push(allVideos[i])
                    }
                }
                if (otherVideos.length) {
                    let otherVideo = otherVideos[utils.randomRanger(0, otherVideos.length - 1)]
                    action.other_videos.push(await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0]), otherVideo)
                    await user_simulate.userClick(action, await action.page.evaluate(e => e.href, otherVideo), otherVideo)
                    return
                }
                else {
                    // click channel page
                    let channel = await action.page.$('ytm-slim-owner-renderer a.slim-owner-icon-and-title')
                    if (channel) {
                        await user_simulate.userClick(action, 'channel link', channel)
                    }
                    else {
                        await user_simulate.userTypeEnter(action, 'input#search', action.video)
                    }
                }
            }
            return
        }
        if (action.after && action.finish) {
            await request_api.updateActionStatus(action, action.id, 0)
            return
        }
    }

    action.preview = undefined
    action.suggest_search = false
    action.suggest_videos = false


    if (action.url_type == 'playlist') {
        action.playlist_index = action.playlist_index == undefined ? (action.total_times + utils.randomRanger(0, 1)) : action.playlist_index
        console.log('playlist_index:', action.playlist_index)
        action.playlist_index = action.playlist_index - 1

    }

    if (action.total_times < 1000) {
        await skipAdsMobile(action)
        // get video time
        let videoTime = await action.page.$('.time-second').textContent.split(':')
        videoTime = videoTime.length == 2 ? videoTime[0] * 60 + videoTime[1] * 1 : videoTime[0] * 60 * 60 + videoTime[1] * 60 + videoTime[2] * 1
        if (action.url_type == 'playlist' && videoTime > 3600) {
            videoTime = 3600
        }
        console.log('videoTime:', videoTime)
        if (Math.random() < 0.2) {
            action.watch_time = videoTime * 1000 * utils.randomRanger(2, 7) / 10
        }
        else {
            action.watch_time = videoTime * 1000 * utils.randomRanger(7, 9) / 10
        }
        console.log('pid', action.pid, 'video', action.playlist_url, 'percent time:', action.watch_time)
    }
    else {
        action.watch_time = Math.random() < 0.2 ? (action.total_times * utils.randomRanger(2, 7) / 10) : (action.total_times * utils.randomRanger(7, 9) / 10)
    }

    if (!action.react) {
        let commentKeyword = getCommentKeyword(action.playlist_url, action.video)
        action.react = await getReact(commentKeyword, action.watch_time * 0.9)
    }


    return true
}

async function watchingVideoMobile(action) {
    let url = action.page.url()
    let interval = 5000
    for (let i = 0; i < action.watch_time;) {
        let currentUrl = action.page.url()
        // check current url
        if (currentUrl.indexOf(action.playlist_url) < 0 || currentUrl != url) {
            console.log('not play video', action.playlist_url)
            return
        }

        if (i == 0 && url.indexOf('&t=') > -1) {
            await user_simulate.sendKey(action, "0")
        }

        await skipAdsMobile(action, true)

        await clickPlayIfPauseMobile(action)

        // like or comment
        let react = action.react
        if (react && react.like_time > i && react.like_time <= i + interval) {
            await utils.sleep(react.like_time - i)
            await LikeOrDisLikeYoutubeVideoMobile(action.pid, react.like)
        }
        if (react && react.comment_time > i && react.comment_time <= i + interval) {
            await utils.sleep(react.comment_time - i)
            await CommentYoutubeVideoMobile(action.pid, react.comment)
        }
        if (react && react.sub_time > i && react.sub_time <= i + interval) {
            await utils.sleep(react.sub_time - i)
            await user_simulate.userClick(action, 'ytm-subscribe-button-renderer c3-material-button[data-style="STYLE_BRAND"]')
        }

        let sleepTime = action.watch_time - i > interval ? interval : action.watch_time - i
        await utils.sleep(sleepTime)

        // report time
        if (i % 300000 == 0) {
            console.log('report time')
            let continueWatch = await updateWatchingTime(action.pid, 1, 0, i == 0 ? 20000 : 300000, { url: action.playlist_url, keyword: action.video })
            console.log('updateWatchingTime', continueWatch)
            let finish = !continueWatch.err && !continueWatch.continue
            if (finish) {
                console.log('info', 'pid: ', action.pid, ' finish watch: ', action.playlist_url)
                action.playlist_index = 0

                return
            }
            if (Math.random() < 0.3) {
                let randomScroll = utils.randomRanger(3, 7)
                await user_simulate.userScroll(action, randomScroll)
                await utils.sleep(1000)
                await user_simulate.userScroll(action, -randomScroll)
            }
        }

        await request_api.updateActionStatus(action, action.id, 1, action.playlist_url + '_' + i, false)
        action.lastRequest = Date.now()


        i += sleepTime
    }
    return true
}

async function afterWatchingVideoMobile(action, finishVideo) {
    let url = action.page.url()
    if (action.url_type == 'playlist') {
        if (action.playlist_index < 1 || url.indexOf(action.playlist_url) < 0) {
            await request_api.updateActionStatus(action, action.id, 0, 'end playlist')
            return
        }
        else {
            if (finishVideo) {
                // nex video
                await action.page.$eval('.player-controls-middle.center button:nth-of-type(5)', e => e.click())
            }
            return
        }
    }

    if ((await getActionData()).action.finish) return

    action.finish = true



    if (action.after_video && !action.remove_suggest) {
        action.after_video = false
        action.after = true

        await userClickRandomVideo(action.pid)
        return
    }
    else {
        // report host app
        await request_api.updateActionStatus(action, action.id, 0)
        return
    }
}

async function processBrowserFeatureMobile(action) {
    if (action.home) {
        await utils.sleep(3000)
        let scroll = utils.randomRanger(3, 7)
        for (let i = 0; i < scroll; i++) {
            await user_simulate.userScroll(action, 10)
            let video = await action.page.$('ytm-single-column-browse-results-renderer a.large-media-item-thumbnail-container[href*="' + action.playlist_url + '"]')
            if (video) {
                await user_simulate.userClick(action, action.playlist_url, video)
                return
            }
        }
        if (action.other_videos.length >= CHANNEL_VIDEO_WATCH) {
            action.home = false

            await searchMobile(action, action.video)
        }
        else {
            // find other videos of channel
            if (action.channelName) {
                let suggestVideos = [...await action.page.$$('ytm-single-column-browse-results-renderer a.large-media-item-thumbnail-container')]
                let otherVideos = []
                for (let i = 0; i < suggestVideos.length; i++) {
                    if (await action.page.evaluate((x, channelName, other_videos) => x.nextSibling.querySelector('.ytm-badge-and-byline-item-byline').textContent == channelName && !other_videos.includes(x.parentElement.parentElement.href.split('v=')[1].split('&')[0])), suggestVideos[i], action.channelName, action.other_videos) {
                        otherVideos.push(suggestVideos[i])
                    }
                }
                if (otherVideos.length) {
                    let otherVideo = otherVideos[utils.randomRanger(0, otherVideos.length - 1)]
                    action.other_videos.push(await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0]), otherVideo)
                    await user_simulate.userClick(action, await action.page.evaluate(e => e.href, otherVideo), otherVideo)
                    return
                }
            }
            // search video if no videos of channels
            await searchMobile(action, action.video)
        }
    }
}

async function skipAdsMobile(action, watchingCheck) {
    try {
        if (!watchingCheck) await utils.sleep(2000)
        while (await action.page.$('.ytp-ad-skip-ad-slot')) {
            console.log('skip ads mobile')

            let remaining = getTimeFromText(await action.page.$('.ytp-ad-duration-remaining').textContent)
            let adPercent = await action.page.$('.ytp-ad-persistent-progress-bar') ? parseFloat(await action.page.$('.ytp-ad-persistent-progress-bar').getAttribute("style").split(":")[1]) : 0
            let adTimeCurrent = adPercent * remaining / (100 - adPercent)
            let adTimeDuration = 100 * remaining / (100 - adPercent)

            let adWatchTime
            if (Math.random() < SKIP_ADS_PERCENT) {
                // skip ad
                if (adTimeDuration <= 30) {
                    adWatchTime = getWatchAdTime(adTimeCurrent, 1, 10)
                }
                else {
                    adWatchTime = getWatchAdTime(adTimeCurrent, 1, 28)
                }
            }
            else {
                // watch ad
                if (adTimeDuration <= 30) {
                    adWatchTime = getWatchAdTime(adTimeCurrent, 12, adTimeDuration)
                }
                else {
                    if (Math.random() < 0.1) {
                        adWatchTime = getWatchAdTime(adTimeCurrent, 0.9 * adTimeDuration, adTimeDuration)
                    }
                    else if (Math.random() < 0.4) {
                        adWatchTime = getWatchAdTime(adTimeCurrent, Math.max(30, adTimeDuration * 0.5), adTimeDuration * 0.9)
                    }
                    else {
                        adWatchTime = getWatchAdTime(adTimeCurrent, 30, Math.max(30, adTimeDuration * 0.5))
                    }
                }
            }
            await utils.sleep(adWatchTime * 1000)
            while (!await action.page.$('button.ytp-ad-skip-button') || !(await action.page.$eval('button.ytp-ad-skip-button', e => e.getBoundingClientRect().x))) {
                await utils.sleep(1000)
            }
            await user_simulate.userClick(action, 'button.ytp-ad-skip-button')
            await utils.sleep(2000)
        }
        await user_simulate.userClick(action, '.ytp-unmute:not([style="display: none;"]) .ytp-unmute-icon')
    }
    catch (e) {

    }
}

async function LikeOrDisLikeYoutubeVideoMobile(pid, isLike) {
    try {
        const likeBtn = Array.from(await action.page.$$("lazy-list .slim-video-metadata-actions c3-material-button"))

        let index
        if (isLike) {
            index = 1
        } else {
            index = 2
        }
        if (likeBtn.length > 1) {
            await user_simulate.userClick(action, `lazy-list .slim-video-metadata-actions c3-material-button:nth-of-type(${index}) button[aria-pressed="false"]`)
            console.log(index == 0 ? 'like' : 'dislike' + 'OK')
        } else {
            console.log("like & dislike button not available")
        }

    } catch (e) {
        console.log("LikeOrDisLikeYoutubeVideo pid: ", pid, " err: ", e)
    }
}

async function CommentYoutubeVideoMobile(pid, msg) {       // search video or view homepage
    try {
        console.log('pid: ', pid, ', CommentYoutubeVideo', msg)
        if (!msg) return
        await utils.sleep(2000)

        let chatFrame = await action.page.$('#chatframe')
        if (chatFrame) {
            if (!chatFrame.$('yt-live-chat-message-renderer a')) {
                await user_simulate.userTypeEnter(action, 'yt-live-chat-text-input-field-renderer#input', msg, '', chatFrame)
                return
            }
            else {
                // create channel
                let action = (await getActionData()).action
                action.create_channel = true

                await user_simulate.userClick(action, 'create channel', chatFrame.$('yt-live-chat-message-renderer a'), chatFrame)
                return
            }
        }

        await user_simulate.userScroll(action, 70)

        if (await action.page.$('.comment-section-header-text')) {
            await user_simulate.userClick(action, '.comment-section-header-text')
            await utils.sleep(1000)
            await user_simulate.userClick(action, 'button.comment-simplebox-reply')
            await userType(action.pid, 'textarea.comment-simplebox-reply', msg)
            await utils.sleep(1000)
            await user_simulate.userClick(action, '.comment-simplebox-buttons c3-material-button:nth-of-type(2) button')
        }
        else {
            console.log('error', 'NO COMMENT SECTION')
            return
        }

    } catch (e) {
        console.log('error', 'CommentYoutubeVideo', pid)
    }
}

async function getReact(action, keyword, totalTime) {
    console.log('getReact', keyword, totalTime)
    let like = false
    let dislike = false
    let sub = false
    let comment
    if (Math.random() < LIKE_PERCENT) {
        if (Math.random() < 0.95) {
            like = true
        }
        else {
            dislike = true
        }
    }

    let commentPercent = await action.page.$('#chatframe') ? COMMENT_PERCENT * 10 : COMMENT_PERCENT

    if (Math.random() < commentPercent) {
        comment = await getComment(keyword)
        console.log('GETCOMMENT', comment)
        comment = comment.data
    }

    if (Math.random() < VIEW_SUB_PERCENT) {
        sub = true
    }

    let likeTime = like || dislike ? utils.randomRanger(10000, totalTime) : 0
    let commentTime = comment ? utils.randomRanger(10000, totalTime) : 0
    let subTime = sub ? utils.randomRanger(10000, totalTime) : 0

    let react = { like: like, dislike: dislike, comment: comment, like_time: likeTime, comment_time: commentTime, sub: sub, sub_time: subTime }
    console.log('react:', react)

    return react
}

async function clickPlayIfPauseMobile(action) {
    console.log('clickPlayIfPauseMobile')
    let btnPlay = await action.page.$('path[d="M18.667 11.667v32.666L44.333 28z"]')
    if (btnPlay) {
        console.log('info', 'clickPlayIfPauseMobile')
        await user_simulate.userClick(action, 'path[d="M18.667 11.667v32.666L44.333 28z"]')
    }
}

function getCommentKeyword(videoId, keyword) {
    return keyword.split(' ').filter(x => x != videoId).slice(0, utils.randomRanger(3, 5)).join(' ')
}

function getTimeFromText(str) {
    try {
        let time = str.split(':')
        return time[0] * 60 + time[1] * 1
    }
    catch (e) {
        return 0
    }
}

function getWatchAdTime(currentTime, minTime, maxTime) {
    minTime = Math.round(minTime)
    maxTime = Math.round(maxTime)
    let adWatchTime = utils.randomRanger(minTime, maxTime) - currentTime
    return adWatchTime > 0 ? adWatchTime : 0
}

async function searchMobile(action, keyword) {
    await user_simulate.userScroll(action, -1)
    await user_simulate.userClick(action, 'button.topbar-menu-button-avatar-button')
    await utils.sleep(1000)
    await user_simulate.userTypeEnter(action, 'input.searchbox-input', keyword)
}

async function checkLogin(action) {
    await action.page.waitForSelector('#home-icon',{delay:40000,visible: true})
    if (!(await action.page.$('#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img'))) {
        if(!action.check_login){
            action.check_login = true
            await action.page.goto('https://accounts.google.com')
            return true
        }
        else{
            return
        }
    }
}

module.exports.userWatchMobile = userWatchMobile