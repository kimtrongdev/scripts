const user_simulate = require('./user_simulate')
const request_api = require('./request_api')
const utils = require('./utils')

const SKIP_ADS_PERCENT = 1  //0.85
const LIKE_PERCENT = 0.01
const COMMENT_PERCENT = 0.0015
const VIEW_SUB_PERCENT = 0.002
const SEARCH_SKIP = 0   //0.7
const CHANNEL_VIDEO_WATCH = 3

async function userWatch(action){
    try{
        console.log('start watch')

        let url = action.page.url()

        if (url == 'https://www.youtube.com/' || url == 'https://www.youtube.com/feed/trending') {
            await processHomePage(action)
        } else if (url.indexOf('youtube.com/feed/history') > -1) {
            await deleteHistory(action)
        } else if (url.indexOf('https://www.youtube.com/results') > -1) {
            await processSearchPage(action)
        }
        else if(url.indexOf('https://www.youtube.com/watch') > -1){
            await processWatchPage(action)
        }
        else if(url.indexOf('https://www.youtube.com/playlist?list=') > -1){
            await processPlaylistPage(action)
        }
        else if(url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1){
            if(action.create_channel) {
                action.filter = undefined
                
                await utils.sleep(3000)
                await user_simulate.userClick(action,'#container a#logo')
            }
            else{
                await processWatchChannelPage(action)
            }
        }
        else if(url.indexOf('https://www.youtube.com/create_channel') == 0){
            await createChannel(action)
        }
        else if(url.indexOf('https://myaccount.google.com/') == 0){
            await action.page.goto('https://youtube.com//')
        }
        else if(url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/ServiceLogin') > -1){
            throw 'NOT_LOGIN'
        }
        else if(action.page.url().indexOf('youtube.com/oops') > -1 && await action.page.$('#alerts')){
            throw new Error('NOT_LOGIN_'+(await action.page.$eval('#alerts .yt-alert-message',e => e.textContent)))
        }
    }
    catch (e) {
        console.log('error',action.pid,e)
        if (e.toString() == 'NOT_LOGIN') action.retry = true
        if (e.toString() == 'FINISH') throw e
        if(action.retry || action.page.url().indexOf('https://www.youtube.com/watch') > -1){
            await request_api.updateActionStatus(action, action.id, 0, e.toString())
        }
        else if(e.toString() == 'VIDEO_NOT_FOUND'){
            action.retry = true
            action.filter = undefined
            action.video = action.video + ' ' + action.playlist_url
            await action.page.goto('https://youtube.com//')
            await utils.sleep(2000)
        }
        else if(e.toString() == 'SEARCH_SKIP'){
            action.retry = undefined
            action.filter = action.filter?action.filter-1:undefined
            
            await action.page.goto('https://youtube.com//')
            await utils.sleep(2000)
        }
        else{
            action.retry = true
            action.filter = undefined
            action.oldURL = ''
            await action.page.goto('https://youtube.com//')
            await utils.sleep(2000)
        }
    }
}

async function processHomePage(action){
    await action.page.waitForSelector('input#search',{delay:40000,visible:true})
    await checkLogin(action)
    // if(!(await deleteHistory(action))) return
    if(action.direct){
        if(action.url_type=='video'){
            await action.page.goto('https://www.youtube.com/watch?v='+action.playlist_url)
            return
        }
        else{
            // playlist
            await action.page.goto('https://www.youtube.com/playlist?list='+action.playlist_url)
            return
        }
    }
    if(action.preview == "home"){
        await user_simulate.userScroll(action,utils.randomRanger(5,15))
        await utils.sleep(utils.randomRanger(1000,5000))
        await user_simulate.userClickRandomVideo(action)
    }
    else if(action.preview == "search"){
        await user_simulate.userTypeEnter(action,'input#search',action.keyword)
    }
    else if(action.home){
        await processBrowserFeature(action)
    }
    else if(action.suggest_videos){
        await user_simulate.userTypeEnter(action,'input#search',action.suggest_videos)
    }
    else{
        await user_simulate.userTypeEnter(action,'input#search',action.video)
    }

    await utils.sleep(3000)
}

