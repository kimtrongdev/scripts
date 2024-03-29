const SKIP_ADS_PERCENT = 0.55   //0.7  //0.85
const LIKE_PERCENT = 0.01
const COMMENT_PERCENT = 0.0015
const VIEW_SUB_PERCENT = 0  //0.002
const SEARCH_SKIP = 0
const CHANNEL_VIDEO_WATCH = 0

async function userWatch(action){
    try{
        console.log('start watch')

        let url = window.location.toString()

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
                await setActionData(action)
                await sleep(3000)
                await userClick(action.pid,'#container a#logo')
            }
            else{
                await processWatchChannelPage(action)
            }
        }
        else if(url.indexOf('https://www.youtube.com/create_channel') == 0){
            await createChannel(action)
        }
        else if(url.indexOf('https://myaccount.google.com/') == 0){
            await goToLocation(action.pid,'youtube.com//')
        }
        else if(url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/ServiceLogin') > -1){
            throw 'NOT_LOGIN'
        }
        else if(window.location.toString().indexOf('youtube.com/oops') > -1 && document.querySelector('#alerts')){
            throw new Error('NOT_LOGIN_'+document.querySelector('#alerts .yt-alert-message').textContent)
        }
    }
    catch (e) {
        console.log('error',action.pid,e)
        if(e.toString()=='NOT_LOGIN') action.retry = true
        if(action.retry || window.location.toString().indexOf('https://www.youtube.com/watch') > -1){
            await updateActionStatus(action.pid, action.id, 0, e.toString())
        }
        else if(e.toString() == 'SEARCH_SKIP'){
            action.retry = undefined
            action.filter = action.filter?action.filter-1:undefined
            await setActionData(action)
            await goToLocation(action.pid,'youtube.com//')
            await sleep(2000)
        }
        else if(e.toString()=='VIDEO_NOT_FOUND'){
            action.searchList = action.searchList.filter(x => x.trim() != action.video)
            if(action.searchList.length == 0){
                await updateActionStatus(action.pid, action.id, 0, e.toString())
                return
            }
            action.retry = false
            action.video = action.searchList[randomRanger(0,action.searchList.length-1)].trim()
            action.filter = undefined
            await setActionData(action)
            await goToLocation(action.pid,'youtube.com//')
            await sleep(2000)
        }
        else{
            action.retry = true
            action.filter = undefined
            await setActionData(action)
            await goToLocation(action.pid,'youtube.com//')
            await sleep(2000)
        }
    }
}

async function processHomePage(action){
    await checkLogin(action)
    // if(!(await deleteHistory(action))) return
    if(action.direct){
        if(action.url_type=='video'){
            await goToLocation(action.pid,'https://www.youtube.com/watch?v='+action.playlist_url)
            return
        }
        else{
            // playlist
            await goToLocation(action.pid,'https://www.youtube.com/playlist?list='+action.playlist_url)
            return
        }
    }
    if(action.preview == "home"){
        await userScroll(action.pid,randomRanger(5,15))
        await sleep(randomRanger(1000,5000))
        await userClickRandomVideo(action.pid)
    }
    else if(action.preview == "search"){
        await userTypeEnter(action.pid,'input#search',action.keyword)
    }
    else if(action.home){
        await processBrowserFeature(action)
    }
    else if(action.suggest_videos){
        await userTypeEnter(action.pid,'input#search',action.suggest_videos)
    }
    else{
        await userTypeEnter(action.pid,'input#search',action.video)
    }

    await sleep(3000)
}

