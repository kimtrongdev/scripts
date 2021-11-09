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

async function breakWait(pid, page, time, action, playlistId, videoTime, react){
    for(let i = 0; i < time; ){
        if(stopForOther(pid, action))  break
        console.log('continue page wait pid: ', pid, ' action: ', action, ' url: ', page.url(),', time: ', i, '/', time)

        if(playlistId && (page.url().indexOf("https://www.youtube.com/watch") != 0 || page.url().indexOf(playlistId) < 0)){
            console.log('error','cant load video to watch')
            return
        }

        if(i == 0 && page.url().indexOf('&t=') > -1){
            await page.keyboard.press('0');
        }

        await dismissDialog(pid, page)

        await clickPlayIfPause(page)
        let pages = await page.browser().pages()
        for(let k = 0; k < pages.length; k++){
            // await pages[k].bringToFront()
        }

        // like or comment
        if(react && react.time > i && react.time <= i + 20000){
            await page.waitFor(react.time - i)
            if(react.like || react.dislike){
                await LikeOrDisLikeYoutubeVideo(pid,  page, react.like, action)
            }
            if(react.comment){
                await CommentYoutubeVideo(pid, page, action, react.comment)
            }
        }
        else{
            // await page.bringToFront()
            await page.waitFor(20000)
        }


        // get playlist info
        let running = watchRunnings.filter(x => x.pid == pid && x.action == action)
        let playlist = null
        if(running.length && playlistId){
            playlist = await utils.getPlaylistPageInfo(pid, page)
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

        // stop if last video of playlist
        if((playlist&&playlist.last) || finishPlaylist){
            return
        }

        if(page.url().indexOf('list=') >= 0 && i > 0 && i%(1000*(videoTime?videoTime:120))==0){
            let next = await page.$('a.ytp-next-button.ytp-button')
            if(next){
                await page.waitFor(utils.randomRanger(0,10)*1000)
                console.log('click next:',pid)
                //await next.click()
                let oldUrl = page.url()
                await page.keyboard.down('Shift');
                await page.keyboard.press('KeyN');
                await page.keyboard.up('Shift');
                await page.waitFor(7000)
                if(oldUrl==page.url()){
                    throw 'can not next playlist'
                }
            }
        }

        if(i%60000==0){
            await utils.screenshot(page, pid)      // TODO: take screenshot to check
        }

        i+= 20000
    }
}

async function dismissDialog(pid, page){
    try{
        let dialogBtns = await page.$$('#dialog #dismiss-button paper-button#button')
        if(dialogBtns.length){
            await dialogBtns[0].click()
        }
    }
    catch(e){
        console.log('dismissDialog err: ', pid, e)
    }
}

async function start(pid, browser, action, channels){

    try {
        // let channels = await request_api.getPlaylist(pid, action)
        console.log('pid: ', pid, ' start watching',', channels:', channels)
        //socks5://127.0.0.1:8001
        const page = await browser.newPage()
        await page.setCacheEnabled(false)
        page.setDefaultTimeout(120000)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36')

        if(proxy){
            await page.authenticate({username : proxy[pid].username, password : proxy[pid].password});
        }

        page.on('load',function () {
            console.log('info','pid: ', pid, ' page load: ', page.url())
        })

        let keywords = channels.keyword
        let needReading = channels.reading_time && channels.reading_time > 0
        let startTime = Date.now()

        while(keywords && keywords.length && action > 0 && needReading && !stopForOther(pid, action)) {
            let keyword = keywords.shift().trim()
            let isReading = randomRanger(0, 9)

            // console.log("READING: ", keyword)

            if(isReading >= 5) { //view google search
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
            await gotoYoutubePlaylistBySearchOrUrl(pid, page, channels.playlist, channels.search, channels.watch_time, action,channels.keyword)
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
    //
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

        await breakWait(pid, page,randomRanger(150, 180) * 1000, action)
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

        await page.waitFor(5000)

        const validLinks = []
        const hrefs = await page.$$('.r a');
        if (hrefs.length > 0) {
            for (let i = 0; i < hrefs.length; i++) {
                var children = await hrefs[i].$$("h3")
                if(children.length > 0) {
                    // let valueHandle = await hrefs[i].getProperty('innerText');
                    // let linkText = await valueHandle.jsonValue();
                    validLinks.push(hrefs[i])
                }
            }
            var index = randomRanger(0, validLinks.length - 1)
            let valueHandle = await validLinks[index].getProperty('innerText');
            let linkText = await valueHandle.jsonValue();
            console.log(linkText)
            validLinks[index].click()
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
            await breakWait(pid, page,randomRanger(60, 90) * 1000, action)
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

        await page.waitFor("#top-level-buttons yt-icon-button#button.style-scope.ytd-toggle-button-renderer.style-text")
        await page.waitFor(2000)
        const likeBtn = await page.$$("#top-level-buttons yt-icon-button#button.style-scope.ytd-toggle-button-renderer.style-text")

        var index = 0
        if(isLike) {
            index = 0
        }else {
            index = 1
        }
        if(likeBtn.length > 1) {
            await likeBtn[index].click()
            console.log(index==0?'like':'dislike'+ 'OK')
        }else {
            console.log("like & dislike button not available")
        }
    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            console.log("LikeOrDisLikeYoutubeVideo pid: ", pid, " err: ", e)
            await utils.errorScreenshot(page,pid+ '_like')
        }
    }
}

async function getCommentMsg(page){

    let msg = ''
    let comments = await page.$$eval('#content-text', es => es.map(e=>e.textContent))
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

async function CommentYoutubeVideo(pid, page, action, msg) {       // search video or view homepage
    try {
        console.log('pid: ', pid, ', CommentYoutubeVideo')
        await page.waitFor(2000)
        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 5) {
                    return
                }
                window.scrollBy(0,i * 1000); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },100); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })

        await page.waitFor("#placeholder-area")
        await page.waitFor(2000)

        const cmtBox1 = await page.$("#placeholder-area")
        await cmtBox1.click()

        await page.waitFor("#contenteditable-textarea")
        await page.waitFor(2000)

        msg = msg?msg:await getCommentMsg(page)
        console.log('pid: ',pid,' msg to comment: ', msg)
        if(!msg.length) return

        const cmtBox = await page.$("#contenteditable-textarea")
        await cmtBox.type(msg, {delay : 30})

        await page.waitFor("#submit-button.ytd-commentbox")
        await page.waitFor(2000)
        const cmtSubmit = await page.$("#submit-button.ytd-commentbox")
        await cmtSubmit.click()
        await page.waitFor(2000)

        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 5) {
                    return
                }
                window.scrollBy(0,i * -1000); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },100); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })

    }catch (e) {
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            console.log('CommentYoutubeVideo pid: ', pid, ' url: ', page.url(), ', err: ', e)
            await utils.errorScreenshot(page, pid+ '_comment')
        }
    }
}
async function gotoYoutubeVideoBySearch(pid, page, keyword, action, retry, videoId, filter) {
    try {
        if(!retry){
            await page.goto("https://www.youtube.com/")
        }
        else{
            console.log('info','pid: ',pid,'retry gotoYoutubeVideoBySearch')
            await page.goto("https://www.youtube.com/feed/trending")
        }
        await page.waitFor(5000)
        let dialogBtns = await page.$$('#dialog #dismiss-button paper-button#button')
        if(dialogBtns.length){
            await dialogBtns[0].click()
        }

        if(Math.random() < 0 && videoId){
            await page.goto('https://youtu.be/'+videoId)
            await page.waitFor(10000)
            await clickPlayIfPause(page)
            return
        }

        await page.waitFor("input#search")
        await page.waitFor(5000)

        const search = await page.$("input#search")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        if(filter == 1){
            // this hour
            await page.waitFor(2000)
            // await page.goto(page.url()+'&sp=EgQIAhAB')
            await page.goto(page.url()+'&sp=EgQIARAB')
        }
        if(filter == 2){
            // today
            await page.waitFor(2000)
            await page.goto(page.url()+'&sp=EgQIAhAB')
            // await page.goto(page.url()+'&sp=EgIQAQ%253D%253D')
        }
        else if(filter==3){
            // this week
            await page.waitFor(2000)
            await page.goto(page.url()+'&sp=EgQIAxAB')
        }
        else if(filter == 4){
            // this month
            await page.waitFor(2000)
            await page.goto(page.url()+'&sp=EgQIBBAB')
        }

        // await page.waitForNavigation({timeout : 10000})
        await page.waitForSelector('a.yt-simple-endpoint.style-scope',{timeout:90000});
        await page.waitFor(7000)

        if(videoId){
            let href = await page.$('a#thumbnail[href*="'+videoId+'"]')
            if(href){
                // await href.click()
                await page.evaluate(e => e.click(),href)
                await page.waitFor(10000)
                await clickPlayIfPause(page)
                return
            }
            else{
                console.log('info','pid: ',pid, 'gotoYoutubeVideoBySearch not found video: ', videoId, filter)
                let correction = await page.$$('#contents yt-search-query-correction > a.yt-search-query-correction')
                if(correction.length > 1){
                    // await correction[1].click()
                    await page.evaluate(e => e.click(),correction[1])
                    await page.waitFor(5000)
                    // let href = await page.$('a#thumbnail[href*="/watch?v='+videoId+'"]')
                    let href = await page.$('a#thumbnail[href*="'+videoId+'"]')
                    if(href){
                        // await href.click()
                        await page.evaluate(e => e.click(),href)
                        await page.waitFor(5000)
                        await clickPlayIfPause(page)
                        return
                    }
                }
            }

            if(!filter || filter < 5){
                await gotoYoutubeVideoBySearch(pid, page, keyword, action, retry, videoId, filter?filter+1:1)
                return
            }

            console.log('error', pid, 'gotoYoutubeVideoBySearch','videoId',videoId,'not found')
            // throw 'video not found'
            await page.goto('https://youtu.be/'+videoId)
            await page.waitFor(5000)
            await clickPlayIfPause(page)
            return
        }
        else{
            const hrefs = await page.$$('a.yt-simple-endpoint.style-scope.ytd-video-renderer');
            if(hrefs.length > 0) {
                let i = 0
                while(i<5){
                    let randomIndex = randomRanger(0, hrefs.length - 1)
                    try {
                        console.log('pid: ', pid, ' go to link index: ', randomIndex, '/', hrefs.length)
                        await hrefs[randomIndex].click()
                        break
                    }
                    catch (e) {
                        console.log('error', ' pid: ', pid, ' go to link index: ', randomIndex, e)
                        i += 1
                    }
                }

                await page.waitFor(3000)

                await clickPlayIfPause(page)
            }
        }

    }catch (e) {
        console.log('error','gotoYoutubeVideoBySearch pid: ', pid, ', err: ', e)
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            if(retry){
                console.log('error','gotoYoutubeVideoBySearch pid: ', pid, ', err: ', e)
                throw e
            }
            else{
                await gotoYoutubeVideoBySearch(pid, page, keyword, action, true, videoId, filter)
            }
        }
    }
}

