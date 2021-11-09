const utils = require('./utils')
const request_api = require('./request_api')

function stopForOther(pid, action){
    return !watchRunnings.filter(x => x.pid == pid && x.action == action).length
}

function updateLastReport(pid, playlistId, playlist,resetTime){
    // update time
    watchRunnings = watchRunnings.map(x => {
        if(x.pid == pid) {
            if(resetTime){
                x.playlistTime[playlistId] = Date.now()
            }
            if(playlist){
                x.playlist[playlistId] = playlist
                console.log('pid: ', pid, ', playlist: ',playlistId,' update playlist info: ', playlist)
            }
            x.lastReport = Date.now()
        }
        return x
    })
}

async function breakWait(pid, page, time, action,playlistId, videoTime){
    for(let i = 0; i < time; ){
        if(stopForOther(pid, action))  break
        console.log('continue page wait pid: ', pid, ' action: ', action, ' url: ', page.url(),', time: ', i, '/', time)

        if(playlistId && (page.url().indexOf("https://m.youtube.com/watch") != 0 || page.url().indexOf(playlistId) < 0)){
            console.log('error','cant load video to watch')
            return
        }

        if(playlistId && i == 0){
            await utils.changeMobQuality(pid,page)
        }

        await page.bringToFront()
        await page.waitFor(20000)

        await dismissDialog(pid, page)
        await clickPlayIfPause(pid, page)

        // get playlist info
        let running = watchRunnings.filter(x => x.pid == pid && x.action == action)
        let playlist = null
        if(running.length && playlistId){
            playlist = await utils.getPlaylistPageInfoMobile(pid, page)
            // playlist = playlist.url?playlist:null
            playlist['url'] = playlistId
        }

        let resetTime = false
        let finishPlaylist = false
        if(i%300000==0 && i > 0){
            // report watching time
            let continueWatch = await request_api.updateWatchingTime(pid, action, 0, 300000,playlist)
            console.log('pid: ',pid, ' playlist: ',playlistId, 'continueWatch: ',continueWatch)
            finishPlaylist = !continueWatch.err && !continueWatch.continue
            if(finishPlaylist){
                console.log('info','pid: ',pid,' finish playlist: ',playlistId)
            }
            resetTime = true
        }
        updateLastReport(pid, playlistId, playlist, resetTime)

        if((playlist&&playlist.last) || finishPlaylist){
            return
        }

        if(page.url().indexOf('list=') >= 0 && i > 0 && i%(1000*(videoTime?videoTime:120))==0){
            console.log('click next:',pid)
            await page.$$eval('.playlist-controls-primary button.c3-material-button-button', elements => elements[1].click());
            await page.waitFor(7000)
        }

        if(i%60000==0){
            await utils.screenshot(page, pid)      // TODO: take screenshot to check
        }

        i+= 20000
    }
}

async function dismissDialog(pid, page){
    try{
        let dialog = await page.$('.ytm-mealbar-promo-button > .c3-material-button[data-style="STYLE_BLUE_TEXT"] > button')
        if(dialog){
            await dialog.click()
        }
    }
    catch (e) {
        console.log('pid',pid,'dialog error',e)
    }
}