async function processPlaylistPage(action){
    await user_simulate.userClick(action,'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
}

async function processSearchPage(action){
    await action.page.waitForSelector('input#search',{delay:40000,visible:true})
    let url = action.page.url()
    if(action.preview == "search"){
        await user_simulate.userScroll(action,utils.randomRanger(20,50))
        await utils.sleep(utils.randomRanger(1000,5000))
        await user_simulate.userClickRandomVideo(action)
        return
    }

    let suggestWatchSearch = await processSearchSuggest(action)
    if(suggestWatchSearch) return

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

    let videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]'
    // scroll result
    // if(!await action.page.$(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
    let element
    // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
    // element = await action.page.$(videoSelector)
    // if(!element){
    // scroll to find element if not filtered or filter but not filter > 20 minute
    if(!action.filter || (url.indexOf('&sp=') > -1 && url.indexOf('EgIYAg') <= -1)){
        let randomScroll = utils.randomRanger(3,5)
        while(randomScroll > 0 && !element){
            await user_simulate.userScroll(action, 10)
            await utils.sleep(1000)
            randomScroll-=1 
            element = await action.page.$(videoSelector)
        }
    }

    if(element){
        if(Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
        if(action.suggest_search){
            let otherVideos = await action.page.$$('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail:not([href*="'+action.playlist_url+'"])')
            if(otherVideos.length > 0){
                let videoId = await action.page.evaluate(e => e.href,otherVideos[utils.randomRanger(0,otherVideos.length-1)])
                videoId = videoId.substr(videoId.indexOf('?v=')+3,11)
                videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="'+videoId+'"]'
            }
        }
        else if(action.channel || action.suggest || action.home){
            console.log('page_watch')
            let channelLink = await action.page.evaluateHandle(element => element.parentElement.nextElementSibling.querySelector('#channel-info > a'),element)
            action.channel_url = await action.page.evaluate(e => e.href,channelLink)
            action.filter = action.filter?action.filter-1:undefined
            
            await user_simulate.userClick(action, action.playlist_url + ' channel-info',channelLink)
        }
        else{
            await user_simulate.userClick(action, videoSelector)
        }
        await utils.sleep(3000)
    }
    else if(action.url_type=='video'){
        // if filtered, but not filter > 20 minutes reset search
        if(url.indexOf('&sp=') > -1 && url.indexOf('EgIYAg') <= -1){
            await user_simulate.userClick(action, '#search-icon-legacy')
            return
        }
        // click filter > 20 minute if: total_times > 20 minutes, not filtered and 
        else if(action.total_times >= 20*60*1000 && url.indexOf('&sp=') <= -1 && (!action.filter || action.filter < 4)){
            await user_simulate.userClick(action, '#filter-menu a > #button')
            await utils.sleep(2000)
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIYAg%253D%253D"]')
            await utils.sleep(1000)
            return
        }

        if(!action.query_correction && await action.page.$('a.yt-search-query-correction:nth-of-type(2)')){
            action.query_correction = true           
            await user_simulate.userClick(action,'a.yt-search-query-correction:nth-of-type(2)')
            return
        }

        let filter = action.filter?(action.filter+1):1
        if(filter>5){
            console.log('error','retry all')
            throw 'VIDEO_NOT_FOUND'
            // await request_api.updateActionStatus(action, action.id, 0,'VIDEO_NOT_FOUND')
            return
        }
        else{
            action.filter = filter            
        }

        await user_simulate.userClick(action, '#filter-menu a > #button')
        await utils.sleep(2000)

        if(filter == 1){
            // this hour
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAQ%253D%253D"],a#endpoint[href*="EgQIARgC"]')
        }
        if(filter == 2){
            // today
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAg%253D%253D"],a#endpoint[href*="EgQIAhgC"]')
        }
        else if(filter == 3){
            // this week
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAw%253D%253D"],a#endpoint[href*="EgQIAxgC"]')
        }
        else if(filter == 4){
            // this month
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIBA%253D%253D"],a#endpoint[href*="EgQIBBgC"]')
        }
        // else if(filter == 5){
        //     // live
        //     await user_simulate.userClick(action, 'a#endpoint[href*="EgJAAQ%253D%253D"],a#endpoint[href*="EgQIBRgC"]')
        // }
        else if(filter == 5){
            // this hour
            await user_simulate.userClick(action, 'a#endpoint[href*="EgJAAQ%253D%253D"]')
        }
        await utils.sleep(2000)
    }
    else if(action.url_type=='playlist'){
        let filter = action.filter?(action.filter+1):1
        if(filter>2){
            console.log('error','retry all')
            await request_api.updateActionStatus(action, action.id, 0,'playlist not found')
            return
        }
        else{
            action.filter = filter
            
        }

        await utils.sleep(1000)
        await user_simulate.userClick(action, '#filter-menu a > #button')
        await utils.sleep(2000)

        if(filter == 1){
            // playlist
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIQAw%253D%253D"]')
        }
        if(filter == 2){
            // today
            await user_simulate.userClick(action, 'a#endpoint[href*="CAISAhAD"]')
        }
    }
    else{
        throw 'unknown url_type'
    }
}

