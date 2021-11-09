const SUB_LIKE_PERCENT = 0.05

const SUB_STATUS = {
    PENDING: 0,
    ERROR: -1,
    SUCCESS: 1,
    RESUB: 2,
    NOT_INCREASE: 3
}

async function userSub(action){
    try{
        console.log('start sub')
        let url = window.location.toString()

        if (url == 'https://www.youtube.com/') {
            await processSubHomePage(action)
        } else if (url.indexOf('https://www.youtube.com/results?search_query') > -1) {
            await processSubSearchPage(action)
        }
        else if(url.indexOf('https://www.youtube.com/watch') > -1){
            await processSubWatchPage(action)
        }
        else if(url.indexOf('https://www.youtube.com/user') > -1 || url.indexOf('https://www.youtube.com/channel') > -1){
            await processSubUserPage(action)
        }
        else if(url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1){
            throw 'NOT_LOGIN'
        }
    }
    catch (e) {
        console.log('error','userSub',e)
        await subStatusReport(action.pid,action.channel_id,action.vmId,SUB_STATUS.ERROR,null,null,e.toString().substr(0, 255))
        await updateActionStatus(action.pid, action.id, 0, e.toString())
    }
}

async function processSubHomePage(action) {
    if(action.sub_direct){
        let url = action.c_url
        if(url.indexOf('https://www.youtube.com')<0){
            url = 'https://www.youtube.com/' + (url.slice(0,2)=='UC' && url.length == 24 ? 'channel/': 'user/') + url
        }
        await goToLocation(action.pid,url)
    }
    else{
        await checkLogin(action)
        await userTypeEnter(action.pid,'input#search',action.sub_from_suggest?action.keywords:(action.name && action.name != "")?action.name:action.keywords)
    }
}

async function processSubSearchPage(action) {
    let url = window.location.toString()
    let channelId = action.keywords
    let channelSelector = 'a.ytd-channel-renderer[href*="'+channelId+'"]'
    let channelInVideosSelector = `ytd-two-column-search-results-renderer #meta.ytd-video-renderer #channel-name a[href*="${channelId}"]`
    // scroll
    await userScroll(action.pid, randomRanger(10,20))

    let channelEl = document.querySelector(channelSelector)
    let channelInVideos = Array.from(document.querySelectorAll(channelInVideosSelector))

    if(action.sub_from_suggest && action.videoIds && action.videoIds.length){
        // click random video for suggest
        await userClickRandomVideo(action.pid)
    }
    else if(action.sub_from_suggest && channelInVideos.length){
        // search other keyword
        console.log('sub_from_suggest')
        let videoIds = channelInVideos.map(x => x.closest('#meta').querySelector('a#video-title').href)
        action.videoIds = videoIds
        await setActionData(action)

        // search keyword
        await userTypeEnter(action.pid,'input#search',action.search_keyword)
    }
    else if(action.sub_from_suggest && channelInVideos.length == 0){
        // re-search with channel keyword
        action.sub_from_suggest = undefined
        await setActionData(action)
        await userTypeEnter(action.pid,'input#search',(action.name && action.name != "")?action.name:action.keywords)
    }
    else if(channelInVideos.length && !action.watched_video){
        // click random video of channel
        let videoLinks = channelInVideos.map(x => x.closest('#meta').querySelector('a#video-title'))
        await userClick(action.pid,'a#video-title',videoLinks[randomRanger(0,videoLinks.length-1)])
    }
    else if((channelInVideos.length && action.go_channel_from_search_videos) || !channelEl){
        await userClick(action.pid,channelInVideosSelector,channelInVideos[randomRanger(0,channelInVideos.length-1)])
    }
    else if(channelEl){
        await userClick(action.pid,channelSelector,channelEl)
    }
    else{
        // if filtered, throw error
        if(url.indexOf('253D%253D') > -1){
            throw 'channel not found'
        }
        else{
            // filter by channel
            await userScrollTo(action.pid,'#filter-menu a > #button')
            await sleep(1000)
            await userClick(action.pid, '#filter-menu a > #button')
            await sleep(1000)
            await userClick(action.pid, 'a#endpoint[href*="EgIQAg"]')
        }

        console.log('info','pid: ',action.pid, 'searchChannel not found channel: ', channelId)
        // let correction = '#contents yt-search-query-correction > a.yt-search-query-correction'
        //         // if(document.querySelector(correction)){
        //         //     await userClick(action.pid,correction)
        //         //     await sleep(5000)
        //         //     if(document.querySelector(channelSelector)){
        //         //         await userClick(action.pid,channelSelector)
        //         //     }
        //         //     else{
        //         //         throw 'channel not found'
        //         //     }
        //         // }
        //         // if(document.querySelector(channelSelector)){
        //         //     await userClick(action.pid,channelSelector)
        //         // }
        //         // else{
        //         //     throw 'channel not found'
        //         // }
    }
}

