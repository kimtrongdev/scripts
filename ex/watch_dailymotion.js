const SKIP_ADS_PERCENT_DM = 0  //0.85
const LIKE_PERCENT_DM = 0.01
const COMMENT_PERCENT_DM = 0.0015
const VIEW_SUB_PERCENT_DM = 0.002

async function userWatchDM(action){
    try{
        console.log('start watch')

        let url = window.location.toString()

        if (url.indexOf('https://www.dailymotion.com/') == 0 && url.indexOf('?') < 0 && url.split('/').length < 5) {
            await processHomePageDM(action)
        } else if (url.indexOf('https://www.dailymotion.com/signin') == 0) {
            await loginDM(action)
        } else if (url.indexOf('https://accounts.google.com/o/oauth2/auth/oauthchooseaccount') == 0) {
            await oAuthenDM(action)
        } else if (url.indexOf('https://www.dailymotion.com/search') == 0) {
            await processSearchPageDM(action)
        }
        else if(url.indexOf('https://www.dailymotion.com/video') == 0){
            await processWatchPageDM(action)
        }
        else if(url.indexOf('https://www.dailymotion.com/playlist') == 0){
            await processPlaylistPageDM(action)
        }
        else if(url.indexOf('https://accounts.google.com/o/oauth2/auth/identifier') > -1){
            throw 'NOT_LOGIN'
        }
        else if(url.indexOf('accounts.google.com/signin/v2/challenge') > -1){
            throw 'DM_LOGIN_CHALLENGE'
        }
        else{
            throw 'UNKNOWN_URL:' + url
        }
    }
    catch (e) {
        console.log('error',action.pid,e)
        await updateWatchingTime(action.pid, 1, 0, 0, {url: action.playlist_url,video: {id: e.toString().substr(0,255)}})
        if(e.toString()=='NOT_LOGIN') action.retry = true
        if(action.retry || window.location.toString().indexOf('https://www.dailymotion.com/video') > -1 || window.location.toString().indexOf('accounts.google.com') > -1){
            await updateActionStatus(action.pid, action.id, 0, e.toString())
        }
        else{
            action.retry = true
            await setActionData(action)
            await goToLocation(action.pid,'dailymotion.com')
            await sleep(2000)
        }
    }
}

async function loginDM(action){
    console.log('loginDM',action)
    await userClick(action.pid,'#Google_Color')
    await sleep(1000)
    await userClick(action.pid,'.GoogleLoginButton div')
}

async function oAuthenDM(action){
    console.log('oAuthenDM',action)
    await userClick(action.pid,'li div[role="link"]')
}

async function checkLoginDM(action){
    console.log('checkLoginDM',action)
    if(document.querySelector('.ResponsiveHeader__authenticationButton___1i_QT')){
        await userClick(action.pid,'login',[...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][2])
        return true
    }
}

async function processHomePageDM(action){
    console.log('processHomePageDM')
    if((await checkLoginDM(action))) return
    //if(!(await deleteHistory(action))) return
    if(action.direct){
        if(action.url_type=='video'){
            await goToLocation(action.pid,'https://www.dailymotion.com/video/'+action.playlist_url)
            return
        }
        else{
            // playlist
            await goToLocation(action.pid,'https://www.dailymotion.com/playlist/'+action.playlist_url)
            return
        }
    }
    if(action.preview == "home"){
        await userScroll(action.pid,randomRanger(5,15))
        await sleep(randomRanger(1000,5000))
        await userClickRandomVideoDM(action.pid)
    }
    else if(action.preview == "search"){
        await userTypeEnter(action.pid,'.ResponsiveHeaderTab__message___1clVv',action.keyword,[...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][0])
    }
    else if(action.suggest){
        await processSuggestDM(action)
    }
    else if(action.suggest_videos){
        await userTypeEnter(action.pid,'input#search',action.suggest_videos,[...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][0])
    }
    else{
        await userTypeEnter(action.pid,'input#search',action.video,[...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][0])
    }

    await sleep(3000)
}

