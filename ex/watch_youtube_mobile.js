async function userWatchMobile(action){
    try{
        console.log('start watch')
        await sleep(2000)
        let url = window.location.toString()

        // check is mobile
        if (!navigator.maxTouchPoints) {
            await updateActionStatus(action.pid, action.id, 0,'not mobile')
        }

        if (url.indexOf('Faccount&feature=settings#menu') > -1) {
            let channels = document.querySelectorAll('.account-item-endpoint')
            if (channels.length <= action.channel_position) {
                await updateActionStatus(action.pid, action.id, 0,'end playlist')
                return
            }

            let channel = channels.item(action.channel_position)
            if (channel) {
                if (action.channel_position < channels.length - 2) {
                    reportPositionChannel(action.pid, action.channel_position)
                }
                //await getNewVideoData(action)
                action.channel_position += 1
                await setActionData(action)
                await userClick(action.pid, '', channel)
            } else {
                await updateActionStatus(action.pid, action.id, 0,'end playlist')
            }
            return
        }

        if (url == 'https://m.youtube.com/' || url == 'https://m.youtube.com//' || 
            url.indexOf('https://m.youtube.com/?next=%2Faccount&feature=settings&noapp=1') > -1) {
            await processHomePageMobile(action)
        }
        else if (url.indexOf('https://m.youtube.com/select_site') == 0) {
            await processDeleteHistoryMobile(action)
        } 
        else if (url.indexOf('https://m.youtube.com/results') > -1) {
            await processSearchPageMobile(action)
        }
        else if(url.indexOf('https://m.youtube.com/watch') > -1){
            await processWatchPageMobile(action)
        }
        else if(url.indexOf('https://m.youtube.com/playlist?list=') > -1){
            await processPlaylistPageMobile(action)
        }
        else if(url.indexOf('https://m.youtube.com/channel/') > -1 || url.indexOf('https://m.youtube.com/user/') > -1 || url.indexOf('https://m.youtube.com/c/') > -1){
            await processWatchChannelPageMobile(action)
        }
        else if(url.indexOf('https://myaccount.google.com/') == 0){
            await goToLocation(action.pid,'youtube.com//')
        }
        else if(url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/ServiceLogin') > -1){
            throw 'NOT_LOGIN'
        }
        else if(url.indexOf('youtube.com/oops') > -1 && document.querySelector('#alerts')){
            throw new Error('NOT_LOGIN_'+document.querySelector('#alerts .yt-alert-message').textContent)
        }
        else if (url.indexOf('https://consent.youtube.com') == 0){
            if(!action.login_retry){
                action.login_retry = true
                await setActionData(action)
                await goToLocation(action.pid, 'accounts.google.com')
            }
            else{
                throw 'NOT_LOGIN'
            }
        }
        else{
            throw 'unknown url: ' + url
        }
    }
    catch (e) {
        console.log('error',action.pid,e)
        if(e.toString()=='NOT_LOGIN') action.retry = true
        
        if(e.toString()=='VIDEO_NOT_FOUND'){
            action.keyword_retry = action.keyword_retry?action.keyword_retry+1:1
            action.searchList = action.searchList.filter(x => x.trim() != action.video)
            if(action.searchList.length == 0 || action.keyword_retry > 3){
                await updateActionStatus(action.pid, action.id, 0, e.toString())
                return
            }
            action.retry = false
            action.video = action.searchList[randomRanger(0,action.searchList.length-1)].trim()
            action.filter = undefined
            await setActionData(action)
            await goToLocation(action.pid,'m.youtube.com//')
            await sleep(2000)
        }
        else if(e.toString() == 'SEARCH_SKIP'){
            action.retry = undefined
            action.filter = action.filter?action.filter-1:undefined
            await setActionData(action)
            await goToLocation(action.pid,'m.youtube.com//')
            await sleep(2000)
        }
        else if(action.retry || window.location.toString().indexOf('https://m.youtube.com/watch') > -1){
            await screenshot(action.pid)
            await updateActionStatus(action.pid, action.id, 0, e.toString())
        }
        else{
            await updateActionStatus(action.pid, action.id, 1, e.toString(), false)
            action.retry = true
            action.filter = undefined
            await setActionData(action)
            await goToLocation(action.pid,'m.youtube.com//')
            await sleep(2000)
        }
    }
}