async function processPlaylistPage(action){
    await userClick(action.pid,'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
}

async function processSearchPage(action){
    let url = window.location.toString()

    if(action.preview == "search"){
        await userScroll(action.pid,randomRanger(20,50))
        await sleep(randomRanger(1000,5000))
        await userClickRandomVideo(action.pid)
        return
    }

    let suggestWatchSearch = await processSearchSuggest(action)
    if(suggestWatchSearch) return

    // filter by hour if first search
    // if(action.url_type=='video' && !action.filter){
    //     let filter = action.filter?(action.filter+1):1
    //     action.filter = filter
    //     await setActionData(action)

    //     await userClick(action.pid, '#filter-menu a > #button')
    //     await sleep(2000)
    //     // this hour
    //     await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
    //     return
    // }

    let videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]'
    // scroll result
    // if(!document.querySelector(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
    let element
    // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
    // element = document.querySelector(videoSelector)
    // if(!element){
    if(!action.filter || url.indexOf('253D%253D') > -1){
        let randomScroll = randomRanger(3,5)
        while(randomScroll > 0 && !element){
            await userScroll(action.pid, 10)
            await sleep(1000)
            randomScroll-=1
            element = document.querySelector(videoSelector)
        }
    }

    if(element){
        if(Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
        if(action.suggest_search){
            let otherVideos = document.querySelectorAll('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail:not([href*="'+action.playlist_url+'"])')
            if(otherVideos.length > 0){
                let videoId = otherVideos[randomRanger(0,otherVideos.length-1)].href
                videoId = videoId.substr(videoId.indexOf('?v=')+3,11)
                videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="'+videoId+'"]'
            }
        }
        else if(action.page || action.suggest || action.home){
            console.log('page_watch')
            let channelLink = element.parentElement.nextElementSibling.querySelector('#channel-info > a')
            action.channel_url = channelLink.href
            action.filter = action.filter?action.filter-1:undefined
            await setActionData(action)
            await userClick(action.pid, action.playlist_url + ' channel-info',channelLink)
        }
        else{
            await userClick(action.pid, videoSelector)
        }
        await sleep(3000)
    }
    else if(action.url_type=='video'){
        // if filtered, go to home page
        if(url.indexOf('253D%253D') > -1){
            await userClick(action.pid, '#search-icon-legacy')
            return
        }

        if(!action.query_correction && document.querySelector('a.yt-search-query-correction:nth-of-type(2)')){
            action.query_correction = true
            await setActionData(action)
            await userClick(action.pid,'a.yt-search-query-correction:nth-of-type(2)')
            return
        }

        let filter = action.filter?(action.filter+1):1
        if(filter>5){
            console.log('error','retry all')
            await updateActionStatus(action.pid, action.id, 0,'VIDEO_NOT_FOUND')
            return
        }
        else{
            action.filter = filter
            await setActionData(action)
        }

        // await userScrollTo(action.pid,'#filter-menu a > #button')
        // await sleep(1000)
        await userClick(action.pid, '#filter-menu a > #button')
        await sleep(2000)

        if(filter == 1){
            // this hour
            await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        }
        if(filter == 2){
            // today
            await userClick(action.pid, 'a#endpoint[href*="EgIIAg%253D%253D"]')
        }
        else if(filter==3){
            // this week
            await userClick(action.pid, 'a#endpoint[href*="EgIIAw%253D%253D"]')
        }
        else if(filter == 4){
            // this month
            await userClick(action.pid, 'a#endpoint[href*="EgIIBA%253D%253D"]')
        }
        else if(filter == 5){
            // live
            await userClick(action.pid, 'a#endpoint[href*="EgJAAQ%253D%253D"]')
        }
        await sleep(2000)
    }
    else if(action.url_type=='playlist'){
        let filter = action.filter?(action.filter+1):1
        if(filter>2){
            console.log('error','retry all')
            await updateActionStatus(action.pid, action.id, 0,'playlist not found')
            return
        }
        else{
            action.filter = filter
            await setActionData(action)
        }

        await userScrollTo(action.pid,'#filter-menu a > #button')
        await sleep(1000)
        await userClick(action.pid, '#filter-menu a > #button')
        await sleep(2000)

        if(filter == 1){
            // playlist
            await userClick(action.pid, 'a#endpoint[href*="EgIQAw%253D%253D"]')
        }
        if(filter == 2){
            // today
            await userClick(action.pid, 'a#endpoint[href*="CAISAhAD"]')
        }
    }
    else{
        throw 'unknown url_type'
    }
}