async function gotoYoutubePlaylistBySearch(pid, page, keyword, action, retry, playlistId, filter) {
    try {
        if(!retry){
            await page.goto("https://www.youtube.com/")
        }
        else{
            console.log('info','pid: ',pid,'retry gotoYoutubePlaylistBySearch')
            await page.goto("https://www.youtube.com/feed/trending")
        }
        await page.waitFor(5000)
        let dialogBtns = await page.$$('#dialog #dismiss-button paper-button#button')
        if(dialogBtns.length){
            await dialogBtns[0].click()
        }

        await page.waitFor("input#search")
        await page.waitFor(5000)

        const search = await page.$("input#search")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        if(filter == 1){
            // this hour
            await page.waitFor(2000)
            await page.goto(page.url()+'&sp=EgIQAw%253D%253D')
        }

        // await page.waitForNavigation({timeout : 10000})
        await page.waitForSelector('a.yt-simple-endpoint.style-scope',{timeout:90000});
        await page.waitFor(7000)

        await page.evaluate(_ => {
            function pageScroll(i) {
                i++
                if (i > 3) {
                    return
                }
                window.scrollBy(0,i * 1000); // horizontal and vertical scroll increments
                setTimeout(function(){
                    pageScroll(i + 1)
                },1000); // scrolls every 100 milliseconds
            }
            pageScroll(0)
        })
        await page.waitFor(2000)

        if(playlistId){
            let href = await page.$('a#thumbnail[href*="'+playlistId+'"]')
            if(href){
                // await href.click()
                await page.evaluate(e => e.click(),href)
                await page.waitFor(10000)
                await clickPlayIfPause(page)
                return
            }
            else{
                console.log('info','pid: ',pid, 'gotoYoutubeVideoBySearch not found video: ', playlistId, filter)
                let correction = await page.$$('#contents yt-search-query-correction > a.yt-search-query-correction')
                if(correction.length > 1){
                    // await correction[1].click()
                    await page.evaluate(e => e.click(),correction[1])
                    await page.waitFor(5000)
                    // let href = await page.$('a#thumbnail[href*="/watch?v='+videoId+'"]')
                    let href = await page.$('a#thumbnail[href*="'+playlistId+'"]')
                    if(href){
                        // await href.click()
                        await page.evaluate(e => e.click(),href)
                        await page.waitFor(5000)
                        await clickPlayIfPause(page)
                        return
                    }
                }
            }

            if(!filter || filter < 1){
                retry = true
                await gotoYoutubePlaylistBySearch(pid, page, keyword, action, retry, playlistId, filter?filter+1:1)
                return
            }

            console.log('error', pid, 'gotoYoutubePlaylistBySearch','pllId',playlistId,'not found')
            throw 'playlist_not_found'
            return
        }
    }catch (e) {
        console.log('error','gotoYoutubePlaylistBySearch pid: ', pid, ', err: ', e)
        if(stopForOther(pid, action))
            throw "stop for other!"
        else{
            if(retry){
                console.log('error','gotoYoutubePlaylistBySearch pid: ', pid, ', err: ', e)
                throw e
            }
            else{
                await gotoYoutubePlaylistBySearch(pid, page, keyword, action, true, playlistId, filter)
            }
        }
    }
}