async function processSubWatchPage(action) {
    await sleep(randomRanger(3000,5000))
    // check video of channel
    if(document.querySelector('ytd-video-owner-renderer > a[href*="'+action.keywords+'"]')){
        action.watched_video = true

        // get video time
        let time = document.querySelector('.ytp-time-duration').textContent.split(':')
        time = time[0]*60+time[1]*1
        time = time>180?180:time
        time = time*1000*randomRanger(80,90)/100
        // watch to like video
        let beforeLike = time*randomRanger(30,80)/100
        await sleep(beforeLike)
        // like video
        if(Math.random() < SUB_LIKE_PERCENT){
            await LikeOrDisLikeYoutubeVideo(action.pid,true)
        }

        await sleep(time-beforeLike)

        if(action.sub_in_video){
            // get pre sub
            let preSub = document.querySelector('#top-row #owner-sub-count').textContent
            preSub = parseInt(preSub.replace(/\.|,/g,''))
            action.pre_sub = preSub?preSub:0
            await setActionData(action)

            await subInVideo(action)
        }
        else{
            await userClick(action.pid,'ytd-video-owner-renderer > a[href*="'+action.keywords+'"]')
        }
    }
    else if(action.sub_from_suggest && action.videoIds && action.videoIds.length){
        // watch video for suggest
        console.log('sub_from_suggest')
        action.sub_from_suggest = undefined
        action.lastRequest = Date.now()
        await setActionData(action)
        await skipAds()
        await sleep(randomRanger(30000, 90000))
        let randomNext = randomRanger(1,4)
        let nextSelector = `ytd-watch-next-secondary-results-renderer > #items .ytd-watch-next-secondary-results-renderer:nth-child(${randomNext})`
        let next = document.querySelector(nextSelector)
        next.insertAdjacentHTML('beforebegin', '<ytd-compact-video-renderer class="style-scope ytd-watch-next-secondary-results-renderer" lockup="" thumbnail-width="168">  <div id="dismissable" class="style-scope ytd-compact-video-renderer"> <ytd-thumbnail use-hovered-property="" class="style-scope ytd-compact-video-renderer">  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true" tabindex="-1" rel="nofollow" href="/watch?v=abcabcabcde"> <yt-img-shadow class="style-scope ytd-thumbnail no-transition" loaded="" style="background-color: transparent;"><img id="img" class="style-scope yt-img-shadow" alt="" width="168" src="https://i.ytimg.com/vi/dpGYmYC3p0I/hqdefault.jpg?sqp=-oaymwEYCKgBEF5IVfKriqkDCwgBFQAAiEIYAXAB&amp;rs=AOn4CLDAbX4Gl4f75wtg594Ix2Hla7Epxw"></yt-img-shadow>  <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer class="style-scope ytd-thumbnail" overlay-style="DEFAULT"><yt-icon class="style-scope ytd-thumbnail-overlay-time-status-renderer" disable-upgrade="" hidden=""></yt-icon><span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="1 hour, 14 minutes"> 1:14:08 </span></ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer class="style-scope ytd-thumbnail">  <span class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now playing</span> </ytd-thumbnail-overlay-now-playing-renderer></div> <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div> <div id="hover-overlays" class="style-scope ytd-thumbnail"></div> </a> </ytd-thumbnail> <div class="details style-scope ytd-compact-video-renderer"> <div class="metadata style-scope ytd-compact-video-renderer"> <a class="yt-simple-endpoint style-scope ytd-compact-video-renderer" rel="nofollow" href="/watch?v=abcabcabcde"> <h3 class="style-scope ytd-compact-video-renderer"> <ytd-badge-supported-renderer class="style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> <span id="video-title" class="style-scope ytd-compact-video-renderer" aria-label="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava by Dave and Ava - Nursery Rhymes and Baby Songs 3 years ago 1 hour, 14 minutes 22,960,714 views" title="ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava"> ABC Song |ABC Songs Plus More Nursery Rhymes! |Alphabet Collection and Baby Songs from Dave and Ava </span> </h3> <div class="secondary-metadata style-scope ytd-compact-video-renderer"> <ytd-video-meta-block class="compact style-scope ytd-compact-video-renderer" no-endpoints="">    <div id="metadata" class="style-scope ytd-video-meta-block"> <div id="byline-container" class="style-scope ytd-video-meta-block"> <ytd-channel-name id="channel-name" class="style-scope ytd-video-meta-block">  <div id="container" class="style-scope ytd-channel-name"> <div id="text-container" class="style-scope ytd-channel-name"> <yt-formatted-string id="text" title="" class="style-scope ytd-channel-name" ellipsis-truncate="">Dave and Ava - Nursery Rhymes and Baby Songs</yt-formatted-string> </div> <paper-tooltip offset="10" class="style-scope ytd-channel-name" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Dave and Ava - Nursery Rhymes and Baby Songs </div> </paper-tooltip> </div> <ytd-badge-supported-renderer class="style-scope ytd-channel-name">   <div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer"> <yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10 S17.52,2,12,2z M9.92,17.93l-4.95-4.95l2.05-2.05l2.9,2.9l7.35-7.35l2.05,2.05L9.92,17.93z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon> <span class="style-scope ytd-badge-supported-renderer"></span> <paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1">  <div id="tooltip" class="hidden style-scope paper-tooltip"> Verified </div> </paper-tooltip></div> <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat> </ytd-badge-supported-renderer> </ytd-channel-name> <div id="separator" class="style-scope ytd-video-meta-block">•</div> </div> <div id="metadata-line" class="style-scope ytd-video-meta-block">  <span class="style-scope ytd-video-meta-block">22M views</span>  <span class="style-scope ytd-video-meta-block">3 years ago</span> <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div> </div> <div id="additional-metadata-line" class="style-scope ytd-video-meta-block"> <dom-repeat class="style-scope ytd-video-meta-block"><template is="dom-repeat"></template></dom-repeat> </div>  </ytd-video-meta-block> <ytd-badge-supported-renderer class="badges style-scope ytd-compact-video-renderer" disable-upgrade="" hidden=""> </ytd-badge-supported-renderer> </div> </a> <div id="buttons" class="style-scope ytd-compact-video-renderer"></div> </div> <div id="menu" class="style-scope ytd-compact-video-renderer"><ytd-menu-renderer class="style-scope ytd-compact-video-renderer">  <div id="top-level-buttons" class="style-scope ytd-menu-renderer"></div> <yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" hidden="">   <button id="button" class="style-scope yt-icon-button">  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path> </g></svg>   </yt-icon>  </button>  </yt-icon-button> </ytd-menu-renderer></div> <div id="queue-button" class="style-scope ytd-compact-video-renderer"></div> </div> </div> <div id="dismissed" class="style-scope ytd-compact-video-renderer"></div> </ytd-compact-video-renderer>')
        next.previousElementSibling.querySelector('a').href = action.videoIds[randomRanger(0,action.videoIds.length-1)]
        await userClick(action.pid, `${nextSelector} a#thumbnail`)
    }
    else{
        // go youtube home
        await userClick(action.pid,'#container a#logo')
    }
}