async function processWatchChannelPage(action){
    await action.page.waitForSelector('input#search',{delay:40000,visible:true})
    let url = action.page.url()
    if(url.indexOf('/videos') > -1){
        if(action.channel){
            // process videos page
            let i = 50
            while(i > 0 && !await action.page.$('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')){
                await user_simulate.userScroll(action,5)
                await utils.sleep(1000)
                i--
            }
            let video = await action.page.$('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')
            if(video){
                await user_simulate.userClick(action,'ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]',video)
                await utils.sleep(2000)
            }
            else{
                throw 'video in page not found'
            }
        }
        else{
            // watch other video for suggest or browser feature
            let watched_videos = action.other_videos.map(x => `:not([href*="${x}"])`).join("")
            let videos = [...await action.page.$$(`ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail:not([href*="${action.playlist_url}"])${watched_videos}`)]
            let video
            if(videos.length){
                video = videos[utils.randomRanger(0,videos.length-1)]
                action.other_videos.push(await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0],video))
                action.channel_videos = action.channel_videos.length?action.channel_videos:await Promise.all(videos.map(async x => await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0],x)))
                
            }
            else{
                video = await action.page.$('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')
            }
            await user_simulate.userClick(action,action.playlist_url,video)
            await utils.sleep(2000)
        }
    }
    else{
        // click videos tab
        let videoLink = await action.page.waitForSelector('#tabsContent > paper-tab:nth-of-type(2),#title-text > a.yt-simple-endpoint[href*="/videos?"]',{timeout:30000})
        await user_simulate.userClick(action,'channel video link',videoLink)
        // if(await action.page.$('#tabsContent > paper-tab:nth-of-type(2)')){
        //     await user_simulate.userClick(action,'#tabsContent > paper-tab:nth-of-type(2)')
        // }
        // else if(await action.page.$('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
        //     await user_simulate.userClick(action,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
        // }
        // else{
        //     throw 'no videos link'
        // }
    }
}

async function processSearchSuggest(action){
    let url = action.page.url()
    if(action.suggest_videos){
        // get public days
        try{
            action.public_days = action.public_days == undefined? (action.url_type == 'video' ? (await request_api.getPublicDays(action.playlist_url)).data : 7 ): action.public_days
            
        }
        catch (e) {
            console.log('getPublicDays err:',e)
        }

        // check public days
        if(action.public_days <= 1/24 && url.indexOf('253D%253D') < 0){
            // filter by hour
            await user_simulate.userClick(action, '#filter-menu a > #button')
            await utils.sleep(2000)
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        }
        else if(action.public_days <= 1/24 && Array.from(await action.page.$$('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail')).length < 20){
            // filter by hour by not enough results
            action.public_days = 1
            
            await user_simulate.userClick(action, '#search-icon-legacy')
        }
        else if(action.public_days <= 1 && url.indexOf('253D%253D') < 0){
            // filter by day
            await user_simulate.userClick(action, '#filter-menu a > #button')
            await utils.sleep(2000)
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAg%253D%253D"]')
        }
        else if(action.public_days <= 7 && url.indexOf('253D%253D') < 0){
            // filter by week
            await user_simulate.userClick(action, '#filter-menu a > #button')
            await utils.sleep(2000)
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIAw%253D%253D"]')
        }
        else if(action.public_days <= 30 && url.indexOf('253D%253D') < 0){
            // filter by month
            await user_simulate.userClick(action, '#filter-menu a > #button')
            await utils.sleep(2000)
            await user_simulate.userClick(action, 'a#endpoint[href*="EgIIBA%253D%253D"]')
        }
        else {
            let randomScroll
            if(action.url_type == 'video' && (action.public_days == undefined || action.public_days > 1)){
                randomScroll = utils.randomRanger(0,9)
            }
            else{
                randomScroll = utils.randomRanger(0,4)

            }
            if(randomScroll > 0){
                await user_simulate.userScroll(action, randomScroll*5)
            }
            await utils.sleep(utils.randomRanger(1000, 5000))
            await user_simulate.userClickRandomVideo(action)
        }
        return true
    }
}