async function start(pid, browser, action, channels){

    try {
        // let channels = await request_api.getPlaylist(pid, action)

        console.log('pid: ', pid, ' start watching mobile',', channels:', channels)
        //socks5://127.0.0.1:8001
        const page = await browser.newPage()
        // if(proxy){
        //     await page.authenticate({username : proxy[pid].username, password : proxy[pid].password});
        // }
        await page.setCacheEnabled(false)
        page.setDefaultTimeout(60000)
        let agent = utils.getMobileAgent(pid)
        await page.setUserAgent(agent)

        // await page.setViewport({
        //     width: 320,
        //     height: 480
        // })

        // refreshPlaylist(pid, page, action)

        page.on('load',function () {
            console.log('info','pid: ', pid, ' page load: ', page.url())
        })

        let keywords = channels.keyword
        let needReading = channels.reading_time && channels.reading_time > 0
        let startTime = Date.now()

        while(keywords && keywords.length && action > 0 && needReading && !stopForOther(pid, action)) {
            let keyword = keywords.shift().trim()
            let isReading = randomRanger(0, 9)

            if(isReading >= 7) { //view google search
                await searchGoogle(pid, page, keyword, action)
            }else { // view youtube
                await viewYoutube(pid, page, keyword, action)
            }
        }

        if(needReading){
            // update watching time for reading
            await request_api.updateWatchingTime(pid, action, Date.now() - startTime, 0)
            console.log('pid: ',pid, 'channels: ', channels)
        }

        if(channels.watch_time > 0){
            await gotoYoutubePlaylistBySearchOrUrl(pid, page, channels.playlist, channels.search, channels.watch_time, action, channels.keyword)
        }

        if(stopForOther(pid, action)){
            console.log("READING DONE: ", pid, ' stop for other')
            return {status: 0, pid: pid}
        }
        else{
            console.log("READING DONE: ", pid)
            return {status: 1, pid: pid}
        }
    }
    catch (e) {
        if(stopForOther(pid, action)){
            console.log('return for other action: ', {status: 0, pid: pid})
            return {status: 0, pid: pid}
        }
        else{
            console.log('reading pid: ', pid, ', err: ', e)
            return {status: -1, pid: pid, err: e}
        }
    }
    // finally {
    //     if(!stopForOther(pid, action)){
    //         try{
    //             await browser.close()
    //         }
    //         catch (e) {
    //             console.log('pid: ', pid, ' close browser err: ', e)
    //         }
    //     }
    // }
}

function randomRanger(min, max) {
    // return Math.floor(Math.random() * (max + 1)) + min;
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function getRandomKeyword() {
    var currentdate = new Date();
    return "movie "  + currentdate.getSeconds() + " " + Math.floor(Math.random() * 1000);
}
async function viewYoutube(pid, page, keyword, action) {
    try {
        await gotoYoutubeVideoBySearch(pid, page, keyword, action)
        console.log('pid: ',pid, 'viewYoutube: ', page.url())


        var isComment = randomRanger(0, 10)
        if(isComment >= 8) {
            await page.waitFor(5000)
            await CommentYoutubeVideo(pid, page, action)
            await page.waitFor(5000)
        }
        var isLikeOrDisLike = randomRanger(0, 10)
        if (isLikeOrDisLike >= 8) {
            var isLike = randomRanger(0, 2)
            await LikeOrDisLikeYoutubeVideo(pid, page, isLike, action)
            await page.waitFor(5000)
        }

        await breakWait(pid, page,randomRanger(120, 240) * 1000, action)
        // await breakWait(pid, page,randomRanger(150, 180) * 1000, action)
    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            console.log('viewYoutube pid: ', pid, ', err: ', e)
            await utils.errorScreenshot(page, pid+ '_youtube')
        }
    }
}
async function searchGoogle(pid, page, keyword, action) {
    try {

        await page.goto("https://google.com")

        await page.waitFor("input[name='q']")
        await page.waitFor(1000)

        const search = await page.$("input[name='q']")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        await page.waitFor(3000)

        const hrefs = await page.$$('#rso .mnr-c a');
        if (hrefs.length > 0) {
            if(await page.$('div[role="dialog"]')){
                console.log('pid:',pid,'has dialog')
                let a = await page.$('g-bottom-sheet')
                if(a){
                    await a.click()
                    await page.waitFor(2000)
                }
            }

            let i = 0
            while(i<5){
                let randomIndex = randomRanger(0, hrefs.length - 1)
                try {
                    console.log('pid: ', pid, ' go to google link index: ', randomIndex, '/', hrefs.length)
                    await hrefs[randomIndex].click()
                    break
                }
                catch (e) {
                    console.log('error', ' pid: ', pid, ' go to google link index: ', randomIndex, e)
                    await page.waitFor(1000)
                    i += 1
                }
            }

            await page.waitFor(5000)
            await page.evaluate(_ => {
                function pageScroll(i) {
                    i++
                    if (i > 10) {
                        return
                    }
                    console.log("scroll to ", i * 100)
                    window.scrollBy(0, i * 100); // horizontal and vertical scroll increments
                    setTimeout(function(){
                        pageScroll(i + 1)
                    },1000); // scrolls every 100 milliseconds
                }
                pageScroll(0)
            })
            console.log('reading some time:', pid)
            await breakWait(pid, page,randomRanger(90, 120) * 1000, action)
            // await breakWait(pid, page,randomRanger(150, 180) * 1000, action)
            console.log('end visiting: ' + page.url().toString())
        }
    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            console.log('searchGoogle pid: ', pid, ', err: ', e)
            await utils.errorScreenshot(page, pid+ '_search')
        }
    }
}