async function processHomePageMobile(action){
    await checkLogin(action)
    if (action.channel_position == 0 || action.fisrtStart) {
        action.fisrtStart = false
        await setActionData(action)
        await goToLocation(action.pid,'m.youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        return 
    }

    // if(!(await deleteHistory(action))) return
    if(false && action.direct){
        if(action.url_type=='video'){
            await goToLocation(action.pid,'https://m.youtube.com/watch?v='+action.playlist_url)
            return
        }
        else{
            // playlist
            await goToLocation(action.pid,'https://m.youtube.com/playlist?list='+action.playlist_url)
            return
        }
    }

    // if(action.preview == "home"){
    //     await userScrollMobile(action.pid,randomRanger(5,15))
    //     await sleep(randomRanger(1000,5000))
    //     await userClickRandomVideoMobile(action.pid)
    // }
    // else 
    if(action.preview == "search"){
        await searchMobile(action.pid,action.keyword)
    }
    else if(action.home){
        await processBrowserFeatureMobile(action)
    }
    else if(action.suggest_videos){
        await searchMobile(action.pid,action.suggest_videos)
    }
    else{
        await searchMobile(action.pid,action.video || action.keyword)
    }

    await sleep(3000)
}

async function processPlaylistPageMobile(action){
    await userClick(action.pid,'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
}

async function processSearchPageMobile(action){
    let url = window.location.toString()

    if(action.preview == "search"){
        await userScrollMobile(action.pid,randomRanger(0,20))
        await sleep(randomRanger(1000,5000))
        await userClickRandomVideoMobileComplact(action.pid)
        return
    }

    let suggestWatchSearch = await processSearchSuggestMobile(action)
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

    let videoSelector = 'ytm-search a.compact-media-item-image[href*="'+action.playlist_url+'"]'
    // scroll result
    // if(!document.querySelector(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
    let element
    // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
    // element = document.querySelector(videoSelector)
    // if(!element){
    if(!action.filter || url.indexOf('253D%253D') > -1){
        let randomScroll = randomRanger(3,5)
        while(randomScroll > 0 && !element){
            await userScrollMobile(action.pid, 10)
            await sleep(1000)
            randomScroll-=1
            element = document.querySelector(videoSelector)
        }
    }

    if(element){
        if(Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
        if(action.suggest_search){
            let otherVideos = document.querySelectorAll('ytm-search a.compact-media-item-image:not([href*="'+action.playlist_url+'"])')
            if(otherVideos.length > 0){
                let videoId = otherVideos[randomRanger(0,otherVideos.length-1)].href
                videoId = videoId.substr(videoId.indexOf('?v=')+3,11)
                videoSelector = 'ytm-search a.compact-media-item-image[href*="'+videoId+'"]'
            }
        }
        await sleep(2000)
        if(action.page || action.suggest){
            console.log('page_watch:',action.page,', suggest:', action.suggest,',home:',action.home)
            if(action.suggest){
                let otherRandomVideos = [...document.querySelectorAll('ytm-search a.compact-media-item-metadata-content:not([href*="'+action.playlist_url+'"])')]
                if(otherRandomVideos.length){
                    await userClick(action.pid, videoSelector,otherRandomVideos[randomRanger(0,otherRandomVideos.length-1)])
                }
                else{
                    await userClick(action.pid, videoSelector)
                }
            }
            else{
                let channelName = element.nextElementSibling.querySelector('.subhead > .compact-media-item-byline').textContent.trim()
                console.log('channelName:',channelName)
                let channels = [...document.querySelectorAll('ytm-search ytm-compact-channel-renderer .compact-media-item-headline')].filter(x => x.textContent == channelName)
                if(channels.length > 0){
                    await userClick(action.pid,`ytm-compact-channel-renderer ${channelName}`,channels[0])
                    return
                }
                let otherVideos = [...document.querySelectorAll('ytm-search a.compact-media-item-metadata-content')].filter(x => x.querySelector('.subhead > .compact-media-item-byline').textContent==channelName && x.href.indexOf(action.playlist_url) < 0 && x.href.indexOf('v=') >= 0)
                action.channelName = channelName
                if(otherVideos.length){
                    let otherVideo = otherVideos[randomRanger(0,otherVideos.length-1)]
                    action.other_videos.push(otherVideo.href.split('v=')[1].split('&')[0])
                    await setActionData(action)
                    await userClick(action.pid, action.playlist_url + ' ' + channelName,otherVideo)
                }                
                else if(document.querySelector('.search-bar-text').textContent.indexOf(channelName) < 0){
                    await userScrollMobile(action.pid,-1)
                    await userClick(action.pid, 'button.search-bar-text')
                    await sleep(1000)
                    await userClick(action.pid, 'ytm-searchbox button')
                    let channelSearch = action.video.split(' ').slice(0,2).join(' ').concat(` "${channelName}"`)
                    await userOnlyTypeEnter(action.pid,'input.searchbox-input',channelSearch)
                }
                else{
                    await userClick(action.pid, videoSelector)
                }
            }
        }
        else{
            await userClick(action.pid, videoSelector)
        }
        await sleep(3000)
    }
    else if(action.url_type=='video'){
        // if filtered, go to home page
        if(url.indexOf('253D%253D') > -1){
            await userScrollMobile(action.pid,-1)
            await userClick(action.pid, 'button.search-bar-text')
            await sleep(1000)
            await userClick(action.pid, 'ytm-searchbox button:nth-of-type(2)')
            return
        }

        if(!action.query_correction && document.querySelector('a.search-query-correction-endpoint:nth-of-type(2)')){
            action.query_correction = true
            await setActionData(action)
            await userClick(action.pid,'a.search-query-correction-endpoint:nth-of-type(2)')
            return
        }

        let filter = action.filter?(action.filter+1):1
        if(filter>3){
            console.log('error','retry all')
            // await updateActionStatus(action.pid, action.id, 0,'VIDEO_NOT_FOUND')
            throw 'VIDEO_NOT_FOUND'
        }
        else{
            action.filter = filter
            await setActionData(action)
        }

        // await userScrollTo(action.pid,'#filter-menu a > #button')
        // await sleep(1000)
        await userScrollMobile(action.pid,-5)
        await userClick(action.pid, 'button.search-filter-icon')
        await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2)')

        await sleep(2000)
        await userSelect(action.pid,filter)
        // if(filter == 1){
        //     // this hour
        //     await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        // }
        // if(filter == 2){
        //     // today
        //     await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(2)')
        // }
        // else if(filter==3){
        //     // this week
        //     await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(3)')
        // }
        // else if(filter == 4){
        //     // this month
        //     await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(4)')
        // }
        await sleep(2000)
    }
    else if(action.url_type=='playlist'){
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

        await userScrollMobile(action.pid,-5)
        await userClick(action.pid, 'button.search-filter-icon')
        await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(1)')

        if(filter == 1){
            // playlist
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(1) option:nth-of-type(3)')
        }
    }
    else{
        throw 'unknown url_type'
    }
}

async function processWatchChannelPageMobile(action){
    let url = window.location.toString()
    if(url.indexOf('/videos') > -1){
        // process videos page
        let i = 50
        while(i > 0 && !document.querySelector('ytm-browse lazy-list a.compact-media-item-metadata-content[href*="'+action.playlist_url+'"]')){
            await userScrollMobile(action.pid,5)
            await sleep(1000)
            i--
        }
        let video = document.querySelector('ytm-browse lazy-list a.compact-media-item-metadata-content[href*="'+action.playlist_url+'"]')
        if(video){
            if(Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
            await userClick(action.pid,'ytm-browse lazy-list a.compact-media-item-metadata-content[href*="'+action.playlist_url+'"]',video)
            await sleep(2000)
        }
        else{
            throw 'video in page not found'
        }
    }
    else{
        // click videos tab
        if(document.querySelector('.scbrr-tabs a:nth-of-type(2)')){
            await userClick(action.pid,'.scbrr-tabs a:nth-of-type(2)')
        }
        else{
            throw 'no videos link'
        }
    }
}

async function processSearchSuggestMobile(action){
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
        // if(action.public_days <= 1/24 && url.indexOf('253D%253D') < 0){
        //     // filter by hour
        //     await userClick(action.pid, '#filter-menu a > #button')
        //     await sleep(2000)
        //     await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
        // }
        // else if(action.public_days <= 1/24 && Array.from(document.querySelectorAll('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail')).length < 20){
        //     // filter by hour by not enough results
        //     action.public_days = 1
        //     await setActionData(action)
        //     await userClick(action.pid, '#search-icon-legacy')
        // }
        if(action.public_days <= 1 && url.indexOf('253D%253D') < 0){
            // filter by day
            await userClick(action.pid, 'button.search-filter-icon')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(2)')

        }
        else if(action.public_days <= 7 && url.indexOf('253D%253D') < 0){
            // filter by week
            await userClick(action.pid, 'button.search-filter-icon')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(3)')
        }
        else if(action.public_days <= 30 && url.indexOf('253D%253D') < 0){
            // filter by month
            await userClick(action.pid, 'button.search-filter-icon')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2)')
            await userClick(action.pid, 'ytm-search-filter-group-renderer:nth-of-type(2) option:nth-of-type(4)')
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
                await userScrollMobile(action.pid, randomScroll*5)
            }
            await sleep(randomRanger(1000, 5000))
            await userClickRandomVideoMobileComplact(action.pid)
        }
        return true
    }
}