async function processPlaylistPageDM(action){
    await userClick(action.pid,'.PlayButton__play___3tY0a')
}

async function processSearchPageDM(action){
    let url = window.location.toString()

    if(action.preview == "search"){
        await userScroll(action.pid,randomRanger(20,50))
        await sleep(randomRanger(1000,5000))
        await userClickRandomVideoDM(action.pid)
        return
    }

    let suggestWatchSearch = await processSearchSuggestDM(action)
    if(suggestWatchSearch) return

    // filter by hour if first search
    // if(action.url_type=='video_dm' && !action.filter){
    //     let filter = action.filter?(action.filter+1):1
    //     action.filter = filter
    //     await setActionData(action)
        
    //     // this hour
    //     await userClick(action.pid, 'label[for="today"]')
    //     return
    // }

    let videoSelector = `a[href*="${action.playlist_url}"] .ImgLoader__imgLoaderWrapper___1aFip`
    // scroll result
    // if(!document.querySelector(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
    let element 
    // if filtered or finish filter
    // if(url.indexOf('?') > -1 || (action.url_type=='video_dm' && action.filter >= 5) || (action.url_type=='playlist_dm' && action.filter >= 2)){
    element = document.querySelector(videoSelector)
    if(!element){
        let randomScroll = randomRanger(3,5)
        while(randomScroll > 0 && !element){
            await userScroll(action.pid, 10)
            await sleep(1000)
            randomScroll-=1
            element = document.querySelector(videoSelector)
        }
    }

    if(element){
        if(action.suggest_search){
            let otherVideos = document.querySelectorAll(`a:not([href*="${action.playlist_url}"]) .ImgLoader__imgLoaderWrapper___1aFip`)
            if(otherVideos.length > 0){
                let videoId = otherVideos[randomRanger(0,otherVideos.length-1)].closest('href').href
                videoSelector = `a[href*="${videoId}"] .ImgLoader__imgLoaderWrapper___1aFip`
            }
        }
        await userScrollTo(action.pid,videoSelector)
        await sleep(2000)
        if(action.page_watch){
            console.log('page_watch')
            let channelLink = element.closest('.VideoSearchCard__videoImageWrapper___zPMT9').nextElementSibling.querySelector('.ChannelInfo__videoChannelName___24tUT ')
            await userClick(action.pid, action.playlist_url + ' ChannelInfo',channelLink)
        }
        else{
            await userClick(action.pid, videoSelector)
        }
        await sleep(3000)
    }
    else if(action.url_type=='video_dm'){

        // query correction
        // if(!action.query_correction && document.querySelector('a.yt-search-query-correction:nth-of-type(2)')){
        //     action.query_correction = true
        //     await setActionData(action)
        //     await userClick(action.pid,'a.yt-search-query-correction:nth-of-type(2)')
        //     return
        // }

        let filter = action.filter?(action.filter+1):1
        if(filter>4){
            console.log('error','retry all')
            await updateActionStatus(action.pid, action.id, 0,'video not found')
            return
        }
        else{
            action.filter = filter
            await setActionData(action)
        }

        if(filter == 1){
            // today
            await userClick(action.pid, 'label[for="today"]')
        }
        if(filter == 2){
            // past_week
            await userClick(action.pid, 'label[for="past_week"]')
        }
        else if(filter==3){
            // past_month
            await userClick(action.pid, 'label[for="past_month"]')
        }
        else if(filter == 4){
            // past_year
            await userClick(action.pid, 'label[for="past_year"]')
        }
        await sleep(2000)
    }
    else if(action.url_type=='playlist_dm'){
        let filter = action.filter?(action.filter+1):1
        if(filter>1){
            console.log('error','retry all')
            await updateActionStatus(action.pid, action.id, 0,'playlist not found')
            return
        }
        else{
            action.filter = filter
            await setActionData(action)
        }

        if(filter == 1){
            // playlist
            await userClick(action.pid, '.Tabs__category___2-nxQ',[...document.querySelectorAll('.Tabs__category___2-nxQ')][2])
        }
    }
    else{
        throw 'unknown url_type'
    }
}