async function gotoYoutubeVideoBySearch(pid, page, keyword, action, retry, videoId) {
    try {
        // mobile page
        if(!retry){
            await page.goto("https://m.youtube.com/")
        }
        else{
            console.log('info','pid: ',pid,'retry gotoYoutubeVideoBySearch')
            await page.goto("https://www.youtube.com/feed/trending")
        }

        await page.waitFor(5000)

        // await page.waitFor('button[aria-label^="Search"]')
        // await page.$$eval('button[aria-label^="Search"]', elements => elements[1].click());

        let searchBtn = await page.waitForSelector('.mobile-topbar-header-content > button.topbar-menu-button-avatar-button',{timeout:15000})
        await page.waitFor(3000)
        await searchBtn.click()


        await page.waitFor("input.searchbox-input")
        await page.waitFor(5000)

        const search = await page.$("input.searchbox-input")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        await page.waitFor('a.compact-media-item-metadata-content');
        await page.waitFor(7000)

        if(videoId){
            let href = await page.$('.page-container:not([hidden]) a.compact-media-item-metadata-content[href*="'+videoId+'"]')
            if(href){
                await href.click()
                await page.waitFor(10000)
                await clickPlayIfPause(pid, page)
                return
            }
            else{
                console.log('info','pid: ',pid, 'gotoYoutubeVideoBySearch not found video: ', videoId)
                let correction = await page.$$('a.search-query-correction-endpoint')
                if(correction.length){
                    await correction[1].click()
                    await page.waitFor(10000)
                    // let href = await page.$('a#thumbnail[href*="/watch?v='+videoId+'"]')
                    let href = await page.$('.page-container:not([hidden]) a.compact-media-item-metadata-content[href*="'+videoId+'"]')
                    if(href){
                        await href.click()
                        await page.waitFor(10000)
                        await clickPlayIfPause(pid, page)
                        return
                    }
                }
            }

            console.log('error', pid, 'gotoYoutubeVideoBySearch','videoId',videoId,'not found')
            throw 'video not found'
        }
        else{
            const hrefs = await page.$$('.page-container:not([hidden]) a.compact-media-item-metadata-content');
            if(hrefs.length > 0) {
                let i = 0
                while(i<5){
                    let randomIndex = randomRanger(0, hrefs.length - 1)
                    try {
                        console.log('pid: ', pid, ' go to youtube link index: ', randomIndex, '/', hrefs.length)
                        await hrefs[randomIndex].click()
                        break
                    }
                    catch (e) {
                        console.log('error', ' pid: ', pid, ' go to youtube link index: ', randomIndex, e)
                        i += 1
                    }
                }

                await page.waitFor(3000)
            }
        }
    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else {
            if (retry) {
                console.log('error', 'gotoYoutubeVideoBySearch pid: ', pid, ', err: ', e)
                throw e
            } else {
                console.log('error', 'gotoYoutubeVideoBySearch pid: ', pid, ', err: ', e)
                await gotoYoutubeVideoBySearch(pid, page, keyword, action, true, videoId)
            }
        }
    }
}