async function processSubUserPage(action) {
    console.log('processSubUserPage')
    let url = window.location.toString()
    if(url.indexOf(action.keywords)<0){
        // not in user channel
        // go youtube home
        await userClick(action.pid,'#container a#logo')
        return
    }
    if(!action.watched_video){
        // check videos page
        if(url.indexOf('videos')<0){
            // click videos tab
            if(document.querySelector('#tabsContent > paper-tab:nth-of-type(2)')){
                await userClick(action.pid,'#tabsContent > paper-tab:nth-of-type(2)')
            }
            else if(document.querySelector('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
                await userClick(action.pid,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
            }
            else{
                // sub channel
                await subInChannel(action)
            }
        }
        else{
            // click random video
            if(document.querySelector('#content a#thumbnail[href*="watch"]')){
                await userClickRandomVideo(action.pid)
            }
            else{
                action.watched_video = true
                await setActionData(action)
                // sub channel
                await subInChannel(action)
            }
        }
    }
    else{
        if(action.sub_in_videos_page){
            action.sub_in_videos_page = false
            await setActionData(action)
            if(url.indexOf('videos')<0){
                // click videos tab
                if(document.querySelector('#tabsContent > paper-tab:nth-of-type(2)')){
                    await userClick(action.pid,'#tabsContent > paper-tab:nth-of-type(2)')
                }
                else if(document.querySelector('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
                    await userClick(action.pid,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
                }
                else{
                    // sub channel
                    await subInChannel(action)
                }
            }
        }
        else{
            // sub channel
            await subInChannel(action)
        }
    }
}

async function subInVideo(action) {
    if(action.restart_sub){
        setSubParam(action)
        await setActionData(action)
        // go youtube home
        await userClick(action.pid,'#container a#logo')
        return
    }
    let subButtonSelector = '#top-row #subscribe-button paper-button.ytd-subscribe-button-renderer'
    if(!document.querySelector(subButtonSelector+'[subscribed]')){
        // sub
        await userClick(action.pid,subButtonSelector)
        // go to channel
        await sleep(2000)
        await userClick(action.pid,'ytd-video-owner-renderer > a[href*="'+action.keywords+'"]')
    }
    else{
        // already sub
        await reportSubResult(action,SUB_STATUS.NOT_INCREASE, null,null,'SUBSCRIBED')
    }
}

async function subInChannel(action) {
    console.log('subInChannel')
    if(action.pre_sub || action.pre_sub == 0){
        // get post sub
        let postSub = document.querySelector('#channel-header-container #subscriber-count').textContent
        postSub = parseInt(postSub.replace(/\.|,/g,''))
        postSub = postSub?postSub:0
        if(postSub>action.pre_sub){
            await reportSubResult(action,SUB_STATUS.SUCCESS, action.pre_sub,postSub)
        }
        else{
            await reportSubResult(action,SUB_STATUS.NOT_INCREASE, action.pre_sub,postSub)
        }
    }
    else{
        let subButtonSelector = '#channel-header-container #subscribe-button paper-button.ytd-subscribe-button-renderer'
        if(!document.querySelector(subButtonSelector+'[subscribed]')){
            let preSub = document.querySelector('#channel-header-container #subscriber-count').textContent
            preSub = parseInt(preSub.replace(/\.|,/g,''))
            action.pre_sub = preSub?preSub:0
            await setActionData(action)

            await userClick(action.pid,subButtonSelector)
            // reload
            await sleep(2000)
            await goToLocation(action.pid,window.location.toString())
        }
        else{
            // already sub
            await reportSubResult(action,SUB_STATUS.NOT_INCREASE, null,null, 'SUBSCRIBED')
        }
    }
}

async function reportSubResult(action, status, preSub, postSub, msg){
    await subStatusReport(action.pid,action.channel_id,action.vmId,status,preSub,postSub,msg)

    msg = preSub||preSub==0?action.channel_id+': '+preSub+' > '+postSub:'SUBSCRIBED'
    // check remain channels to sub
    action.channels.shift()
    if(action.channels.length){
        setSubParam(action)
        await setActionData(action)
        await updateActionStatus(action.pid, action.id,1,msg,false)
        // go youtube home
        await userClick(action.pid,'#container a#logo')
    }
    else{
        await updateActionStatus(action.pid, action.id,1,msg)
    }
}