async function processWatchPage(action){
    await action.page.waitForSelector('input#search',{delay:40000,visible:true})
    let watchVideo = await preWatchingVideo(action)
    if(watchVideo){
        let finishVideo = await watchingVideo(action)
        await afterWatchingVideo(action,finishVideo)
    }
}

async function preWatchingVideo(action){
    let url = action.page.url()
    // removeSuggest()
    if(url.indexOf(action.playlist_url) < 0) {
        await skipAds(action)
        await utils.sleep(utils.randomRanger(10000, 30000))
        if (action.preview) {
            action.preview = false
            action.lastRequest = Date.now()
            
            // await user_simulate.userTypeEnter(action, 'input#search', action.suggest_videos ? action.suggest_videos : action.video)
            await user_simulate.userTypeEnter(action, 'input#search', action.video)
            return
        }
        if(action.home){
            if(Math.random() < 0.5 ) {
                await user_simulate.userClick(action,'#container a#logo')
            }
            else{
                await action.page.goto('https://youtube.com//')
            }
            return
        }
        if(action.suggest){
            let scroll = utils.randomRanger(3,5)
            for(let i = 0; i < scroll; i++){
                await user_simulate.userScroll(action,10)
                let video = await action.page.$('ytd-watch-next-secondary-results-renderer .ytd-compact-video-renderer a#thumbnail[href*="' + action.playlist_url + '"]')
                if(video) {
                    await user_simulate.userClick(action, action.playlist_url, video)
                    return
                }
            }
            if(action.other_videos.length >= CHANNEL_VIDEO_WATCH){
                console.log('insert suggest')
                action.suggest = false
                // await user_simulate.userTypeEnter(action,'input#search',action.video)
                let randomNext = utils.randomRanger(1,4)
                let nextSelector = `ytd-watch-next-secondary-results-renderer > #items .ytd-watch-next-secondary-results-renderer:nth-child(${randomNext})`
                let next = await action.page.$(nextSelector)
                await action.page.evaluate(e => e.insertAdjacentHTML('beforebegin', '<ytd-compact-video-renderer class="style-scope ytd-watch-next-secondary-results-renderer" lockup="" thumbnail-width="168">  <div id="dismissable" class="style-scope ytd-compact-video-renderer"> <ytd-thumbnail use-hovered-property="" class="style-scope ytd-compact-video-renderer">  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="nofollow" href="/watch?v=abcabcabcde"> <yt-img-shadow class="style-scope ytd-thumbnail no-transition" loaded="" style="background-color: transparent;"><img id="img" class="style-scope yt-img-shadow" alt="" width="168" src="https://i.ytimg.com/vi/dpGYmYC3p0I/hqdefault.jpg?sqp=-oaymwEYCKgBEF5IVfKriqkDCwgBFQAAiEIYAXAB&amp;rs=AOn4CLDAbX4Gl4f75wtg594Ix2Hla7Epxw"></yt-img-shadow>  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" overlay-style="DEFAULT"><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="1 hour, 14 minutes"> 1:14:08 </span></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail">  <span class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span> </ytd-thumbnail-overlay-now-playing-renderer></div> <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div> <div id="hover-overlays" class="style-scope ytd-thumbnail"></div> </a> </ytd-thumbnail> <div class="details style-scope ytd-compact-video-renderer"> <div class="metadata style-scope ytd-compact-video-renderer"> <a class="yt-simple-endpoint style-scope ytd-compact-video-renderer" rel="nofollow" href="/watch?v=abcabcabcde"> <h3 class="style-scope ytd-compact-video-renderer"> <ytd-badge-supported-renderer class="style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> <span id="video-title" class="style-scope ytd-compact-video-renderer" aria-label="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava by Dave and Ava - Nursery Rhymes and Baby Songs 3 years ago 1 hour, 14 minutes 22,960,714 views" title="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava"> ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava </span> </h3> <div class="secondary-metadata style-scope ytd-compact-video-renderer"> <ytd-video-meta-block class="compact style-scope ytd-compact-video-renderer" no-endpoints="">    <div id="metadata" class="style-scope ytd-video-meta-block"> <div id="byline-container" class="style-scope ytd-video-meta-block"> <ytd-channel-name id="channel-name" class="style-scope ytd-video-meta-block">  <div id="container" class="style-scope ytd-channel-name"> <div id="text-container" class="style-scope ytd-channel-name"> <yt-formatted-string id="text" title="" class="style-scope ytd-channel-name" ellipsis-truncate="">Dave and Ava - Nursery Rhymes and Baby Songs</yt-formatted-string> </div> <paper-tooltip offset="10" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Dave and Ava - Nursery Rhymes and Baby Songs </div> </paper-tooltip> </div> <ytd-badge-supported-renderer class="style-scope ytd-channel-name">   <div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer"> <yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10 S17.52,2,12,2z M9.92,17.93l-4.95-4.95l2.05-2.05l2.9,2.9l7.35-7.35l2.05,2.05L9.92,17.93z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon> <span class="style-scope ytd-badge-supported-renderer"></span> <paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Verified </div> </paper-tooltip></div> <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat> </ytd-badge-supported-renderer> </ytd-channel-name> <div id="separator" class="style-scope ytd-video-meta-block">•</div> </div> <div id="metadata-line" class="style-scope ytd-video-meta-block">  <span class="style-scope ytd-video-meta-block">22M views</span>  <span class="style-scope ytd-video-meta-block">3 years ago</span> <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div> </div> <div id="additional-metadata-line" class="style-scope ytd-video-meta-block"> <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div>  </ytd-video-meta-block> <ytd-badge-supported-renderer class="badges style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> </div> </a> <div id="buttons" class="style-scope ytd-compact-video-renderer"></div> </div> <div id="menu" class="style-scope ytd-compact-video-renderer"><ytd-menu-renderer class="style-scope ytd-compact-video-renderer">  <div id="top-level-buttons" class="style-scope ytd-menu-renderer"></div> <yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" hidden="">   <button id="button" class="style-scope yt-icon-button">  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon>  </button>  </yt-icon-button> </ytd-menu-renderer></div> <div id="queue-button" class="style-scope ytd-compact-video-renderer"></div> </div> </div> <div id="dismissed" class="style-scope ytd-compact-video-renderer"></div> </ytd-compact-video-renderer>'),next)
                let watchHref = action.url_type == 'video'?"/watch?v=" + action.playlist_url:"/watch?v=" + (await getFirstVideo(action.playlist_url)).data + "&list=" + action.playlist_url
                await action.page.evaluate((e, watchHref) => e.previousElementSibling.querySelector('a').href = watchHref, next, watchHref)
                await user_simulate.userClick(action, `${nextSelector} a#thumbnail`)
                return

            }
            else{
                // get other video of channel, click if not empty
                let otherVideo = await action.page.$(`${action.channel_videos.map(x => `ytd-watch-next-secondary-results-renderer .ytd-compact-video-renderer a#thumbnail[href*="${x}"]${action.other_videos.map(v => `:not([href*="${v}"])`).join("")}`).join(",")}`)
                if(otherVideo){
                    let otherVideoHref = await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0],otherVideo)
                    action.other_videos.push(otherVideoHref)                 
                    await user_simulate.userClick(action,otherVideoHref,otherVideo)
                    return
                }
                else{
                    // click channel page
                    let channel = await action.page.$('#top-row a.ytd-video-owner-renderer')
                    if(channel){
                        await user_simulate.userClick(action, 'channel link', channel)
                    }
                    else{
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
    

    if(action.url_type == 'playlist') {
        action.playlist_index = action.playlist_index == undefined ? (action.total_times + utils.randomRanger(0, 1)) : action.playlist_index
        console.log('playlist_index:', action.playlist_index)
        action.playlist_index = action.playlist_index - 1
        
    }

    if(action.total_times < 1000){
        await skipAds(action)
        // get video time
        let videoTime = await action.page.$('.ytp-time-duration').textContent.split(':')
        videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
        if(action.url_type=='playlist' && videoTime > 3600){
            videoTime = 3600
        }
        console.log('videoTime:',videoTime)
        if(Math.random() < 0.2){
            action.watch_time = videoTime*1000*utils.randomRanger(2,7)/10
        }
        else{
            action.watch_time = videoTime*1000*utils.randomRanger(7,9)/10
        }
        // if(Math.random() < 0.2){
        //     action.watch_time = videoTime*1000*utils.randomRanger(0,25)/100
        // }
        // else if(Math.random() < 0.3){
        //     action.watch_time = videoTime*1000*utils.randomRanger(25,50)/100
        // }
        // else if(Math.random() < 0.4){
        //     action.watch_time = videoTime*1000*utils.randomRanger(50,75)/100
        // }
        // else{
        //     action.watch_time = videoTime*1000*utils.randomRanger(75,100)/100
        // }
        console.log('pid',action.pid,'video',action.playlist_url,'percent time:',action.watch_time)
    }
    else{
        action.watch_time = Math.random() < 0.2 ? (action.total_times*utils.randomRanger(2,7)/10) : (action.total_times*utils.randomRanger(7,9)/10)
    }

    if(!action.react){
        let commentKeyword = getCommentKeyword(action.playlist_url,action.video)
        action.react = await getReact(action,commentKeyword,action.watch_time*0.9)
    }
    

    return true
}

async function watchingVideo(action){
    let url = action.page.url()
    let interval = 5000
    for(let i = 0; i < action.watch_time;){
        let currentUrl = action.page.url()
        // check current url
        if(currentUrl.indexOf(action.playlist_url) < 0 || currentUrl != url) {
            console.log('not play video',action.playlist_url)
            return
        }

        if(i == 0 && url.indexOf('&t=') > -1){
            await user_simulate.sendKey(action,"0")
        }

        await skipAds(action,true)

        await clickPlayIfPause(action)

        // like or comment
        let react = action.react
        if(react && react.like_time > i && react.like_time <= i + interval){
            await utils.sleep(react.like_time - i)
            await LikeOrDisLikeYoutubeVideo(action.pid, react.like)
        }
        if(react && react.comment_time > i && react.comment_time <= i + interval){
            await utils.sleep(react.comment_time - i)
            await CommentYoutubeVideo(action.pid, react.comment)
        }
        if(react && react.sub_time > i && react.sub_time <= i + interval){
            await utils.sleep(react.sub_time - i)
            await user_simulate.userClick(action,'#top-row #subscribe-button paper-button.ytd-subscribe-button-renderer:not([subscribed])')
        }

        let sleepTime = action.watch_time - i > interval ? interval: action.watch_time - i
        await utils.sleep(sleepTime)

        // report time
        if(i%300000==0) {
            console.log('report time')
            let continueWatch = await request_api.updateWatchingTime(action.pid, 1, 0, i==0?20000:300000, {url: action.playlist_url,keyword: action.video})
            console.log('updateWatchingTime',continueWatch)
            let finish = !continueWatch.err && !continueWatch.continue
            if(finish){
                console.log('info','pid: ',action.pid,' finish watch: ',action.playlist_url)
                action.playlist_index = 0
                
                return
            }
            if(Math.random() < 0.3){
                let randomScroll = utils.randomRanger(3,7)
                await user_simulate.userScroll(action, randomScroll)
                await utils.sleep(1000)
                await user_simulate.userScroll(action, -randomScroll)
            }
        }

        await request_api.updateActionStatus(action, action.id, 1, action.playlist_url+'_'+i, false)
        action.lastRequest = Date.now()
        

        i += sleepTime
    }
    return true
}

async function afterWatchingVideo(action,finishVideo){
    let url = action.page.url()
    if(action.url_type == 'playlist'){
        if(action.playlist_index < 1 || url.indexOf(action.playlist_url) < 0){
            await request_api.updateActionStatus(action, action.id, 0,'end playlist')
            return
        }
        else{
            if(finishVideo){
                // nex video
                await user_simulate.nextVideo(action)
            }
            return
        }
    }

    if(action.finish) return

    action.finish = true
    


    if(action.after_video && !action.remove_suggest){
        action.after_video = false
        action.after = true
        
        await user_simulate.userClickRandomVideo(action)
        return
    }
    else{
        // report host app
        await request_api.updateActionStatus(action, action.id, 0)
        return
    }
}

async function processBrowserFeature(action){
    if(action.home){
        await utils.sleep(3000)
        let scroll = utils.randomRanger(3,7)
        for(let i = 0; i < scroll; i++){
            await user_simulate.userScroll(action, 10)
            let video = await action.page.$('ytd-browse[page-subtype="home"] a#thumbnail[href*="'+action.playlist_url+'"]')
            if(video){
                await user_simulate.userClick(action,action.playlist_url,video)
                return
            }
        }
        if(action.other_videos.length >= CHANNEL_VIDEO_WATCH){
            action.home = false
            
            await user_simulate.userTypeEnter(action,'input#search',action.video)
        }
        else{
            if(action.channel_videos.length){
                let otherVideo = await action.page.$(`${action.channel_videos.map(x => `ytd-browse[page-subtype="home"] a#thumbnail[href*="${x}"]${action.other_videos.map(v => `:not([href*="${v}"])`).join("")}`).join(",")}`)
                if(otherVideo){
                    let otherVideoHref = await action.page.evaluate(e => e.href.split('v=')[1].split('&')[0],otherVideo)
                    action.other_videos.push(otherVideoHref)
                    await user_simulate.userClick(action,otherVideoHref,otherVideo)
                    return
                }
            }
            
            // find channel link
            if(action.channel_url){
                let channel = await action.page.$(`ytd-browse[page-subtype="home"] a#avatar-link[href="${action.channel_url}"]`)
                if(channel){
                    await user_simulate.userClick(action,action.channel_url,channel)
                }
                else{
                    await action.page.goto( action.channel_url)
                }
            }
            else{
                await user_simulate.userTypeEnter(action,'input#search',action.video) 
            }
        }
    }
}

async function skipAds(action,watchingCheck){
    if(!watchingCheck) await utils.sleep(2000)
    while (await action.page.$('.ytp-ad-skip-ad-slot')) {
        console.log('skip ads')
        let adTimeCurrent = getTimeFromText(await action.page.$('.ytp-time-display .ytp-time-current').textContent)
        let adTimeDuration = getTimeFromText(await action.page.$('.ytp-time-display .ytp-time-duration').textContent)

        let adWatchTime
        if(Math.random() < SKIP_ADS_PERCENT){
            // skip ad
            if(adTimeDuration <= 30){
                adWatchTime = getWatchAdTime(adTimeCurrent,1,10)
            }
            else{
                adWatchTime = getWatchAdTime(adTimeCurrent,1,28)
            }
        }
        else{
            // watch ad
            if(adTimeDuration <= 30){
                adWatchTime = getWatchAdTime(adTimeCurrent,12,adTimeDuration)
            }
            else{
                if(Math.random() < 0.1){
                    adWatchTime = getWatchAdTime(adTimeCurrent,0.9*adTimeDuration,adTimeDuration)
                }
                else if(Math.random() < 0.4){
                    adWatchTime = getWatchAdTime(adTimeCurrent,Math.max(30,adTimeDuration*0.5),adTimeDuration*0.9)
                }
                else{
                    adWatchTime = getWatchAdTime(adTimeCurrent,30,Math.max(30,adTimeDuration*0.5))
                }
            }
        }
        await utils.sleep(adWatchTime*1000)
        while(!await action.page.$('button.ytp-ad-skip-button') || !await action.page.$('button.ytp-ad-skip-button').getBoundingClientRect().x){
            await utils.sleep(1000)
        }
        await user_simulate.userClick(action, 'button.ytp-ad-skip-button')
        await utils.sleep(2000)
    }
}

async function getReact(action,keyword,totalTime){
    console.log('getReact',keyword,totalTime)
    let like = false
    let dislike = false
    let sub = false
    let comment
    if(Math.random() < LIKE_PERCENT){
        if(Math.random() < 0.95){
            like = true
        }
        else{
            dislike = true
        }
    }

    let commentPercent = await action.page.$('#chatframe')?COMMENT_PERCENT*10:COMMENT_PERCENT

    if(Math.random() < commentPercent){
        comment = await getComment(keyword)
        console.log('GETCOMMENT',comment)
        comment = comment.data
    }

    if(Math.random() < VIEW_SUB_PERCENT){
        sub = true
    }

    let likeTime = like || dislike ? utils.randomRanger(10000,totalTime) : 0
    let commentTime = comment ? utils.randomRanger(10000,totalTime) : 0
    let subTime = sub ? utils.randomRanger(10000,totalTime) : 0

    let react =  {like: like, dislike: dislike, comment: comment, like_time: likeTime, comment_time: commentTime,sub: sub, sub_time: subTime}
    console.log('react:', react)

    return react
}

async function LikeOrDisLikeYoutubeVideo(pid, isLike) {
    try {
        const likeBtn = Array.from(await action.page.$$("#top-level-buttons yt-icon-button#button.style-scope.ytd-toggle-button-renderer.style-text"))

        let index
        if(isLike) {
            index = 1
        }else {
            index = 2
        }
        if(likeBtn.length > 1) {
            await userClick(pid,`#top-level-buttons ytd-toggle-button-renderer:nth-of-type(${index}) yt-icon-button#button.style-scope.ytd-toggle-button-renderer.style-text`)
            console.log(index==0?'like':'dislike'+ 'OK')
        }else {
            console.log("like & dislike button not available")
        }

    }catch (e) {
        console.log("LikeOrDisLikeYoutubeVideo pid: ", pid, " err: ", e)
    }
}

async function CommentYoutubeVideo(pid, msg) {       // search video or view homepage
    try {
        console.log('pid: ', pid, ', CommentYoutubeVideo',msg)
        if(!msg) return
        await utils.sleep(2000)

        let chatFrame = await action.page.$('#chatframe')
        if(chatFrame){
            if(!(await chatFrame.$('yt-live-chat-message-renderer a'))){
                await userTypeEnter(pid,'yt-live-chat-text-input-field-renderer#input',msg,'',chatFrame)
                return
            }
            else{
                // create channel
                let action = (await getActionData()).action
                action.create_channel = true
                
                await userClick(pid,'create channel',await chatFrame.$('yt-live-chat-message-renderer a'),chatFrame)
                return
            }
        }

        await user_simulate.userScroll(pid,70)

        if(!await action.page.$('#placeholder-area')){
            console.log('error','NO COMMENT SECTION')
            return
        }

        await userClick(pid, "#placeholder-area")
        await utils.sleep(1000)

        await userType(pid,"#contenteditable-textarea",msg)
        await utils.sleep(1000)

        await userClick(pid, "#submit-button.ytd-commentbox")
        await utils.sleep(2000)

        await user_simulate.userScroll(pid,-70)

    }catch (e) {
        console.log('error','CommentYoutubeVideo',pid)
    }
}

async function clickPlayIfPause(action) {
    console.log('clickPlayIfPause')
    let btnPlay = await action.page.$('path[d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"]')
    if (btnPlay) {
        console.log('info','clickPlayIfPause')
        await userClick(action,'button.ytp-play-button')
    }
}

function getCommentKeyword(videoId, keyword){
    return keyword.split(' ').filter(x => x != videoId).slice(0,utils.randomRanger(3,5)).join(' ')
}

function getTimeFromText(str){
    try{
        let time = str.split(':')
        return time[0]*60 + time[1]*1
    }
    catch (e) {
        return 0
    }
}

function getWatchAdTime(currentTime,minTime,maxTime){
    minTime = Math.round(minTime)
    maxTime = Math.round(maxTime)
    let adWatchTime = utils.randomRanger(minTime,maxTime) - currentTime
    return adWatchTime>0?adWatchTime:0
}

async function removeSuggest(){
    try{
        if(action.remove_suggest){
            let element = await action.page.$('#columns #secondary #related')
            if(element){
                element.parentNode.removeChild(element)
            }
        }
    }
    catch (e) {
        console.log('error','removeSuggest',e)
    }
}

async function deleteHistory(action){
    try{
        if(!action.delete_history){
            let url = action.page.url()
            if(url.indexOf('youtube.com/feed/history') > -1){
                await user_simulate.userClick(action,'#contents > ytd-button-renderer:nth-of-type(1) a paper-button')
                await utils.sleep(2000)
                let confirm = await action.page.$('yt-confirm-dialog-renderer #confirm-button')
                if(confirm){
                    await user_simulate.userClick(action,'yt-confirm-dialog-renderer #confirm-button',confirm)
                }
                if(url.indexOf('youtube.com/feed/history/search_history') > -1){
                    action.delete_history = true
                    
                    await user_simulate.userClick(action,'#container a#logo')
                }
                else{
                    await action.page.goto('https://youtube.com/feed/history/search_history')
                }
            }
            else{
                await action.page.goto('https://youtube.com/feed/history')
            }
        }
        else{
            return true
        }
    }
    catch (e) {
        console.log('deleteHistory',e)
    }
}

async function checkLogin(action){
    if(!(await action.page.$('#avatar-btn'))){
        // recheck
        if(!action.check_login){
            action.check_login = true
            let signinBtn = await action.page.$('ytd-button-renderer > a[href^="https://accounts.google.com/ServiceLogin"]')
            if(signinBtn){
                await action.page.goto('https://https://accounts.google.com')
            }
            // await action.page.goto('https://https://www.youtube.com/')
        }
        else{
            return
        }
    }
}

module.exports.userWatch = userWatch