async function LikeOrDisLikeYoutubeVideo(pid, page, isLike, action) {
    try {
        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 5) {
                    return
                }
                window.scrollBy(0,i * -100); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },100); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })

        await page.waitFor(".slim-video-metadata-actions")
        await page.waitFor(2000)
        const likeBtn = await page.$$(".slim-video-metadata-actions button")

        let index = 0
        if(isLike) {
            index = 0
        }else {
            index = 1
        }

        if(likeBtn.length > 1) {
            await likeBtn[index].click()
            console.log('pid',pid,index==0?'like':'dislike'+ 'OK')
        }else {
            console.log("like & dislike button not available")
        }
    }catch (e) {
        if(stopForOther(pid, action)&&action!=utils.ACTION.SUB)
            throw "stop for other!"
        else{
            console.log("LikeOrDisLikeYoutubeVideo pid: ", pid, " err: ", e)
            await utils.errorScreenshot(page,pid+ '_like')
        }
    }
}

async function getCommentMsg(page){

    let msg = ''
    let comments = await page.$$eval('.comment-text.user-text', es => es.map(e=>e.textContent))
    if(comments && comments.length >= 5){
        let i=0
        let c = []
        while(c.length<utils.randomRanger(2,3) && i<5){
            let m = comments[utils.randomRanger(2,comments.length-1)]
            if(m!=c[0]&&m.length<100){
                c.push(m)
            }
        }
        if(c.length) msg = c.join('\n')
    }

    return msg
}

async function CommentYoutubeVideo(pid, page, action) {       // search video or view homepage
    try {
        console.log('pid: ', pid, ', CommentYoutubeVideo')
        await page.waitFor(2000)
        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 5) {
                    return
                }
                window.scrollBy(0,i * 100); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },100); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })

        // comment section
        await page.waitForSelector("ytm-comment-section-header-renderer",{timeout:2000})
        await page.waitFor(2000)

        const commSec = await page.$("ytm-comment-section-header-renderer")
        await commSec.click()

        await page.waitFor(1000)

        let msg = await getCommentMsg(page)
        console.log('pid: ',pid,'msg to comment: ', msg)
        if(!msg.length) return

        // comment box
        await page.waitForSelector(".comment-simplebox-placeholder.comment-simplebox-reply",{timeout:2000})
        await page.waitFor(2000)

        const cmtBox1 = await page.$(".comment-simplebox-placeholder.comment-simplebox-reply")
        await cmtBox1.click()

        // text area
        await page.waitForSelector("textarea.comment-simplebox-reply",{timeout:2000})
        await page.waitFor(2000)

        const cmtBox = await page.$("textarea.comment-simplebox-reply")
        await cmtBox.type(msg, {delay : 30})

        // click comment
        await page.waitFor(2000)
        const cmtSubmit = await page.$$(".comment-simplebox-buttons button")
        await cmtSubmit[1].click()
        await page.waitFor(2000)

        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 5) {
                    return
                }
                window.scrollBy(0,i * -100); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },100); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })

    }catch (e) {
        if(stopForOther(pid, action)&&action!=utils.ACTION.SUB)
            throw "stop for other!"
        else{
            console.log('CommentYoutubeVideo pid: ', pid, ' url: ', page.url(), ', err: ', e)
            await utils.errorScreenshot(page, pid+ '_comment')
        }
    }
}

async function clickPlayIfPause(pid, page) {
    if(await page.$('.ytp-small-mode.ended-mode')){
        await utils.screenshot(page, pid+'_video_paused')
        let btn = await page.$('button.ytp-large-play-button.ytp-button')
        if(btn){
            try{
                console.log('info','pid: ', pid, 'click next for paused')
                await (await page.$$('.playlist-controls-primary button'))[1].click()
            }
            catch (e) {
                console.log('error','pid: ', pid, 'click play err')
            }
        }
    }
}

