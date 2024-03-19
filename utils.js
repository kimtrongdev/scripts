const path = require('path')
const rq = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs')
let config
try{
    config = require('./config.json')
}
catch (e) {
    config = {vm_id:2}
}
const execSync = require('child_process').execSync;
var pseudoRandom = Math.random;

var visaPrefixList = []

module.exports = {
    ACTION: {
        WATCH: 0,
        WATCH_TO_SUB: 1,
        SUB: 2,
        ADD_NEW: 3
    },
    getRndInteger: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    log: (...pr) => {
        if (DEBUG) {
            console.log(...pr)
        }
    },
    nvl: function nvl(val) {
        return val?val:''
    },
    arrayRemove: function(array, item){
        let index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
    },
    randomRanger: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(function () {
            resolve('ok')
        }, ms));
    },
    screenshot: async function(pid){
        if (!DEBUG) {
            return
        }
        try{
            let fullPath = path.resolve('screen',pid+'_'+(+ new Date())+'.jpg')
            // console.log('screenshot: ', fullPath)
            if(WIN_ENV){
                execSync('call screenCapture ' + fullPath)
            }
            else{
                // execSync('import -window root ' + fullPath)
            }
            // await page.screenshot({path: fullPath})
        }
        catch (e) {
            console.log('error','screenshot: ', pid, 'err: ', e)
        }
    },
    errorScreenshot: async function(fileName){
        if (!DEBUG) {
            return
        }
        try{
            if (is_show_ui) {
                return
            }
            let fullPath = path.join('error',fileName+'_'+(+ new Date())+'.jpg')
            console.log('errorScreenshot: ', fullPath)
            if(WIN_ENV){
                execSync('call screenCapture ' + fullPath)
            }
            else{
                execSync('import -window root ' + fullPath)
            }
            // await page.screenshot({path: fullPath})
        }
        catch (e) {
            console.log('error','errorScreenshot: ', fileName, 'err: ', e)
        }
    },
    logScreenshot: async function(fileName){
        if (!IS_LOG_SCREEN) {
            return
        }
        try{
            let images = fs.readdirSync('logscreen/')
            if (images.length > 60) {
                let count = 0
                for (let fileName of images) {
                    if (count < 20) {
                        fs.unlinkSync('logscreen/' + fileName)
                    }
                    count++ 
                }
            }
            
            let fullPath = path.join('logscreen',fileName+'_'+(+ new Date())+'.jpg')
            console.log('Screenshot: ', fullPath)
            if(WIN_ENV){
                execSync('call screenCapture ' + fullPath)
            }
            else{
                execSync('import -window root ' + fullPath)
            }
            // await page.screenshot({path: fullPath})
        }
        catch (e) {
            console.log('error','errorScreenshot: ', fileName, 'err: ', e)
        }
    },
    checkVideoErr: async function(page, pid){
        let err = await page.$('#ytd-player .ytp-error.ytp-controls-on-error')
        if(err){
            console.log('error','pid: ', pid, ' video err: ', page.url(), await page.evaluate(x => x.textContent,err))
            return true
        }
        else{
            return false
        }
    },

    isLastVideo: function(url){
        return url.indexOf('&index=1') + 8 == url.length
    },

    nextVideoErr: async function(page, pid){
        try{
            let html = await rq({uri: page.url()})
            const $ = cheerio.load(html)
            let controls = $('.playlist-behavior-controls a')
            if(controls.length >= 2){
                let next = $(controls[1]).attr('href')
                console.log('info', 'pid: ', pid, ' next video: ', next)
                if(!this.isLastVideo(next)){
                    await page.goto('https://www.youtube.com' + next)
                    await page.waitFor(5000)
                    return true
                }
                else{
                    console.log('info','pid: ', pid, ' last video of playlist: ', next)
                    return false
                }
            }
            else{
                return false
            }
        }
        catch (e) {
            console.log('error', 'pid: ', pid, ' nextVideoErr: ', e)
            return false
        }
    },
    clickPlayIfPause: async function(page) {
        let btnPlay = await page.$("button[title='Pause (k)']")
        if (btnPlay == null) {
            let containers = await page.$$('#ytd-player')
            if (containers.length > 0) {
                await containers[0].click()
            }
        }
    },
    getPlaylistInfo: async function(pid, url){
        try{
            if(url.indexOf('https://www.youtube.com/watch') > -1 && url.indexOf('&list=') > -1){
                let index = '1'
                let indexPos = url.indexOf('&index=')
                if(indexPos > -1){
                    index = url.substr(indexPos+'&index='.length)
                    let otherParam = index.indexOf('&')
                    if(otherParam > -1){
                        index = index.substr(0,otherParam)
                    }
                }
                else{
                    return {playlist: true, index: index, last: false}
                }
                let html = await rq({uri: url})
                const $ = cheerio.load(html)
                let controls = $('.playlist-behavior-controls a')
                if(controls.length >= 2){
                    let next = $(controls[1]).attr('href')
                    if(this.isLastVideo(next)){
                        return {playlist: true, index: index, last: true}
                    }
                    else{
                        return {playlist: true, index: index, last: false}
                    }
                }
                else{
                    console.log('error','playlist-behavior-controls not found: ', url)
                    return {playlist: false}
                }
            }
            else{
                return {playlist: false}
            }
        }
        catch (e) {
            console.log('error','getPlaylistInfo: ', e)
            throw e
        }
    },
    getPlaylistPageInfo: async function(pid, page){
        try{
            let url = page.url()
            if(url.indexOf('https://www.youtube.com/watch') > -1 && url.indexOf('&list=') > -1){
                let urlId = url.substr(url.indexOf('&list=')+'&list='.length)
                let nextParam = urlId.indexOf('&')
                if(nextParam > -1){
                    urlId = urlId.substr(0, nextParam)
                }
                await page.waitForSelector('#wc-endpoint',{timeout:3000})
                let pl = await page.$$eval('#wc-endpoint > #container > #index',es => es.map(e => e.textContent))
                let current = '▶'
                let plLength = pl.length
                for(let i=0;i<plLength;i++){
                    if(pl[i]==current){
                        return {url: urlId, index: i+1, last: i==plLength-1}
                    }
                }
            }
            else{
                return {url: null}
            }
        }
        catch (e) {
            console.log('error','getPlaylistPageInfo: ', e)
            return {url: null}
        }
    },
    getPlaylistPageInfoMobile: async function(pid, page){
        try{
            let url = page.url()
            if(url.indexOf('youtube.com/watch') > -1 && url.indexOf('&list=') > -1){
                // get video info
                // let videoInfo = await this.getVideoInfo(pid, page)
                let videoInfo = null

                let urlId = url.substr(url.indexOf('&list=')+'&list='.length)
                let nextParam = urlId.indexOf('&')
                if(nextParam > -1){
                    urlId = urlId.substr(0, nextParam)
                }

                await page.waitForSelector('.playlist-panel-header-subhead',{timeout:3000})
                let index = await page.$eval('.playlist-panel-header-subhead',e => e.childNodes[0].nodeValue)
                if(!index) return {url: null}
                index = index.split('/')
                let current = parseInt(index[0])
                let last = parseInt(index[1])

                return {url: urlId, index: current, last: current==last, video: videoInfo}
            }
            else{
                return {url: null}
            }
        }
        catch (e) {
            console.log('error','pid:',pid,'getPlaylistPageInfo: ', e)
            return {url: null}
        }
    },
    getIp: async function(pid){
        console.log('pid: ', pid, ' rr ip')
        return ''
    },
    pageAuthen: async function(pid,page){
        let ip = await this.getIp(pid)
        console.log('info','pid: ',pid, ' sub ip: ', ip)

        // await page.authenticate({username : 'lum-customer-antztek-session-'+rand+'-zone-zone3-country-us', password : '123123'})
        await page.authenticate({username : 'lum-customer-antztek-zone-zone3-ip-'+ip, password : '123123'})
        return ip
    },
    getVideoInfo: async function(pid,page){
        try{
            let menu = await page.$('ytm-menu button')
            if(!menu) return null
            await menu.click()
            await page.waitFor(1000)

            let items = await page.$$('#menu > div > ytm-menu-item button')
            if(!items || !items.length) return null
            await items[0].click()
            await page.waitFor(1000)

            let buttons = await page.$$('.dialog-container > c3-dialog > .dialog-body > ytm-menu-item > button')
            if(!buttons || !buttons.length) return null
            await buttons[0].click()
            await page.waitFor(1000)

            let debug = await page.$$eval('textarea.player-debug-info',es => es.map(e => e.textContent))
            if(!debug || !debug.length) return null
            debug = JSON.parse(debug[0])

            let id = debug.docid
            let currentTime = parseInt(debug.lct)

            // close dialog
            let dialogButtons = await page.$$('.dialog-buttons button')
            if(dialogButtons && dialogButtons.length>=2){
                await dialogButtons[1].click()
            }

            console.log('pid: ', pid, ' video: ', id, ' current time: ', currentTime)
            return {id: id, lct: currentTime}
        }
        catch (e) {
            console.log('error','pid: ',pid, 'getVideoInfo: ', e)
            return null
        }
    },
    changeMobQuality: async function(pid,page){
        try{
            let mute = await page.$('button.ytp-unmute')
            if(mute){
                await page.evaluate(x => x.click(),mute)
                await page.waitFor(2000)
            }

            let menu = await page.$('ytm-menu button')
            if(!menu) return null
            await menu.click()
            await page.waitFor(1000)

            let items = await page.$$('#menu > div > ytm-menu-item button')
            if(!items || !items.length) return null
            await items[0].click()
            await page.waitFor(1000)

            await page.select('.dialog-container ytm-select.player-quality-settings select','tiny')
            await page.waitFor(1000)

            // close dialog
            let dialogButtons = await page.$$('.dialog-buttons button')
            if(dialogButtons && dialogButtons.length>=1){
                await dialogButtons[0].click()
            }
        }
        catch (e) {
            console.log('error','pid: ',pid, 'changeMobQuality: ', e)
            return null
        }
    },
    searchYoutube: async function(pid,page,keyword,retry){
        try{
            await page.goto(!retry?"https://m.youtube.com/":"https://m.youtube.com/feed/trending")

            await page.waitFor('button[aria-label^="Search"]')
            await page.$$eval('button[aria-label^="Search"]', elements => elements[1].click());

            await page.waitFor("input.searchbox-input")
            await page.waitFor(1000)

            const search = await page.$("input.searchbox-input")
            await search.type(keyword, {delay: 40})
            await search.type(String.fromCharCode(13));

            await page.waitForSelector('a.compact-media-item-metadata-content',{timeout:5000});
            await page.waitFor(3000)
        }
        catch (e) {
            console.log('error','pid: ',pid,'searchYoutube: ',page.url(),e)
            if(!retry){
                await this.searchYoutube(pid,page,keyword,true)
            }
            else{
                throw e
            }
        }
    },
    strrev: function strrev(str) {
        if (!str) return '';
        var revstr='';
        for (var i = str.length-1; i>=0; i--)
            revstr+=str.charAt(i)
        return revstr;
     },
    completed_number: function completed_number(prefix, length) {

        var ccnumber = prefix;
    
        // generate digits
    
        while ( ccnumber.length < (length - 1) ) {
            ccnumber += Math.floor(pseudoRandom()*10);
        }
    
        // reverse number and convert to int
    
        var reversedCCnumberString = this.strrev( ccnumber );
    
        var reversedCCnumber = new Array();
        for ( var i=0; i < reversedCCnumberString.length; i++ ) {
            reversedCCnumber[i] = parseInt( reversedCCnumberString.charAt(i) );
        }
    
        // calculate sum
    
        var sum = 0;
        var pos = 0;
    
        while ( pos < length - 1 ) {
    
            var odd = reversedCCnumber[ pos ] * 2;
            if ( odd > 9 ) {
                odd -= 9;
            }
    
            sum += odd;
    
            if ( pos != (length - 2) ) {
    
                sum += reversedCCnumber[ pos +1 ];
            }
            pos += 2;
        }
    
        // calculate check digit
    
        var checkdigit = (( Math.floor(sum/10) + 1) * 10 - sum) % 10;
        ccnumber += checkdigit;
    
        return ccnumber;
    
    },
    credit_card_number: function credit_card_number(prefixList, length, howMany) {
    
        var result = new Array();
        for (var i = 0; i < howMany; i++) {
    
            var randomArrayIndex = Math.floor(pseudoRandom() * prefixList.length);
            var ccnumber = prefixList[ randomArrayIndex ];
            result.push( this.completed_number(ccnumber, length) );
        }
    
        return result;
    },
    Schemes : {
        "VISA": {
            prefixList: visaPrefixList,
            digitCount: 16
        }
    },
    GenCC : function(CardScheme, howMany, randomGen){
        pseudoRandom = randomGen || pseudoRandom;
        var amount = howMany || 1;
        // Try to get configs to the selected Scheme
        if (typeof this.Schemes[CardScheme] != 'undefined') {
            return this.credit_card_number(
                this.Schemes[CardScheme].prefixList,
                this.Schemes[CardScheme].digitCount,
                amount
            );
        }
        else { // Defaults to MasterCard
            return this.credit_card_number(
                visaPrefixList,
                16,
                amount
            );
        }
    },
    shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }
}