async function processWatchChannelPage(action){
    let url = window.location.toString()
    if(url.indexOf('/videos') > -1){
        if(action.page){
            // process videos page
            let i = 50
            while(i > 0 && !document.querySelector('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')){
                await userScroll(action.pid,5)
                await sleep(1000)
                i--
            }
            let video = document.querySelector('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')
            if(video){
                await userClick(action.pid,'ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]',video)
                await sleep(2000)
            }
            else{
                throw 'video in page not found'
            }
        }
        else{
            // watch other video for suggest or browser feature
            let watched_videos = action.other_videos.map(x => `:not([href*="${x}"])`).join("")
            let videos = [...document.querySelectorAll(`ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail:not([href*="${action.playlist_url}"])${watched_videos}`)]
            let video
            if(videos.length){
                video = videos[randomRanger(0,videos.length-1)]
                action.other_videos.push(video.href.split('v=')[1].split('&')[0])
                action.channel_videos = action.channel_videos.length?action.channel_videos:videos.map(x => x.href.split('v=')[1].split('&')[0])
                await setActionData(action)
            }
            else{
                video = document.querySelector('ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail[href*="'+action.playlist_url+'"]')
            }
            await userClick(action.pid,video.href,video)
            await sleep(2000)
        }
    }
    else{
        // click videos tab
        if(document.querySelector('#tabsContent > paper-tab:nth-of-type(2)')){
            await userClick(action.pid,'#tabsContent > paper-tab:nth-of-type(2)')
        }
        else if(document.querySelector('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
            await userClick(action.pid,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
        }
        else{
            throw 'no videos link'
        }
    }
}

async function processSearchSuggest(action){
    let url = window.location.toString()
    if(action.suggest_videos){
        // get public days
        try{
            action.public_days = action.public_days == undefined? (action.url_type == 'video' ? (await getPublicDays(action.playlist_url)).data : 7 ): action.public_days
            await setActionData(action)
        }
        catch (e) {
            console.log('getPublicDays err:',e)
        }

        // check public days
        if(action.public_days <= 1/24 && url.indexOf('253D%253D') < 0){
            // filter by hour
            await userClick(action.pid, '#filter-menu a > #button')
            await sleep(2000)
            await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        }
        else if(action.public_days <= 1/24 && Array.from(document.querySelectorAll('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail')).length < 20){
            // filter by hour by not enough results
            action.public_days = 1
            await setActionData(action)
            await userClick(action.pid, '#search-icon-legacy')
        }
        else if(action.public_days <= 1 && url.indexOf('253D%253D') < 0){
            // filter by day
            await userClick(action.pid, '#filter-menu a > #button')
            await sleep(2000)
            await userClick(action.pid, 'a#endpoint[href*="EgIIAg%253D%253D"]')
        }
        else if(action.public_days <= 7 && url.indexOf('253D%253D') < 0){
            // filter by week
            await userClick(action.pid, '#filter-menu a > #button')
            await sleep(2000)
            await userClick(action.pid, 'a#endpoint[href*="EgIIAw%253D%253D"]')
        }
        else if(action.public_days <= 30 && url.indexOf('253D%253D') < 0){
            // filter by month
            await userClick(action.pid, '#filter-menu a > #button')
            await sleep(2000)
            await userClick(action.pid, 'a#endpoint[href*="EgIIBA%253D%253D"]')
        }
        else {
            let randomScroll
            if(action.url_type == 'video' && (action.public_days == undefined || action.public_days > 1)){
                randomScroll = randomRanger(0,9)
            }
            else{
                randomScroll = randomRanger(0,4)

            }
            if(randomScroll > 0){
                await userScroll(action.pid, randomScroll*5)
            }
            await sleep(randomRanger(1000, 5000))
            await userClickRandomVideo(action.pid)
        }
        return true
    }
}

async function processWatchPage(action){
    let watchVideo = await preWatchingVideo(action)
    if(watchVideo){
        let finishVideo = await watchingVideo(action)
        await afterWatchingVideo(action,finishVideo)
    }
}

async function preWatchingVideo(action){
    let url = window.location.toString()
    // removeSuggest()
    if(url.indexOf(action.playlist_url) < 0) {
        await skipAds()
        await userScroll(action.pid,0)
        let randomSleep = randomRanger(18,36)
        for(let i = 0; i < randomSleep; i++){
            await sleep(10000)
            await userScroll(action.pid,0)
        }
        // await sleep(180000)
        // await userScroll(action.pid,0)
        // await sleep(randomRanger(60000, 180000))
        if (action.preview) {
            action.preview = false
            action.lastRequest = Date.now()
            await setActionData(action)
            // await userTypeEnter(action.pid, 'input#search', action.suggest_videos ? action.suggest_videos : action.video)
            if(action.home || action.direct){
                await userClick(action.pid,'#container a#logo')
            }
            else{
                await userTypeEnter(action.pid, 'input#search', action.video)
            }
            return
        }
        if(action.home){
            if(Math.random() < 0.5 ) {
                await userClick(action.pid,'#container a#logo')
            }
            else{
                await goToLocation(action.pid,'youtube.com//')
            }
            return
        }
        if(action.suggest){
            let scroll = randomRanger(3,5)
            for(let i = 0; i < scroll; i++){
                await userScroll(action.pid,10)
                let video = document.querySelector('ytd-watch-next-secondary-results-renderer .ytd-compact-video-renderer a#thumbnail[href*="' + action.playlist_url + '"]')
                if(video) {
                    await userClick(action.pid, action.playlist_url, video)
                    return
                }
            }
            if(action.other_videos.length >= CHANNEL_VIDEO_WATCH){
                action.suggest = false
                await setActionData(action)
                // await userTypeEnter(action.pid,'input#search',action.video)
                let randomNext = randomRanger(1,4)
                let nextSelector = `ytd-watch-next-secondary-results-renderer > #items .ytd-watch-next-secondary-results-renderer:nth-child(${randomNext})`
                let next = document.querySelector(nextSelector)
                if(!next){
                    randomNext = randomRanger(1,4)
                    nextSelector = document.querySelector(`ytd-watch-next-secondary-results-renderer > #items .ytd-watch-next-secondary-results-renderer:nth-child(${randomRanger(1,4)})`)
                    next = document.querySelector(nextSelector)
                }
                next.insertAdjacentHTML('beforebegin', '<ytd-compact-video-renderer class="style-scope ytd-watch-next-secondary-results-renderer" lockup="" thumbnail-width="168">  <div id="dismissable" class="style-scope ytd-compact-video-renderer"> <ytd-thumbnail use-hovered-property="" class="style-scope ytd-compact-video-renderer">  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="nofollow" href="/watch?v=abcabcabcde"> <yt-img-shadow class="style-scope ytd-thumbnail no-transition" loaded="" style="background-color: transparent;"><img id="img" class="style-scope yt-img-shadow" alt="" width="168" src="https://i.ytimg.com/vi/dpGYmYC3p0I/hqdefault.jpg?sqp=-oaymwEYCKgBEF5IVfKriqkDCwgBFQAAiEIYAXAB&amp;rs=AOn4CLDAbX4Gl4f75wtg594Ix2Hla7Epxw"></yt-img-shadow>  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" overlay-style="DEFAULT"><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="1 hour, 14 minutes"> 1:14:08 </span></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail">  <span class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span> </ytd-thumbnail-overlay-now-playing-renderer></div> <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div> <div id="hover-overlays" class="style-scope ytd-thumbnail"></div> </a> </ytd-thumbnail> <div class="details style-scope ytd-compact-video-renderer"> <div class="metadata style-scope ytd-compact-video-renderer"> <a class="yt-simple-endpoint style-scope ytd-compact-video-renderer" rel="nofollow" href="/watch?v=abcabcabcde"> <h3 class="style-scope ytd-compact-video-renderer"> <ytd-badge-supported-renderer class="style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> <span id="video-title" class="style-scope ytd-compact-video-renderer" aria-label="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava by Dave and Ava - Nursery Rhymes and Baby Songs 3 years ago 1 hour, 14 minutes 22,960,714 views" title="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava"> ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava </span> </h3> <div class="secondary-metadata style-scope ytd-compact-video-renderer"> <ytd-video-meta-block class="compact style-scope ytd-compact-video-renderer" no-endpoints="">    <div id="metadata" class="style-scope ytd-video-meta-block"> <div id="byline-container" class="style-scope ytd-video-meta-block"> <ytd-channel-name id="channel-name" class="style-scope ytd-video-meta-block">  <div id="container" class="style-scope ytd-channel-name"> <div id="text-container" class="style-scope ytd-channel-name"> <yt-formatted-string id="text" title="" class="style-scope ytd-channel-name" ellipsis-truncate="">Dave and Ava - Nursery Rhymes and Baby Songs</yt-formatted-string> </div> <paper-tooltip offset="10" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Dave and Ava - Nursery Rhymes and Baby Songs </div> </paper-tooltip> </div> <ytd-badge-supported-renderer class="style-scope ytd-channel-name">   <div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer"> <yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10 S17.52,2,12,2z M9.92,17.93l-4.95-4.95l2.05-2.05l2.9,2.9l7.35-7.35l2.05,2.05L9.92,17.93z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon> <span class="style-scope ytd-badge-supported-renderer"></span> <paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Verified </div> </paper-tooltip></div> <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat> </ytd-badge-supported-renderer> </ytd-channel-name> <div id="separator" class="style-scope ytd-video-meta-block">•</div> </div> <div id="metadata-line" class="style-scope ytd-video-meta-block">  <span class="style-scope ytd-video-meta-block">22M views</span>  <span class="style-scope ytd-video-meta-block">3 years ago</span> <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div> </div> <div id="additional-metadata-line" class="style-scope ytd-video-meta-block"> <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div>  </ytd-video-meta-block> <ytd-badge-supported-renderer class="badges style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> </div> </a> <div id="buttons" class="style-scope ytd-compact-video-renderer"></div> </div> <div id="menu" class="style-scope ytd-compact-video-renderer"><ytd-menu-renderer class="style-scope ytd-compact-video-renderer">  <div id="top-level-buttons" class="style-scope ytd-menu-renderer"></div> <yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" hidden="">   <button id="button" class="style-scope yt-icon-button">  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon>  </button>  </yt-icon-button> </ytd-menu-renderer></div> <div id="queue-button" class="style-scope ytd-compact-video-renderer"></div> </div> </div> <div id="dismissed" class="style-scope ytd-compact-video-renderer"></div> </ytd-compact-video-renderer>')
                next.previousElementSibling.querySelector('a').href = action.url_type == 'video'?"/watch?v=" + action.playlist_url:"/watch?v=" + (await getFirstVideo(action.playlist_url)).data + "&list=" + action.playlist_url
                await userClick(action.pid, `${nextSelector} a#thumbnail`)
                return

            }
            else{
                // get other video of channel, click if not empty
                let otherVideo = document.querySelector(`${action.channel_videos.map(x => `ytd-watch-next-secondary-results-renderer .ytd-compact-video-renderer a#thumbnail[href*="${x}"]${action.other_videos.map(v => `:not([href*="${v}"])`).join("")}`).join(",")}`)
                if(otherVideo){
                    action.other_videos.push(otherVideo.href.split('v=')[1].split('&')[0])
                    await setActionData(action)
                    await userClick(action.pid,otherVideo.href,otherVideo)
                    return
                }
                else{
                    // click channel page
                    let channel = document.querySelector('#top-row a.ytd-video-owner-renderer')
                    if(channel){
                        await userClick(action.pid, 'channel link', channel)
                    }
                    else{
                        await userTypeEnter(action.pid, 'input#search', action.video)
                    }
                }
            }
            return
        }
        if (action.after && action.finish) {
            await updateActionStatus(action.pid, action.id, 0)
            return
        }
    }

    action.preview = undefined
    action.suggest_search = false
    action.suggest_videos = false
    await setActionData(action)

    if(action.url_type == 'playlist') {
        action.playlist_index = action.playlist_index == undefined ? (action.total_times + randomRanger(0, 1)) : action.playlist_index
        console.log('playlist_index:', action.playlist_index)
        action.playlist_index = action.playlist_index - 1
        await setActionData(action)
    }

    if(action.total_times < 1000){
        await skipAds()
        // get video time
        let videoTime = document.querySelector('.ytp-time-duration').textContent.split(':')
        videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
        if(action.url_type=='playlist' && videoTime > 3600){
            videoTime = 3600
        }
        console.log('videoTime:',videoTime)
        if(Math.random() < 0.2){
            action.watch_time = videoTime*1000*randomRanger(2,7)/10
        }
        else{
            action.watch_time = videoTime*1000*randomRanger(7,9)/10
        }
        // if(Math.random() < 0.2){
        //     action.watch_time = videoTime*1000*randomRanger(0,25)/100
        // }
        // else if(Math.random() < 0.3){
        //     action.watch_time = videoTime*1000*randomRanger(25,50)/100
        // }
        // else if(Math.random() < 0.4){
        //     action.watch_time = videoTime*1000*randomRanger(50,75)/100
        // }
        // else{
        //     action.watch_time = videoTime*1000*randomRanger(75,100)/100
        // }
        console.log('pid',action.pid,'video',action.playlist_url,'percent time:',action.watch_time)
    }
    else{
        await skipAds()
        action.watch_time = Math.random() < 0.2 ? (action.total_times*randomRanger(2,7)/10) : (action.total_times*randomRanger(7,9)/10)
    }

    if(!action.react){
        let commentKeyword = getCommentKeyword(action.playlist_url,action.video)
        action.react = await getReact(commentKeyword,action.watch_time*0.9)
    }
    await setActionData(action)

    return true
}

async function watchingVideo(action){
    let url = window.location.toString()
    let interval = 5000
    for(let i = 0; i < action.watch_time;){
        let currentUrl = window.location.toString()
        // check current url
        if(currentUrl.indexOf(action.playlist_url) < 0 || currentUrl != url) {
            console.log('not play video',action.playlist_url)
            return
        }

        if(i == 0 && url.indexOf('&t=') > -1){
            await sendKey(action.pid,"0")
        }

        await skipAds(true)

        await clickPlayIfPause(action.pid)

        // like or comment
        let react = action.react
        if(react && react.like_time > i && react.like_time <= i + interval){
            await sleep(react.like_time - i)
            await LikeOrDisLikeYoutubeVideo(action.pid, react.like)
        }
        if(react && react.comment_time > i && react.comment_time <= i + interval){
            await sleep(react.comment_time - i)
            await CommentYoutubeVideo(action.pid, react.comment)
        }
        if(react && react.sub_time > i && react.sub_time <= i + interval){
            await sleep(react.sub_time - i)
            await userClick(action.pid,'#top-row #subscribe-button paper-button.ytd-subscribe-button-renderer:not([subscribed])')
        }

        let sleepTime = action.watch_time - i > interval ? interval: action.watch_time - i
        await sleep(sleepTime)

        // report time
        if(i%300000==0) {
            console.log('report time')
            let continueWatch = await updateWatchingTime(action.pid, 1, 0, i==0?20000:300000, {url: action.playlist_url,keyword: action.video})
            console.log('updateWatchingTime',continueWatch)
            let finish = !continueWatch.err && !continueWatch.continue
            if(finish){
                console.log('info','pid: ',action.pid,' finish watch: ',action.playlist_url)
                action.playlist_index = 0
                await setActionData(action)
                return
            }
            if(Math.random() < 0.3){
                let randomScroll = randomRanger(3,7)
                await userScroll(action.pid, randomScroll)
                await sleep(1000)
                await userScroll(action.pid, -randomScroll)
            }
        }

        await updateActionStatus(action.pid, action.id, 1, action.playlist_url+'_'+i, false)
        action.lastRequest = Date.now()
        await setActionData(action)

        i += sleepTime
    }
    return true
}

async function afterWatchingVideo(action,finishVideo){
    let url = window.location.toString()
    if(action.url_type == 'playlist'){
        if(action.playlist_index < 1 || url.indexOf(action.playlist_url) < 0){
            await updateActionStatus(action.pid, action.id, 0,'end playlist')
            return
        }
        else{
            if(finishVideo){
                // nex video
                await nextVideo(action.pid)
            }
            return
        }
    }

    if((await getActionData()).action.finish) return

    action.finish = true
    await setActionData(action)


    if(action.after_video && !action.remove_suggest){
        action.after_video = false
        action.after = true
        await setActionData(action)
        await userClickRandomVideo(action.pid)
        return
    }
    else{
        // report host app
        await updateActionStatus(action.pid, action.id, 0)
        return
    }
}

async function processBrowserFeature(action){
    if(action.home){
        await sleep(3000)
        let scroll = randomRanger(3,7)
        for(let i = 0; i < scroll; i++){
            await userScroll(action.pid, 10)
            let video = document.querySelector('ytd-browse[page-subtype="home"] a#thumbnail[href*="'+action.playlist_url+'"]')
            if(video){
                await userClick(action.pid,action.playlist_url,video)
                return
            }
        }
        if(action.other_videos.length >= CHANNEL_VIDEO_WATCH){
            action.home = false
            await setActionData(action)
            await userTypeEnter(action.pid,'input#search',action.video)
        }
        else{
            if(action.channel_videos.length){
                let otherVideo = document.querySelector(`${action.channel_videos.map(x => `ytd-browse[page-subtype="home"] a#thumbnail[href*="${x}"]${action.other_videos.map(v => `:not([href*="${v}"])`).join("")}`).join(",")}`)
                if(otherVideo){
                    action.other_videos.push(otherVideo.href.split('v=')[1].split('&')[0])
                    await setActionData(action)
                    await userClick(action.pid,otherVideo.href,otherVideo)
                    return
                }
            }
            
            // find channel link
            if(action.channel_url){
                let channel = document.querySelector(`ytd-browse[page-subtype="home"] a#avatar-link[href="${action.channel_url}"]`)
                if(channel){
                    await userClick(action.pid,action.channel_url,channel)
                }
                else{
                    await goToLocation(action.pid, action.channel_url)
                }
            }
            else{
                await userTypeEnter(action.pid,'input#search',action.video)
            }
        }
    }
}

async function skipAds(watchingCheck){
    if(!watchingCheck) await sleep(2000)
    while (document.querySelector('.ytp-ad-skip-ad-slot')) {
        console.log('skip ads')
        let adTimeCurrent = getTimeFromText(document.querySelector('.ytp-time-display .ytp-time-current').textContent)
        let adTimeDuration = getTimeFromText(document.querySelector('.ytp-time-display .ytp-time-duration').textContent)

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
        await sleep(adWatchTime*1000)
        while(!document.querySelector('button.ytp-ad-skip-button') || !document.querySelector('button.ytp-ad-skip-button').getBoundingClientRect().x){
            await sleep(1000)
        }
        await userClick(action.pid, 'button.ytp-ad-skip-button')
        await sleep(2000)
    }
}

async function getReact(keyword,totalTime){
    console.log('getReact',keyword,totalTime)
    let like = false
    let dislike = false
    let sub = false
    let comment
    if(Math.random() < (action.like_percent ? action.like_percent / 1000 : LIKE_PERCENT)){
        if(Math.random() < 0.95){
        // if(Math.random() < 1){
            like = true
        }
        else{
            dislike = true
        }
    }

    let commentPercent = action.like_percent ? action.like_percent / 1000 : document.querySelector('#chatframe')?COMMENT_PERCENT*10:COMMENT_PERCENT

    if(Math.random() < commentPercent){
        comment = await getComment(keyword)
        console.log('GETCOMMENT',comment)
        comment = comment.data
    }

    if(Math.random() < VIEW_SUB_PERCENT){
        sub = true
    }

    let likeTime = like || dislike ? randomRanger(10000,totalTime) : 0
    let commentTime = comment ? randomRanger(10000,totalTime) : 0
    let subTime = sub ? randomRanger(10000,totalTime) : 0

    let react =  {like: like, dislike: dislike, comment: comment, like_time: likeTime, comment_time: commentTime,sub: sub, sub_time: subTime}
    console.log('react:', react)

    return react
}

async function LikeOrDisLikeYoutubeVideo(pid, isLike) {
    try {
        const likeBtn = Array.from(document.querySelectorAll("#top-level-buttons yt-icon-button#button.style-scope.ytd-toggle-button-renderer.style-text"))

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
    return;
    // try {
    //     console.log('pid: ', pid, ', CommentYoutubeVideo',msg)
    //     if(!msg) return
    //     await sleep(2000)

    //     let chatFrame = document.querySelector('#chatframe')
    //     if(chatFrame){
    //         if(!chatFrame.contentWindow.document.querySelector('yt-live-chat-message-renderer a')){
    //             await userTypeEnter(pid,'yt-live-chat-text-input-field-renderer#input',msg,'',chatFrame)
    //             return
    //         }
    //         else{
    //             // create channel
    //             let action = (await getActionData()).action
    //             action.create_channel = true
    //             await setActionData(action)
    //             await userClick(pid,'create channel',chatFrame.contentWindow.document.querySelector('yt-live-chat-message-renderer a'),chatFrame)
    //             return
    //         }
    //     }

    //     await userScroll(pid,70)

    //     if(!document.querySelector('#placeholder-area')){
    //         console.log('error','NO COMMENT SECTION')
    //         return
    //     }

    //     await userScrollTo(pid, "#placeholder-area")
    //     await userClick(pid, "#placeholder-area")
    //     await sleep(1000)

    //     await userType(pid,"#contenteditable-textarea",msg)
    //     await sleep(1000)

    //     await userClick(pid, "#submit-button.ytd-commentbox")
    //     await sleep(2000)

    //     await userScroll(pid,-70)

    // }catch (e) {
    //     console.log('error','CommentYoutubeVideo',pid)
    // }
}

async function clickPlayIfPause(pid) {
    console.log('clickPlayIfPause')
    let btnPlay = document.querySelector('path[d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"]')
    if (btnPlay) {
        console.log('info','clickPlayIfPause')
        await userClick(pid,'button.ytp-play-button')
    }
}

function getCommentKeyword(videoId, keyword){
    return keyword.split(' ').filter(x => x != videoId).slice(0,randomRanger(3,5)).join(' ')
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
    let adWatchTime = randomRanger(minTime,maxTime) - currentTime
    return adWatchTime>0?adWatchTime:0
}

function removeSuggest(){
    try{
        if(action.remove_suggest){
            let element = document.querySelector('#columns #secondary #related')
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
            let url = window.location.toString()
            if(url.indexOf('youtube.com/feed/history') > -1){
                await userClick(action.pid,'#contents > ytd-button-renderer:nth-of-type(1) a paper-button')
                await sleep(2000)
                let confirm = document.querySelector('yt-confirm-dialog-renderer #confirm-button')
                if(confirm){
                    await userClick(action.pid,'yt-confirm-dialog-renderer #confirm-button',confirm)
                }
                if(url.indexOf('youtube.com/feed/history/search_history') > -1){
                    action.delete_history = true
                    await setActionData(action)
                    await userClick(action.pid,'#container a#logo')
                }
                else{
                    await goToLocation(action.pid,'youtube.com/feed/history/search_history')
                }
            }
            else{
                await goToLocation(action.pid,'youtube.com/feed/history')
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

async function createChannel(action){
    await sleep(5000)
    for(let i = 0; i < 5; i++){
        if(document.querySelector('button.create-channel-submit')) break
        await sleep(2000)
    }
    let firstName = document.querySelector('#create-channel-first-name')
    if(!firstName.value){
        await userType(action.pid,'#create-channel-first-name',randomString(),firstName)
    }
    let lastName = document.querySelector('#create-channel-last-name')
    if(!lastName.value){
        await userType(action.pid,'#create-channel-last-name',randomString(),lastName)
    }
    await userClick(action.pid,'button.create-channel-submit')
}

function randomString(){
    return Math.random().toString(36).substring(2);
}