async function gotoYoutubePlaylistBySearchOrUrl(pid, page, keywordOrUrlList, isSearch, totalTime, action, keywords) {
    try {
        console.log('pid: ', pid, ' play list keyword/url: ', keywordOrUrlList)
        for(var i = 0 ; i < keywordOrUrlList.length; i++) {
            if(stopForOther(pid, action)) return
            try{
                let timePerEach = totalTime / keywordOrUrlList.length + randomRanger(60, 180) * 1000
                console.log('pid: ', pid, ' timePerEach: ', timePerEach)
                if(isSearch) {
                    await page.goto("https://m.youtube.com/results?sp=EgIQAw%253D%253D&search_query="  + decodeURIComponent(keywordOrUrlList[i]))
                    await page.waitFor(3000)

                    await page.waitForSelector('a.compact-media-item-metadata-content',{timeout:3000});
                    await page.waitFor(2000)

                    const hrefs = await page.$$("a.compact-media-item-metadata-content")
                    if(hrefs.length > 0) {
                        console.log('pid: ', pid, ' watch playlist for keyword: ', keywordOrUrlList[i])
                        await hrefs[randomRanger(0, hrefs.length - 1)].click()
                        await page.waitFor(2000)
                        let playAll = await page.$('a.playlist-play-all-button')
                        if(!playAll) return
                        await playAll.click()
                        await page.waitFor(2000)
                        // await page.waitFor(timePerEach)
                        await breakWait(pid, page, timePerEach, action, keywordOrUrlList[i])
                    }
                    else{
                        console.log('pid: ', pid, ' playlist link empty: ', keywordOrUrlList[i])
                    }
                }
                else if(keywordOrUrlList[i].url_type == 'video'){
                    await gotoYoutubeVideoBySearch(pid, page, keywordOrUrlList[i].video, action, false, keywordOrUrlList[i].playlist_url)
                    await breakWait(pid, page,timePerEach, action, keywordOrUrlList[i].playlist_url)
                }
                else if(keywordOrUrlList[i].url_type == 'channel' || keywordOrUrlList[i].url_type == 'user'){
                    await watchBeforePlaylistMobile(pid, page, keywords[i])

                    let home = keywordOrUrlList[i].url_type == 'channel'?'https://m.youtube.com/channel/'+keywordOrUrlList[i].playlist_url:'https://m.youtube.com/user/'+keywordOrUrlList[i].playlist_url
                    await page.goto(home)
                    await page.waitFor(3000)
                    let videosTab = await page.$$('.scbrr-tabs > a[role="tab"]')
                    if(videosTab.length > 1){
                        await page.evaluate(x => x.click(),videosTab[1])
                        await page.waitFor(7000)
                    }
                    else{
                        continue
                    }

                    if(keywordOrUrlList[i].video && keywordOrUrlList[i].video.length){
                        let video = await page.$('lazy-list > ytm-compact-video-renderer a.compact-media-item-image[href*="'+keywordOrUrlList[i].video+'"]')
                        if(video){
                            // await page.keyboard.down('Shift');
                            // await page.evaluate(x => x.click(),video)
                            await video.click()
                            // await page.keyboard.up('Shift');
                        }
                        else{
                            console.log('error','pid: ',pid,'cant find video in user page')
                            continue
                        }
                    }
                    else{
                        let videos = await page.$$('lazy-list > ytm-compact-video-renderer a.compact-media-item-image')
                        console.log('videos: ', videos.length)
                        let times = await page.$$eval('lazy-list > ytm-compact-video-renderer a.compact-media-item-image ytm-thumbnail-overlay-time-status-renderer', es => es.map(e => e.textContent))
                        let maxInd = 0
                        let maxTime = 0
                        let hours = []
                        for(let i = 0; i < videos.length; i++){
                            let time = times[i].split(':')
                            time = time.length==2?time[0]*60+time[1]:time[0]*60*60+time[1]*60+time[2]
                            if(time > maxTime){
                                maxInd = i
                            }
                            if(time > 3600){
                                hours.push(videos[i])
                            }
                        }
                        if(hours.length){
                            // await page.keyboard.down('Shift');
                            // await page.evaluate(x => x.click(),videos[utils.randomRanger(0,hours.length-1)])
                            await videos[utils.randomRanger(0,hours.length-1)].click()
                            // await page.keyboard.up('Shift');
                        }
                        else{
                            // await page.keyboard.down('Shift');
                            // await page.evaluate(x => x.click(),videos[maxInd])
                            await videos[maxInd].click()
                            // await page.keyboard.up('Shift');
                        }
                    }
                    await breakWait(pid, page,timePerEach, action, keywordOrUrlList[i].playlist_url)
                }
                else {
                    let url = 'https://www.youtube.com/playlist?list='+keywordOrUrlList[i].playlist_url
                    await page.goto(url)
                    await page.waitFor(3000)
                    let playall = await page.$('a.playlist-play-all-button')
                    if(playall){
                        await playall.click()
                        await page.waitFor(7000)
                    }
                    else{
                        console.log('error','pid: ',pid,'playlist-play-all-button not found')
                        throw 'playlist-play-all-button not found'
                    }

                    await breakWait(pid, page,timePerEach, action, keywordOrUrlList[i].playlist_url, keywordOrUrlList[i].video_time)
                }

                let running = watchRunnings.filter(x => x.pid == pid && x.action == action)
                if(running.length){
                    let lastPlaylist = running[0].playlist[keywordOrUrlList[i].playlist_url]
                    let startTime = running[0].playlistTime[keywordOrUrlList[i].playlist_url]
                    await request_api.updateWatchingTime(pid, action, 0, Date.now() - startTime,lastPlaylist)
                    updateLastReport(pid, keywordOrUrlList[i].playlist_url,null,true)
                }
                else{
                    throw "stop for other!"
                }
            }
            catch (e){
                if(stopForOther(pid, action))
                    throw "stop for other!"
                else {
                    console.log('watch list pid: ', pid, ', keyword: ', keywordOrUrlList[i], ', err: ', e)
                    await utils.errorScreenshot(page, pid+ '_playlist')
                }
            }
        }
    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            console.log('gotoYoutubePlaylistBySearchOrUrl pid: ', pid, ', err:', e)
            await utils.errorScreenshot(page, pid+ '_playlist')
        }
    }
}