async function processWatchPageMobile(action){
    let watchVideo = await preWatchingVideoMobile(action)
    if(watchVideo){
        let finishVideo = await watchingVideoMobile(action)
        await afterWatchingVideoMobile(action,finishVideo)
    }
}

async function preWatchingVideoMobile(action){
    await sleep(3000)
    let url = window.location.toString()
    // removeSuggest()
    if(url.indexOf(action.playlist_url) < 0) {
        await skipAdsMobile()
        await userScrollMobile(action.pid,0)
        let randomSleep = randomRanger(3,9)
        for(let i = 0; i < randomSleep; i++){
            await sleep(10000)
            await userScrollMobile(action.pid,0)
        }
        // await sleep(randomRanger(30000, 90000))
        await userScrollMobile(action.pid,0)
        let videoChannelName = document.querySelector('ytm-slim-owner-renderer .slim-owner-bylines h3')
        if(videoChannelName && action.channelName == videoChannelName.textContent){
            randomSleep = randomRanger(6,18)
            for(let i = 0; i < randomSleep; i++){
                await sleep(10000)
                await userScrollMobile(action.pid,0)
            }
            // await sleep(randomRanger(60000, 180000))
        }
        if (action.preview) {
            action.preview = false
            action.lastRequest = Date.now()
            await setActionData(action)
            await searchMobile(action.pid,action.video)
            return
        }
        if(action.home){
            if(Math.random() < 0.5 ) {
                await userClick(action.pid,'#app #home-icon')
            }
            else{
                await goToLocation(action.pid,'m.youtube.com//')
            }
            return
        }
        if(action.page){
            let channel = document.querySelector('ytm-slim-owner-renderer a.slim-owner-icon-and-title')
            await userClick(action.pid, 'channel link', channel)
            return
        }
        if(action.suggest){
            let scroll = randomRanger(3,5)
            for(let i = 0; i < scroll; i++){
                await userScrollMobile(action.pid,10)
                let video = document.querySelector('ytm-single-column-watch-next-results-renderer lazy-list ytm-compact-video-renderer a.compact-media-item-image[href*="' + action.playlist_url + '"]')
                if(video) {
                    await userClick(action.pid, action.playlist_url, video)
                    return
                }
            }
            if(!action.channelName || action.other_videos.length >= CHANNEL_VIDEO_WATCH){
                action.suggest = false
                await setActionData(action)
                let randomNext = randomRanger(1,4)
                let nextSelector = `ytm-single-column-watch-next-results-renderer lazy-list ytm-video-with-context-renderer:nth-of-type(${randomNext})`
                let next = document.querySelector(nextSelector)
                if(!next) {
                    randomNext = randomRanger(1,4)
                    nextSelector = `ytm-single-column-watch-next-results-renderer lazy-list ytm-video-with-context-renderer:nth-of-type(${randomNext})`
                    next = document.querySelector(nextSelector)
                }
                // next.insertAdjacentHTML('beforebegin', '<ytm-compact-video-renderer class="item"><div class="compact-media-item"><a class="compact-media-item-image" aria-hidden="true" href="/watch?v=zf8Lu8-eFrY"><div class="video-thumbnail-container-compact center"><div class="cover video-thumbnail-img video-thumbnail-bg"></div><img alt="" class="cover video-thumbnail-img" src="https://i.ytimg.com/vi/zf8Lu8-eFrY/default.jpg"><div class="video-thumbnail-overlay-bottom-group"><ytm-thumbnail-overlay-time-status-renderer data-style="DEFAULT">8:52</ytm-thumbnail-overlay-time-status-renderer></div></div></a><div class="compact-media-item-metadata" data-has-badges="false"><a class="compact-media-item-metadata-content" href="/watch?v=zf8Lu8-eFrY"><h4 class="compact-media-item-headline">Chị em thi nhau rụng tim với giọng hát ngọt ngào của rapper BIGCITYBOI</h4><div class="subhead" extend-height="false" aria-hidden="true"><div class="compact-media-item-byline small-text">DONG TAY ENTERTAINMENT</div><div class="compact-media-item-stats small-text">6.4M views</div></div></a><ytm-menu-renderer class="compact-media-item-menu"><ytm-menu><button class="icon-button " aria-label="Action menu" aria-haspopup="true"><c3-icon flip-for-rtl="false"><svg viewBox="0 0 24 24" fill=""><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></c3-icon></button></ytm-menu></ytm-menu-renderer></div></div></ytm-compact-video-renderer>')
                next.insertAdjacentHTML('beforebegin', '<ytm-video-with-context-renderer class="item"><ytm-large-media-item><a class="large-media-item-thumbnail-container" aria-hidden="true" href="/watch?v=0dLr9W5BDCA&amp;t=20s"><div class="video-thumbnail-container-large center"><div class="cover video-thumbnail-img video-thumbnail-bg"></div><img alt="" class="cover video-thumbnail-img" src="https://i.ytimg.com/vi/0dLr9W5BDCA/hq720.jpg?sqp=-oaymwEcCK4FEIIDSEbyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC2PgNBneRJchNr_I_nvokRUq1cIw"><div class="video-thumbnail-overlay-bottom-group"><ytm-thumbnail-overlay-resume-playback-renderer><div class="thumbnail-overlay-resume-playback-progress" style="width: 10%;"></div></ytm-thumbnail-overlay-resume-playback-renderer><ytm-thumbnail-overlay-time-status-renderer data-style="DEFAULT">45:48</ytm-thumbnail-overlay-time-status-renderer></div></div></a><div class="details"><div class="large-media-channel"><ytm-channel-thumbnail-with-link-renderer><a href="/c/M%C3%B9a%C4%90iNgangPh%E1%BB%914U"><ytm-profile-icon class="channel-thumbnail-icon" aria-label="Ir ao canal"><img class="profile-icon-img" alt="" src="https://yt3.ggpht.com/ytc/AAUvwni7OTbXT5QxHVsQAJot7_0QuwBe6CpHEJLicKXr=s68-c-k-c0x00ffffff-no-rj"></ytm-profile-icon></a></ytm-channel-thumbnail-with-link-renderer><a class="large-media-item-extra-endpoint" aria-hidden="true" href="/watch?v=0dLr9W5BDCA&amp;t=20s"></a></div><div class="large-media-item-info cbox" no-channel-avatar="false"><div class="large-media-item-metadata"><a href="/watch?v=0dLr9W5BDCA&amp;t=20s"><h3 class="">Là Gió Thì Gió Cứ Bay Về Trời - Nhạc Chill Cho Ngày Nhẹ Nhàng</h3><div class="" aria-hidden="true"><ytm-badge-and-byline-renderer><span class="ytm-badge-and-byline-item-byline small-text" dir="auto" aria-hidden="true">Mùa Đi Ngang Phố</span><span class="ytm-badge-and-byline-separator" aria-hidden="true">•</span><span class="ytm-badge-and-byline-item-byline small-text" dir="auto" aria-hidden="true">1,9&nbsp;mi de visualizações</span></ytm-badge-and-byline-renderer></div></a></div><ytm-menu-renderer class="large-media-item-menu"><ytm-menu><button class="icon-button " aria-label="Menu de ações" aria-haspopup="true"><c3-icon><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"></path></svg></c3-icon></button></ytm-menu></ytm-menu-renderer></div></div></ytm-large-media-item></ytm-video-with-context-renderer>')
                next.previousElementSibling.querySelector('a').href = action.url_type == 'video'?"/watch?v=" + action.playlist_url:"/watch?v=" + (await getFirstVideo(action.playlist_url)).data + "&list=" + action.playlist_url
                await userClick(action.pid, `${nextSelector} a`)
                return
            }
            else{
                // get other video of channel, click if not empty
                let channelName = action.channelName
                let otherVideos = [...document.querySelectorAll('ytm-single-column-watch-next-results-renderer lazy-list a.compact-media-item-metadata-content')].filter(x => x.querySelector('.subhead > .compact-media-item-byline').textContent==channelName && !action.other_videos.includes(x.parentElement.parentElement.href.split('v=')[1].split('&')[0]))
                if(otherVideos.length){
                    let otherVideo = otherVideos[randomRanger(0,otherVideos.length-1)]
                    action.other_videos.push(otherVideo.href.split('v=')[1].split('&')[0])
                    await setActionData(action)
                    await userClick(action.pid,otherVideo.href,otherVideo)
                    return
                }
                else{
                    // click channel page
                    let channel = document.querySelector('ytm-slim-owner-renderer a.slim-owner-icon-and-title')
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
    // if(action.watched){
    //     await updateActionStatus(action.pid, action.id, 0)
    //     return
    // }
    // else{
    //     action.watched = true
    // }
    await setActionData(action)

    if(action.url_type == 'playlist') {
        action.playlist_index = action.playlist_index == undefined ? (action.total_times + randomRanger(0, 1)) : action.playlist_index
        console.log('playlist_index:', action.playlist_index)
        action.playlist_index = action.playlist_index - 1
        await setActionData(action)
    }

    if (action.viewed_ads) {
        action.watch_time = randomRanger(action.watching_time_start_ads, action.watching_time_end_ads)
    } else {
        action.watch_time = action.watching_time_non_ads
    }
    // if(action.total_times < 1000){
        // await skipAdsMobile()
        // // get video time
        // let videoTime = document.querySelector('.time-second').textContent.split(':')
        // videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
        // if(action.url_type=='playlist' && videoTime > 3600){
        //     videoTime = 3600
        // }
        //console.log('videoTime:',videoTime)
        // if(Math.random() < 0.2){
        //     action.watch_time = videoTime*1000*randomRanger(2,7)/10
        // }
        // else{
           // action.watch_time = videoTime*1000*randomRanger(7,10)/10
        //}
    //     console.log('pid',action.pid,'video',action.playlist_url,'percent time:',action.watch_time)
    // }
    // else{
    //     await skipAdsMobile()
    //     action.watch_time = Math.random() < 0.2 ? (action.total_times*randomRanger(2,7)/10) : (action.total_times*randomRanger(7,9)/10)
    // }

    // if(!action.react){
    //     let commentKeyword = getCommentKeyword(action.playlist_url,action.video)
    //     action.react = await getReact(commentKeyword,action.watch_time*0.9)
    // }
    await setActionData(action)

    return true
}

async function watchingVideoMobile(action){
    let url = window.location.toString()
    let interval = 5000
    for(let i = 0; i < action.watch_time;){
        let currentUrl = window.location.toString()
        // check current url
        if(currentUrl.indexOf(action.playlist_url) < 0 || currentUrl != url) {
            console.log('not play video',action.playlist_url)
            return
        }

        await skipAdsMobile(true)

        // if (action.viewed_ads) {
        //     await sleep(5000)
        //     return true
        // }

        if(i == 0 && url.indexOf('&t=') > -1){
            await sendKey(action.pid,"0")
        }

        await clickPlayIfPauseMobile(action.pid)

        // like or comment
        // let react = action.react
        // if(react && react.like_time > i && react.like_time <= i + interval){
        //     await sleep(react.like_time - i)
        //     await LikeOrDisLikeYoutubeVideoMobile(action.pid, react.like)
        // }
        // if(react && react.comment_time > i && react.comment_time <= i + interval){
        //     await sleep(react.comment_time - i)
        //     await CommentYoutubeVideoMobile(action.pid, react.comment)
        // }
        // if(react && react.sub_time > i && react.sub_time <= i + interval){
        //     await sleep(react.sub_time - i)
        //     await userClick(action.pid,'ytm-subscribe-button-renderer c3-material-button[data-style="STYLE_BRAND"]')
        //     action.description = parseInt(document.querySelector('.slim-owner-bylines .subhead').textContent) || undefined
        //     await setActionData(action)
        // }

        let sleepTime = action.watch_time - i > interval ? interval: action.watch_time - i
        await sleep(sleepTime)

        // report time
        if(i%300000==0) {
            // console.log('report time')
            // let continueWatch = await updateWatchingTime(action.pid, 1, 0, i==0?20000:300000, {url: action.playlist_url,keyword: action.description})
            // console.log('updateWatchingTime',continueWatch)
            // let finish = !continueWatch.err && !continueWatch.continue
            // if(finish){
            //     console.log('info','pid: ',action.pid,' finish watch: ',action.playlist_url)
            //     action.playlist_index = 0
            //     await setActionData(action)
            //     return
            // }
            if(Math.random() < 0.3){
                let randomScroll = randomRanger(3,7)
                await userScrollMobile(action.pid, randomScroll)
                await sleep(1000)
                await userScrollMobile(action.pid, -randomScroll)
            }
        }

        await updateActionStatus(action.pid, action.id, 1, action.playlist_url+'_'+i, false)
        action.lastRequest = Date.now()
        await setActionData(action)

        i += sleepTime
    }
    return true
}

async function afterWatchingVideoMobile(action,finishVideo){
    await updateWatchedVideo(action.viewed_ads, action.pid)
    action._total_loop_find_ads += 1
    await setActionData(action)
    if (Number(action.total_loop_find_ads) <= action._total_loop_find_ads) {
        await updateActionStatus(action.pid, action.id, 0,'end playlist')
        return 
    }

    if(action.viewed_ads){
        action.viewed_ads = false
        await setActionData(action)
    }

    await goToLocation(action.pid, 'm.youtube.com/channel_switcher?next=%2Faccount&feature=settings')

    // if(action.url_type == 'playlist'){
    //     if(action.playlist_index < 1 || url.indexOf(action.playlist_url) < 0){
    //         await updateActionStatus(action.pid, action.id, 0,'end playlist')
    //         return
    //     }
    //     else{
    //         if(finishVideo){
    //             // nex video
    //             await nextVideo(action.pid)
    //         }
    //         return
    //     }
    // }

    // if((await getActionData()).action.finish) return

    // action.finish = true
    // await setActionData(action)


    // if(action.after_video && !action.remove_suggest){
    //     action.after_video = false
    //     action.after = true
    //     await setActionData(action)
    //     await userClickRandomVideo(action.pid)
    //     return
    // }
    // else{
    //     // report host app
    //     await updateActionStatus(action.pid, action.id, 0)
    //     return
    // }
}

async function processBrowserFeatureMobile(action){
    if(action.home){
        await sleep(3000)
        let scroll = randomRanger(3,7)
        for(let i = 0; i < scroll; i++){
            await userScrollMobile(action.pid, 10)
            let video = document.querySelector('ytm-single-column-browse-results-renderer a.large-media-item-thumbnail-container[href*="'+action.playlist_url+'"]')
            if(video){
                await userClick(action.pid,action.playlist_url,video)
                return
            }
        }
        if(action.other_videos.length >= CHANNEL_VIDEO_WATCH){
            action.home = false
            await setActionData(action)
            await searchMobile(action.pid,action.video)
        }
        else{
            // find other videos of channel
            if(action.channelName){
                let otherVideos = [...document.querySelectorAll('ytm-single-column-browse-results-renderer a.large-media-item-thumbnail-container')].filter(x => x.nextSibling.querySelector('.ytm-badge-and-byline-item-byline').textContent==action.channelName && !action.other_videos.includes(x.parentElement.parentElement.href.split('v=')[1].split('&')[0]))
                if(otherVideos.length){
                    let otherVideo = otherVideos[randomRanger(0,otherVideos.length-1)]
                    action.other_videos.push(otherVideo.href.split('v=')[1].split('&')[0])
                    await setActionData(action)
                    await userClick(action.pid,otherVideo.href,otherVideo)
                    return
                }
            }
            // search video if no videos of channels
            await searchMobile(action.pid,action.video)
        }
    }
}

async function skipAdsMobile(watchingCheck){
    try{
        if(!watchingCheck) await sleep(2000)
        while (document.querySelector('.ytp-ad-skip-ad-slot')) {
            console.log('skip ads mobile')

            let remaining = getTimeFromText(document.querySelector('.ytp-ad-duration-remaining').textContent)
            let adPercent = document.querySelector('.ytp-ad-persistent-progress-bar')?parseFloat(document.querySelector('.ytp-ad-persistent-progress-bar').getAttribute("style").split(":")[1]):0
            let adTimeCurrent = adPercent*remaining/(100-adPercent)
            let adTimeDuration = 100*remaining/(100-adPercent)

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
            action.viewed_ads = true
            await setActionData(action)
            await userClick(action.pid, 'button.ytp-ad-skip-button')
            await sleep(2000)
        }
        await userClick(action.pid,'.ytp-unmute:not([style="display: none;"]) .ytp-unmute-icon')
    }
    catch(e){

    }
}

async function LikeOrDisLikeYoutubeVideoMobile(pid, isLike) {
    try {
        const likeBtn = Array.from(document.querySelectorAll("lazy-list .slim-video-metadata-actions c3-material-button"))

        let index
        if(isLike) {
            index = 1
        }else {
            index = 2
        }
        if(likeBtn.length > 1) {
            await userClick(pid,`lazy-list .slim-video-metadata-actions c3-material-button:nth-of-type(${index}) button[aria-pressed="false"]`)
            console.log(index==0?'like':'dislike'+ 'OK')
        }else {
            console.log("like & dislike button not available")
        }

    }catch (e) {
        console.log("LikeOrDisLikeYoutubeVideo pid: ", pid, " err: ", e)
    }
}

async function CommentYoutubeVideoMobile(pid, msg) {       // search video or view homepage
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

    //     await userScrollMobile(pid,70)

    //     if(document.querySelector('.comment-section-header-text')){
    //         await userClick(action.pid,'.comment-section-header-text')
    //         await sleep(1000)
    //         await userClick(action.pid,'button.comment-simplebox-reply')
    //         await userType(action.pid,'textarea.comment-simplebox-reply',msg)
    //         await sleep(1000)
    //         await userClick(action.pid,'.comment-simplebox-buttons c3-material-button:nth-of-type(2) button')
    //     }
    //     else{
    //         console.log('error','NO COMMENT SECTION')
    //         return
    //     }

    // }catch (e) {
    //     console.log('error','CommentYoutubeVideo',pid)
    // }
}

async function clickPlayIfPauseMobile(pid) {
    console.log('clickPlayIfPauseMobile')
    let btnPlay = document.querySelector('path[d="M18.667 11.667v32.666L44.333 28z"],path[d="M6,4l12,8L6,20V4z"]')
    if (btnPlay) {
        console.log('info','clickPlayIfPauseMobile')
        await userClick(pid,'path[d="M18.667 11.667v32.666L44.333 28z"],path[d="M6,4l12,8L6,20V4z"]')
    }
}

async function searchMobile(pid,keyword){
    await userScrollMobile(pid,-1)
    await userClick(pid,'button.topbar-menu-button-avatar-button')
    await sleep(1000)
    await userOnlyTypeEnter(pid,'input.searchbox-input',keyword)
}

async function processDeleteHistoryMobile(action){
    try{
        let historyPrivacy = document.querySelector('ytm-settings ytm-setting-generic-category:nth-of-type(2)')
        await userClick(action.pid,'ytm-settings ytm-setting-generic-category:nth-of-type(2)',historyPrivacy)
        await sleep(3000)
        let clearHistory = historyPrivacy.querySelector('ytm-setting-action-renderer')
        await userClick(action.pid,'ytm-settings ytm-setting-generic-category:nth-of-type(2) ytm-setting-action-renderer',clearHistory)
        await sleep(3000)
        await userClick(action.pid,'.dialog-buttons c3-material-button[data-style="STYLE_BLUE_TEXT"]')
        await sleep(3000)
    }
    catch(e){
        console.log('error',e)
    }
    finally{
        await goToLocation(action.pid,'m.youtube.com//')
    }
}