async function clickPlayIfPause(page) {
    let btnPlay = await page.$('path[d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"]')
    if (btnPlay) {
        console.log('info','clickPlayIfPause')
        let play = await page.$('button.ytp-play-button')
        if (play) {
            console.log('info','click play button')
            await page.evaluate(x => x.click(),play)
        }
    }
}

async function gotoYoutubePlaylistBySearchOrUrl(pid, page, keywordOrUrlList, isSearch, totalTime, action, keywords) {
    try {
        console.log('pid: ', pid, ' play list keyword/url: ', keywordOrUrlList)
        for(let i = 0 ; i < keywordOrUrlList.length; i++) {
            if(stopForOther(pid, action)) return
            try{
                let timePerEach = totalTime / keywordOrUrlList.length + randomRanger(10, 30) * 1000
                console.log('pid: ', pid, ' timePerEach: ', timePerEach)
                if(isSearch) {
                    await page.goto("https://www.youtube.com/results?sp=EgIQAw%253D%253D&search_query="  + decodeURIComponent(keywordOrUrlList[i]))
                    await page.waitFor(7000)

                    await page.waitFor('#video-title.style-scope.ytd-playlist-renderer');
                    await page.waitFor(3000)

                    const hrefs = await page.$$("#video-title.style-scope.ytd-playlist-renderer")
                    if(hrefs.length > 0) {
                        console.log('pid: ', pid, ' watch playlist for keyword: ', keywordOrUrlList[i])
                        await hrefs[randomRanger(0, hrefs.length - 1)].click()
                        // await page.waitFor(timePerEach)
                        await breakWait(pid, page, timePerEach, action, keywordOrUrlList[i])
                    }
                    else{
                        console.log('pid: ', pid, ' playlist link empty: ', keywordOrUrlList[i])
                    }
                }
                else if(keywordOrUrlList[i].url_type == 'video'){
                    let react
                    if(totalTime<100){
                        await gotoYoutubeVideoBySearch(pid, page, keywordOrUrlList[i].video, action, false, keywordOrUrlList[i].playlist_url,1)
                        await skipAds(page)
                        let videoTime = await page.$eval('.ytp-time-duration',e => e.textContent)
                        videoTime = videoTime.split(':')
                        videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
                        console.log('videoTime:',videoTime)
                        timePerEach = videoTime*1000*utils.randomRanger(0.6,0.8)
                        react = await getReact(keywordOrUrlList[i].video,timePerEach*0.9)
                        console.log('pid',pid,'video',keywordOrUrlList[i].playlist_url,'percent time:',timePerEach)
                    }
                    else{
                        await gotoYoutubeVideoBySearch(pid, page, keywordOrUrlList[i].video, action, false, keywordOrUrlList[i].playlist_url)
                    }
                    await breakWait(pid, page,timePerEach, action, keywordOrUrlList[i].playlist_url,0, react)
                }
                else if(keywordOrUrlList[i].url_type == 'channel' || keywordOrUrlList[i].url_type == 'user'){
                    await watchBeforePlaylist(pid, page, keywords[i])

                    let home = keywordOrUrlList[i].url_type == 'channel'?'https://www.youtube.com/channel/'+keywordOrUrlList[i].playlist_url:'https://www.youtube.com/user/'+keywordOrUrlList[i].playlist_url
                    await page.goto(home)
                    await page.waitFor(3000)
                    let videosTab = await page.$$('#tabsContent > paper-tab')
                    if(videosTab.length > 1){
                        await page.evaluate(x => x.click(),videosTab[1])
                        await page.waitFor(7000)
                    }
                    else{
                        let allVideoLink = await page.$('a.yt-simple-endpoint[href*="/videos?"]')
                        if(allVideoLink){
                            await page.evaluate(x => x.click(),allVideoLink)
                            await page.waitFor(7000)
                        }
                        else{
                            continue
                        }
                    }

                    if(keywordOrUrlList[i].video && keywordOrUrlList[i].video.length){
                        let video = await page.$('#items a#thumbnail[href*="'+keywordOrUrlList[i].video+'"]')
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
                        let videos = await page.$$('#contents.ytd-item-section-renderer #items a#thumbnail')
                        console.log('videos: ', videos.length)
                        let times = await page.$$eval('#contents.ytd-item-section-renderer #items a#thumbnail ytd-thumbnail-overlay-time-status-renderer', es => es.map(e => e.textContent))
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
                    let url = ''
                    if(keywordOrUrlList[i].playlist_url.length){
                        try{
                            await gotoYoutubePlaylistBySearch(pid, page, keywordOrUrlList[i].video, action, false, keywordOrUrlList[i].playlist_url)
                        }
                        catch (e) {
                            if(e=='playlist_not_found'){
                                url = 'https://www.youtube.com/playlist?list='+keywordOrUrlList[i].playlist_url
                                let currentIndex = keywordOrUrlList[i].current_index?keywordOrUrlList[i].current_index:0
                                console.log('pid: ', pid, ' url: ', url, ', index: ', currentIndex)
                                await page.goto(url)
                                await page.waitFor(5000)

                                await page.waitForSelector('a#thumbnail',{timeout: 5000})
                                let thumbnail = await page.$('a#thumbnail')
                                if(thumbnail){
                                    await thumbnail.click()
                                    await page.waitFor(7000)
                                }
                                else{
                                    throw "playlist thumbnail not found"
                                }
                            }
                        }

                        // await page.waitFor(timePerEach)
                        await breakWait(pid, page,timePerEach, action, keywordOrUrlList[i].playlist_url, keywordOrUrlList[i].video_time)
                    }
                    else{
                        throw "playlist url empty"
                    }
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

async function watchBeforePlaylist(pid, page, keyword, retry){
    if(!retry){
        await page.goto("https://www.youtube.com/")
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

        let search = await page.$("input#search")

        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));
        await page.waitFor(5000)
    }
    else{
        await page.goto(page.url()+'&sp=EgIYAQ%253D%253D')
        await page.waitFor(5000)
    }

    let allHrefs = await page.$$('#primary.ytd-two-column-search-results-renderer #contents a#thumbnail.yt-simple-endpoint');
    let hrefs = []
    let watchTimes = []
    for(let i =0; i < allHrefs.length; i++){
        let time = await allHrefs[i].$$eval('ytd-thumbnail-overlay-time-status-renderer', es => es.map(e => e.textContent));
        if(!time.length) continue
        time = time[0].split(':')
        if(time.length==2 && parseInt(time[0]) < 4 && parseInt(time[0]) >= 2){
            hrefs.push(allHrefs[i])
            watchTimes.push(parseInt(time[0])*60 + parseInt(time[1]))
        }
    }

    if(hrefs.length > 0) {
        let i = 0
        let watchtime = 3*60*1000
        while(i<5){
            let randomIndex = randomRanger(0, hrefs.length - 1)
            try {
                console.log('pid: ', pid, ' go to youtube search link index: ', randomIndex, '/', hrefs.length)
                await hrefs[randomIndex].click()
                watchtime = watchTimes[randomIndex]
                break
            }
            catch (e) {
                console.log('error', ' pid: ', pid, ' go to youtube search link index: ', randomIndex, e)
                i += 1
            }
        }

        // await page.waitFor(watchtime*1000*0.9)
        await page.waitFor(utils.randomRanger(15,20)*1000)
    }
    else{
        if(retry){
            throw "NO_SHORT_VIDEO"
        }
        else{
            console.log('info','pid:',pid,'playlist retry too find short video')
            await watchBeforePlaylist(pid, page, keyword, true)
        }
    }
}

async function getReact(keyword,totalTime){
    let like = false
    let dislike = false
    let reactTime
    let comment
    if(Math.random() < 0.15){
        if(Math.random() < 0.9){
            like = true
        }
        else{
            dislike = true
        }
    }
    if(Math.random() < 0.05){
        comment = await request_api.getComment(keyword)
        comment = comment.data
    }

    reactTime = like || dislike || comment ? utils.randomRanger(10000,totalTime) : 0

    let react =  {like: like, dislike: dislike, comment: comment, time: reactTime}
    console.log('react:', react)

    return react
}

async function skipAds(page){
    while (await page.$('.ytp-ad-skip-ad-slot')){
        let skipButton = await page.$('button.ytp-ad-skip-button')
        if(skipButton){
            await page.evaluate(e => e.click(),skipButton)
        }
        await page.waitFor(2000)
    }
}

module.exports.start = start
module.exports.gotoYoutubeVideoBySearch = gotoYoutubeVideoBySearch
module.exports.gotoYoutubePlaylistBySearchOrUrl = gotoYoutubePlaylistBySearchOrUrl
module.exports.CommentYoutubeVideo = CommentYoutubeVideo
module.exports.skipAds = skipAds