async function processWatchChannelPageDM(action){
    let url = window.location.toString()
    if(url.indexOf('/videos') > -1){
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

async function processSearchSuggestDM(action){
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

async function processWatchPageDM(action){
    let watchVideo = await preWatchingVideoDM(action)
    if(watchVideo){
        let finishVideo = await watchingVideoDM(action)
        await afterWatchingVideoDM(action,finishVideo)
    }
}

async function preWatchingVideoDM(action){
    let url = window.location.toString()

    if(url.indexOf(action.playlist_url) < 0) {
        if (action.preview) {
            action.preview = undefined
            action.lastRequest = Date.now()
            await setActionData(action)

            await skipAdsDM()
            await sleep(randomRanger(10000, 30000))
            await userTypeEnter(action.pid, 'input#search', action.suggest_videos ? action.suggest_videos : action.video, [...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][0])
            return
        }
        if (action.suggest_search) {
            action.suggest_search = false
            action.filter = action.filter ? action.filter - 1 : action.filter
            await setActionData(action)
            // if play other video
            if (url.indexOf(action.playlist_url) < 0) {
                await sleep(randomRanger(10000, 15000))
                await userScroll(action.pid, randomRanger(30, 40))
                let videoSelector = `a[href*="${action.playlist_url}"] .ImgLoader__imgLoaderWrapper___1aFip`
                if (document.querySelector(videoSelector)) {
                    await userScrollTo(action.pid, videoSelector)
                    await sleep(2000)
                    await userClick(action.pid, videoSelector)
                    await sleep(3000)
                    return
                } else {
                    await userTypeEnter(action.pid, 'input#search', action.video, [...document.querySelectorAll('.ResponsiveHeaderTab__message___1clVv')][0])
                    return
                }
            }
        }

        if (action.suggest_videos) {
            console.log('suggest_videos')
            action.suggest_videos = undefined
            action.lastRequest = Date.now()
            await setActionData(action)
            await skipAdsDM()
            await sleep(randomRanger(10000, 30000))
            let randomNext = randomRanger(1,4)
            let nextSelector = `ytd-watch-next-secondary-results-renderer > #items .ytd-watch-next-secondary-results-renderer:nth-child(${randomNext})`
            let next = document.querySelector(nextSelector)
            next.insertAdjacentHTML('beforebegin', '<ytd-compact-video-renderer class="style-scope ytd-watch-next-secondary-results-renderer" lockup="" thumbnail-width="168">  <div id="dismissable" class="style-scope ytd-compact-video-renderer"> <ytd-thumbnail use-hovered-property="" class="style-scope ytd-compact-video-renderer">  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="nofollow" href="/watch?v=abcabcabcde"> <yt-img-shadow class="style-scope ytd-thumbnail no-transition" loaded="" style="background-color: transparent;"><img id="img" class="style-scope yt-img-shadow" alt="" width="168" src="https://i.ytimg.com/vi/dpGYmYC3p0I/hqdefault.jpg?sqp=-oaymwEYCKgBEF5IVfKriqkDCwgBFQAAiEIYAXAB&amp;rs=AOn4CLDAbX4Gl4f75wtg594Ix2Hla7Epxw"></yt-img-shadow>  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" overlay-style="DEFAULT"><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="1 hour, 14 minutes"> 1:14:08 </span></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail">  <span class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span> </ytd-thumbnail-overlay-now-playing-renderer></div> <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div> <div id="hover-overlays" class="style-scope ytd-thumbnail"></div> </a> </ytd-thumbnail> <div class="details style-scope ytd-compact-video-renderer"> <div class="metadata style-scope ytd-compact-video-renderer"> <a class="yt-simple-endpoint style-scope ytd-compact-video-renderer" rel="nofollow" href="/watch?v=abcabcabcde"> <h3 class="style-scope ytd-compact-video-renderer"> <ytd-badge-supported-renderer class="style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> <span id="video-title" class="style-scope ytd-compact-video-renderer" aria-label="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava by Dave and Ava - Nursery Rhymes and Baby Songs 3 years ago 1 hour, 14 minutes 22,960,714 views" title="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava"> ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava </span> </h3> <div class="secondary-metadata style-scope ytd-compact-video-renderer"> <ytd-video-meta-block class="compact style-scope ytd-compact-video-renderer" no-endpoints="">    <div id="metadata" class="style-scope ytd-video-meta-block"> <div id="byline-container" class="style-scope ytd-video-meta-block"> <ytd-channel-name id="channel-name" class="style-scope ytd-video-meta-block">  <div id="container" class="style-scope ytd-channel-name"> <div id="text-container" class="style-scope ytd-channel-name"> <yt-formatted-string id="text" title="" class="style-scope ytd-channel-name" ellipsis-truncate="">Dave and Ava - Nursery Rhymes and Baby Songs</yt-formatted-string> </div> <paper-tooltip offset="10" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Dave and Ava - Nursery Rhymes and Baby Songs </div> </paper-tooltip> </div> <ytd-badge-supported-renderer class="style-scope ytd-channel-name">   <div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer"> <yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10 S17.52,2,12,2z M9.92,17.93l-4.95-4.95l2.05-2.05l2.9,2.9l7.35-7.35l2.05,2.05L9.92,17.93z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon> <span class="style-scope ytd-badge-supported-renderer"></span> <paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Verified </div> </paper-tooltip></div> <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat> </ytd-badge-supported-renderer> </ytd-channel-name> <div id="separator" class="style-scope ytd-video-meta-block">•</div> </div> <div id="metadata-line" class="style-scope ytd-video-meta-block">  <span class="style-scope ytd-video-meta-block">22M views</span>  <span class="style-scope ytd-video-meta-block">3 years ago</span> <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div> </div> <div id="additional-metadata-line" class="style-scope ytd-video-meta-block"> <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div>  </ytd-video-meta-block> <ytd-badge-supported-renderer class="badges style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> </div> </a> <div id="buttons" class="style-scope ytd-compact-video-renderer"></div> </div> <div id="menu" class="style-scope ytd-compact-video-renderer"><ytd-menu-renderer class="style-scope ytd-compact-video-renderer">  <div id="top-level-buttons" class="style-scope ytd-menu-renderer"></div> <yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" hidden="">   <button id="button" class="style-scope yt-icon-button">  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon>  </button>  </yt-icon-button> </ytd-menu-renderer></div> <div id="queue-button" class="style-scope ytd-compact-video-renderer"></div> </div> </div> <div id="dismissed" class="style-scope ytd-compact-video-renderer"></div> </ytd-compact-video-renderer>')
            next.previousElementSibling.querySelector('a').href = action.url_type == 'video'?"/watch?v=" + action.playlist_url:"/watch?v=" + (await getFirstVideo(action.playlist_url)).data + "&list=" + action.playlist_url
            await userClick(action.pid, `${nextSelector} a#thumbnail`)
            return
        }

        if (action.after) {
            await skipAdsDM()
            let videoTime = await waitForElement('.np_TimerContent-duration')
            videoTime = videoTime.textContent.split(':')
            
            videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
            if(videoTime<300000){
                await sleep(1000*randomRanger(Math.round(videoTime*0.5), Math.round(videoTime*0.8)))
            }
            else{
                await sleep(randomRanger(180000, 300000))
            }
            await updateActionStatus(action.pid, action.id, 0)
            return
        }
    }

    action.preview = undefined
    action.suggest_search = false
    action.suggest_videos = false
    await setActionData(action)

    if(action.url_type == 'playlist_dm') {
        action.playlist_index = action.playlist_index == undefined ? (action.total_times + randomRanger(0, 1)) : action.playlist_index
        console.log('playlist_index:', action.playlist_index)
        action.playlist_index = action.playlist_index - 1
        await setActionData(action)
    }

    if(action.total_times < 1000){
        await skipAdsDM()
        // get video time
        let videoTime = document.querySelector('.np_TimerContent-duration').textContent.split(':')
        videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
        if(action.url_type=='playlist_dm' && videoTime > 3600){
            videoTime = 3600
        }
        console.log('videoTime:',videoTime)
        if(Math.random() < 0){
            action.watch_time = videoTime*1000*randomRanger(20,80)/100
        }
        else{
            action.watch_time = videoTime*1000*randomRanger(85,90)/100
        }
        console.log('pid',action.pid,'video',action.playlist_url,'percent time:',action.watch_time)
    }
    else{
        action.watch_time = action.total_times*randomRanger(9,10)/10
    }
    if(!action.react){
        let commentKeyword = getCommentKeyword(action.playlist_url,action.video)
        action.react = await getReactDM(commentKeyword,action.watch_time*0.9)
    }
    await setActionData(action)

    return true
}

async function watchingVideoDM(action){
    let url = window.location.toString()
    let interval = 5000
    for(let i = 0; i < action.watch_time;){
        let currentUrl = window.location.toString()
        // check current url
        if(currentUrl.indexOf(action.playlist_url) < 0 || currentUrl != url) {
            console.log('not play video',action.playlist_url)
            return
        }

        await skipAdsDM(true)

        if(i == 0){
            await userClick(action.pid,'.np_icon--Volume-Mute')
            await userClick(action.pid,'.np_menu-close svg')
        }
        await clickPlayIfPauseDM(action.pid)

        // like or comment
        let react = action.react
        if(react && react.like_time > i && react.like_time <= i + interval){
            await sleep(react.like_time - i)
            await LikeDMVideo(action.pid, react.like)
        }
        if(react && react.sub_time > i && react.sub_time <= i + interval){
            await sleep(react.sub_time - i)
            await userClick(action.pid,'.ChannelLine__followButtonContainer___5EZxf button:not(.IconButton__isActive___2kvNs)')
        }

        let sleepTime = action.watch_time - i > interval ? interval: action.watch_time - i
        await sleep(sleepTime)

        // report time
        if(i%300000==0) {
            console.log('report time')
            let continueWatch = await updateWatchingTime(action.pid, 1, 0, i==0?20000:300000, {url: action.playlist_url})
            console.log('updateWatchingTime',continueWatch)
            let finish = !continueWatch.err && !continueWatch.continue

            // TODO: test
            // finish = false
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

async function afterWatchingVideoDM(action,finishVideo){
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
        await userClickRandomVideoDM(action.pid)
        return
    }
    else{
        // report host app
        await updateActionStatus(action.pid, action.id, 0)
        return
    }
}

async function processSuggestDM(action){
    if(action.suggest){
        action.suggest = action.suggest -1
        await setActionData(action)
        await sleep(3000)
        let j = 0
        let scroll = randomRanger(10,20)
        while(j < scroll){
            await userScroll(action.pid, 10)
            await sleep(500)
            let sugguestSelector = 'ytd-browse a#thumbnail[href*="'+action.playlist_url+'"]'
            let suggestVideo = document.querySelector(sugguestSelector)
            if(suggestVideo){
                await userScrollTo(action.pid,sugguestSelector)
                action.suggest = 0
                await setActionData(action)
                await userClick(action.pid,sugguestSelector)
                return true
            }
            j++
        }
        throw 'HOME_VIDEO_NOT_FOUND'
    }
}

async function skipAdsDM(watchingCheck){
    if(!watchingCheck) await sleep(2000)
    while (document.querySelector('.np_TimerAd')) {
        console.log('skip ads')
        let adTimeCurrent = 2
        let adTimeDuration = getTimeFromText(document.querySelector('.np_TimerAd').textContent)

        let adWatchTime
        if(Math.random() < SKIP_ADS_PERCENT_DM){
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
                adWatchTime = getWatchAdTime(adTimeCurrent,20,adTimeDuration)
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
        // let i = 0
        // while (
        //     i < 60
        //     && (!document.querySelector('button.np_ButtonAdSkip') || !document.querySelector('button.np_ButtonAdSkip').getBoundingClientRect().x)
        //     // && (!document.querySelector('.videoAdUiSkipButtonExperimentalText') || !document.querySelector('.videoAdUiSkipButtonExperimentalText').getBoundingClientRect().x)
        //     && (!document.querySelector('button.videoAdUiSkipButton') || !document.querySelector('button.videoAdUiSkipButton').getBoundingClientRect().x)
        // ) {
        //     console.log('wait for skip button')
        //     i++
        //     await sleep(1000)
        // }
        await userClick(action.pid, 'button.np_ButtonAdSkip')
        await userClick(action.pid, 'button.videoAdUiSkipButton')
        await sleep(2000)
    }
}

async function getReactDM(keyword,totalTime){
    console.log('getReact',keyword,totalTime)
    let like = false
    let dislike = false
    let sub = false
    let comment
    if(Math.random() < LIKE_PERCENT_DM){
        if(Math.random() < 0.95){
            like = true
        }
        else{
            dislike = true
        }
    }

    let commentPercent = 0

    if(Math.random() < commentPercent){
        comment = await getComment(keyword)
        console.log('GETCOMMENT',comment)
        comment = comment.data
    }

    if(Math.random() < VIEW_SUB_PERCENT_DM){
        sub = true
    }

    let likeTime = like || dislike ? randomRanger(10000,totalTime) : 0
    let commentTime = comment ? randomRanger(10000,totalTime) : 0
    let subTime = sub ? randomRanger(10000,totalTime) : 0

    let react =  {like: like, dislike: dislike, comment: comment, like_time: likeTime, comment_time: commentTime,sub: sub, sub_time: subTime}
    console.log('react:', react)

    return react
}

async function LikeDMVideo(pid, isLike) {
    try {
        await userClick(pid,'.RoundIconButton__light___2IWce:nth-child(1):not(.RoundIconButton__active___kiZ4E) span')

    }catch (e) {
        console.log("LikeDMVideo pid: ", pid, " err: ", e)
    }
}

async function clickPlayIfPauseDM(pid) {
    try{
        let btnPlay = document.querySelector('.np_ButtonPlayback use').href.baseVal.indexOf('Play')
        if (btnPlay > 0) {
            console.log('info', 'clickPlayIfPauseDM')
            await userClick(pid, '.np_ControlsManager')
        }
    }
    catch(e){
        console.log('clickPlayIfPauseDM',e)
    }
}

async function userClickRandomVideoDM(pid) {
    console.log('userClickRandomVideoDM')
    let watches = document.querySelectorAll('.ImgLoader__imgLoaderWrapper___1aFip')
    let visibles = Array.from(watches).filter(x => x.getBoundingClientRect().x > 0 && x.getBoundingClientRect().y > 100 && x.getBoundingClientRect().y < window.innerHeight - x.getBoundingClientRect().height)
    if(visibles.length){
        let random = visibles[randomRanger(0,visibles.length-1)]
        let pos = getElementPosition(random)
        await updateUserInput(pid,'CLICK',pos.x,pos.y,pos.scrollX,pos.scrollY,"", 'random video: ImgLoader__imgLoaderWrapper___1aFip')
    }
    else{
        throw 'no random video'
    }
}