async function watchBeforePlaylistMobile(pid, page, keyword, retry){
    if(!retry){
        await page.goto("https://m.youtube.com/")
        await page.waitFor(5000)

        let searchBtn = await page.$('button[aria-label^="Search"]')
        if(searchBtn){
            console.log('has searchBtn')
            await page.$$eval('button[aria-label^="Search"]', elements => elements[1].click());
            await page.waitFor(2000)
        }
        else{
            throw 'no search button'
        }

        let search = await page.$("input.searchbox-input")

        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));
        await page.waitFor(5000)
    }
    else{
        await page.goto(page.url()+'&sp=EgIYAQ%253D%253D')
        await page.waitFor(5000)
    }

    let allHrefs = await page.$$('.page-container:not([hidden]) a.compact-media-item-image');
    let hrefs = []
    let watchTimes = []
    for(let i =0; i < allHrefs.length; i++){
        let time = await allHrefs[i].$$eval('ytm-thumbnail-overlay-time-status-renderer', es => es.map(e => e.textContent));
        if(!time.length) continue
        time = time[0].split(':')
        if(time.length==2 && parseInt(time[0]) < 4 && parseInt(time[0]) >= 2){
            hrefs.push(allHrefs[i])
            watchTimes.push(parseInt(time[0])*60 + parseInt(time[1]))
        }
    }

    if(hrefs.length > 0) {
        let i = 0

        while(i<5){
            let randomIndex = randomRanger(0, hrefs.length - 1)
            try {
                console.log('pid: ', pid, ' go to youtube search link index: ', randomIndex, '/', hrefs.length)
                await hrefs[randomIndex].click()
                break
            }
            catch (e) {
                console.log('error', ' pid: ', pid, ' go to youtube search link index: ', randomIndex, e)
                i += 1
            }
        }

        await page.waitFor(utils.randomRanger(15,20)*1000)

    }
    else{
        if(retry){
            throw "NO_SHORT_VIDEO"
        }
        else{
            console.log('info','pid:',pid,'sub retry too find short video')
            await watchBeforePlaylistMobile(pid, page, keyword, true)
        }
    }
}

module.exports.start = start
module.exports.LikeOrDisLikeYoutubeVideo = LikeOrDisLikeYoutubeVideo
module.exports.CommentYoutubeVideo = CommentYoutubeVideo
module.exports.gotoYoutubePlaylistBySearchOrUrl = gotoYoutubePlaylistBySearchOrUrl