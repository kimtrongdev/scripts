// const puppeteer = require('puppeteer-extra');
// const puppeteer = require('puppeteer-firefox');
const utils = require('./utils');
const fs = require('fs-extra')
const login = require('./login_mobile')
const del = require('del');
const path = require('path');
const rq = require('request-promise')
// const sub = require('./sub')
// const redis = require('./redis')
const request_api = require('./request_api')
// const main = require('./main')
const publicIp = require('public-ip');
const reading = require('./reading')
const workingDir = __dirname



async function test1(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
    // await page.authenticate({username : "proxyclient", password : "123456"});

    await page.setViewport({
        width: 1280,
        height: 720
    })

    await page.goto('https://www.youtube.com/watch?v=90qbfPtVpb4&list=PL1BDF7A3F16AC7BD5&index=2', {waitUntil: 'networkidle2'});
    // await page.goto('https://www.youtube.com/results?search_query=arya&sp=EgIQAw%253D%253D', {waitUntil: 'networkidle2'});

    // await page.waitFor(10000)
    await page.screenshot({path: '1.jpg'})

    let text1 = await page.$('#ytd-player .ytp-error.ytp-controls-on-error')
    while(text1){
        console.log('video err: ', page.url())
        console.log(await page.evaluate(x => x.textContent,text1))

        let rs = await utils.nextVideoErr(page)
        if(!rs) break
        text1 = await page.$('#ytd-player .ytp-error.ytp-controls-on-error')
    }
    await page.screenshot({path: '1_next.jpg'})

    await page.goto('https://www.youtube.com/watch?v=noplB8y9Vc8', {waitUntil: 'networkidle2'});
    // await page.goto('https://www.youtube.com/results?search_query=arya&sp=EgIQAw%253D%253D', {waitUntil: 'networkidle2'});

    // await page.waitFor(5000)
    await page.screenshot({path: '2.jpg'})

    let text2 = await page.$('#ytd-player .ytp-error.ytp-controls-on-error')

    if(text2)
        console.log(await page.evaluate(x => x.textContent,text2))

    await browser.close();
}

async function testLoginSetlanguage(){
    let workingDir = __dirname
    let profile = {
        id: 131,
        email: 'peehendow@gmail.com',
        password: '23Bi@@8FdD3$@1@',
        recover_mail: 'f4hlij11e2g5e12371fc@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    try{


        if (!fs.existsSync('test')){
            fs.mkdirSync('test');
        }

        const pluginStealth = require("puppeteer-extra-plugin-stealth")
        puppeteer.use(pluginStealth())
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            userDataDir : path.join(workingDir,'test',profile.id+'')});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
        // await page.authenticate({username : "proxyclient", password : "123456"});

        await page.setViewport({
            width: 1280,
            height: 720
        })

        let loginRs = await login.login(page, profile.email, profile.password, profile.recover_mail)
        if(loginRs.status=='ok') {
            await page.screenshot({path: '131_login_ok.jpg'})
            // set language

            await settingLanguage(page, profile.id)

            await page.goto('https://www.youtube.com/watch?v=N8AZoeLzLMo&list=PL1BDF7A3F16AC7BD5&index=1')
            await page.waitFor(5000)
            await utils.clickPlayIfPause(page)
            await page.waitFor(5000)

            await page.screenshot({path: '131_video.jpg'})

        }
        else{
            console.log('error: ', 'login error')
        }

        await browser.close()
    }
    catch (e) {
        console.log('error', ' ', e)
    }
    finally {
    }
}

async function settingLanguage(page, pid) {
    try{
        await page.goto('https://www.youtube.com/')
        await page.waitFor(5000)

        let links = await page.$$('a#video-title')

        if(links.length){
            await links[utils.randomRanger(0,links.length-1)].click()
            await page.waitFor(5000)
            await page.screenshot({path: '131_first.jpg'})
        }

        await page.goto('https://www.youtube.com/dashboard?o=U&ar=2')
        await page.waitFor(5000)
        // setting language
        const elementLanguage = await page.$("#yt-picker-language-button")
        const textLanguage = await page.evaluate(element => element.textContent, elementLanguage);
        if(textLanguage.indexOf("English") == -1) {
            console.log('info', 'pid: ', pid, ' change language')
            await page.click("#yt-picker-language-button")
            await page.waitFor(2000)
            if(await page.$("button[value='en']") != null) {
                await page.click("button[value='en']")
                await page.waitFor(5000)
            }
            else{
                console.log('error','pid: ', pid, ' english button not found')
            }
        }
    }
    catch (e) {
        console.log('error', 'pid: ', pid, ' settingLanguage err: ',e)
    }
}

async function CommentYoutubeVideo(pid, page) {       // search video or view homepage
    try {
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

        await page.waitFor("#placeholder-area")
        await page.waitFor(2000)

        const cmtBox1 = await page.$("#placeholder-area")
        await cmtBox1.click()

        await page.waitFor("#contenteditable-textarea")
        await page.waitFor(2000)

        await page.screenshot({path: '131_b_comment.jpg'})

        let msg = ''

        let comments = await page.$$eval('#content-text', es => es.map(e=>e.textContent))
        console.log('comments: ',comments)
        if(comments && comments.length >= 5){
            let i=0
            let c = []
            while(c.length<utils.randomRanger(2,3) && i<5){
                let m = comments[utils.randomRanger(2,comments.length-1)]
                if(m!=c[0]&&m.length<200){
                    c.push(m)
                }
            }
            if(c.length) msg = c.join('\n')
        }

        console.log('msg to comment: ', msg)

        // if(msg){
        //     const cmtBox = await page.$("#contenteditable-textarea")
        //     await cmtBox.type(msg, {delay : 30})
        //
        //     await page.waitFor("#submit-button.ytd-commentbox")
        //     await page.waitFor(2000)
        //     const cmtSubmit = await page.$("#submit-button.ytd-commentbox")
        //     await cmtSubmit.click()
        //     await page.waitFor(2000)
        // }

        await page.waitFor(2000)    // TODO: 2 lan wait 2s?
        await page.evaluate(_ => {

            // window.scrollTo(0,0)

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

        await page.screenshot({path: '131_a_comment.jpg'})

    }catch (e) {
        console.log('CommentYoutubeVideo pid: ', pid, ', err: ', e)
    }
}

async function testComment(){
    let workingDir = __dirname
    let profile = {
        id: 131,
        email: 'peehendow@gmail.com',
        password: '23Bi@@8FdD3$@1@',
        recover_mail: 'f4hlij11e2g5e12371fc@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    try {


        if (!fs.existsSync('test')) {
            fs.mkdirSync('test');
        }

        let userDir = path.join(workingDir, 'test', profile.id + '')
        console.log('userDir: ', userDir)

        const pluginStealth = require("puppeteer-extra-plugin-stealth")
        let proxy = 'zproxy.lum-superproxy.io:22225'
        let args = ['--no-sandbox', '--disable-setuid-sandbox','--proxy-server=' + proxy]
        puppeteer.use(pluginStealth())
        const browser = await puppeteer.launch({
            args: args,
            userDataDir: userDir
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
        page.setDefaultTimeout(60000)
        // await page.authenticate({username : "proxyclient", password : "123456"});

        await page.setViewport({
            width: 1280,
            height: 720
        })

        let rand = utils.randomRanger(100,100000)

        await page.authenticate({username : 'lum-customer-antztek-session-'+rand+'-zone-zone2-country-us', password : '123123'})

        // let loginRs = await login.login(page, profile.email, profile.password, profile.recover_mail)
        // console.log('login result: ', loginRs)
        // if(loginRs.status!='ok')
        //     throw 'loi login'

        await page.goto('https://whoer.net')
        await page.waitFor(5000)
        await page.screenshot({path: 'proxy.jpg'})

        await page.goto('https://www.youtube.com/watch?v=N8AZoeLzLMo&list=PL1BDF7A3F16AC7BD5&index=1')
        await page.waitFor(30000)
        await utils.clickPlayIfPause(page)
        await page.waitFor(5000)


        console.log('CommentYoutubeVideo')
        await CommentYoutubeVideo(profile.id, page)

        await browser.close()
    }
    catch (e) {
        console.log('error', e)
    }

}

async function test4(){
    let workingDir = __dirname
    try{
        const pluginStealth = require("puppeteer-extra-plugin-stealth")
        puppeteer.use(pluginStealth())
        const browser = await puppeteer.launch({args: ['--no-sandbox'],
            executablePath: '/usr/bin/google-chrome',
            userDataDir: path.join(workingDir, 'test', '36')});
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
        // await page.authenticate({username : "proxyclient", password : "123456"});

        await page.setViewport({
            width: 1280,
            height: 720
        })

        await page.goto('https://www.youtube.com/watch?v=ecqhdSSi5gY');
        await page.waitFor(5000)
        await utils.clickPlayIfPause(page)

        await page.waitFor(5000)
        await page.screenshot({path: 'live.jpg'})
        await page.waitFor(120000)

        await browser.close()
    }
    catch (e) {
        console.log('error', e)
    }
}


function test5(){
    let a = [1,2,3,4,5,6,7]
    let len = a.length
    for(let i = 0; i< len;i++){
        if(a[i]%2==0){
            console.log('filter')
            a = a.filter(x => x != a[i])
            console.log(a)
            len -= 1
            i -= 1
        }
        else{
            console.log('not filter')
        }
    }
    console.log(a)
}

function test6(){
    const SUB_URL = "http://35.229.39.238:3000"
    let pid = [120,127]
    for(let i = 0; i< 2; i++){
        request(pid[i])
    }
}

async function request(pid){
    let rs = await rq({uri: "http://35.229.39.238:3000" + '/playlist/get-sub-channels',json: true, qs: {pid: pid, vmId: 12}})
    // let rs = await rq({uri: "http://35.229.39.238:3000" + '/playlist/test-trans',json: true, qs: {pid: pid, vmId: 12}})
    console.log('pid: ', pid, ' request rs: ', rs)
}

async function testReg(){
    let workingDir = __dirname
    let profile = {
        id: 77,
        email: 'peacelovesunmusic@gmail.com',
        password: '$bGX$6b1H@*3@15',
        recover_mail: '1p515h3knm419f22tgdi@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    if (!fs.existsSync('test')) {
        fs.mkdirSync('test');
    }

    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        userDataDir: path.join(workingDir, 'test', profile.id + '')
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
        // await page.authenticate({username : "proxyclient", password : "123456"});

        await page.setViewport({
            width: 1280,
            height: 720
        })

        // let loginRs = await login.login(page, profile.email, profile.password, profile.recover_mail)
        // console.log('login result: ', loginRs)
        // if(loginRs.status!='ok')
        //     throw 'loi login'

        await page.goto('https://www.youtube.com/channel/UCbAc_1A0T6qz0VN_ceSgrZw')
        await page.waitFor(5000)
        await page.screenshot({path: 'pre_register.jpg'})

        const subBtn = await page.$$("paper-button.ytd-subscribe-button-renderer")
        const subscribeds = await page.$$eval("paper-button.ytd-subscribe-button-renderer", es => es.map(e=>e.hasAttribute('subscribed')))

        let preSub = await page.$eval('#subscribe-button > ytd-subscribe-button-renderer > paper-button[subscribed] > yt-formatted-string > span', e => e.textContent)
        console.log('preSub: ', preSub)

        if (subBtn.length > 0)  {
            if(!subscribeds[0]) {
                await subBtn[0].click()
                await page.waitFor(utils.randomRanger(3, 5) * 1000)
            }
        }

        await page.screenshot({path: 'register.jpg'})
        await page.waitFor(5000)

        await page.reload()
        await page.waitFor(5000)

        let postSub = await page.$eval('#subscribe-button > ytd-subscribe-button-renderer > paper-button[subscribed] > yt-formatted-string > span', e => e.textContent)
        console.log('postSub: ', postSub)

        await page.screenshot({path: 'register_reload.jpg'})



    }
    catch (e) {
        console.log('test7 err: ', e)
    }
    finally {
        await browser.close()
    }
}

async function testProxy(){
    let workingDir = __dirname

    let profile = {
        id: 116,
        email: 'amberphillips623@gmail.com',
        password: 'K*2blD4@@$C614@',
        recover_mail: 'c14icc32113c1ieb11qd@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    if (!fs.existsSync('test')) {
        fs.mkdirSync('test');
    }

    let profileDir = path.join(workingDir,'test',profile.id+'')
    console.log('profileDir: ',profileDir)

    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    let proxy = 'zproxy.lum-superproxy.io:22225'
    const browser = await puppeteer.launch({
        headless : false,
        ignoreHTTPSErrors : true,
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        // args : ['--no-first-run', '--disable-session-crashed-bubble', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=' + profileDir, '--proxy-server=' + proxy],
        args : ['--no-first-run', '--disable-session-crashed-bubble', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update'],
        // args : ['--no-first-run', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=test', '--proxy-server=socks5://profiles.dominhit.pro:10000'],
        // args : ['--no-first-run', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=' + profileDir],
        ignoreDefaultArgs : true
    });
    try {
        const page = await browser.newPage();
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
        // await page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SAMSUNG SM-G950F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.4 Chrome/59.0.3071.125 Mobile Safari/537.36')

        // let rand = utils.randomRanger(100,100000)
        // await page.authenticate({username : 'lum-customer-antztek-session-'+rand+'-zone-zone3-country-us', password : '123123'})

        // redis.initRedis(7)

        await utils.sleep(5000)

        let ip = await utils.getIp(116)
        console.log('ip: ',ip)

        // await page.authenticate({username : 'lum-customer-antztek-session-'+rand+'-zone-zone3-country-us', password : '123123'})
        await page.authenticate({username : 'lum-customer-antztek-zone-zone3-ip-'+ip, password : '123123'})

        await page.setViewport({
            width: 1280,
            height: 720
        })

        // await main.reLogin(131)

        let channel = {
            channels: [
                {
                    channel_id: 19,
                    c_url: 'https://www.youtube.com/channel/UCYpUGCc_LhEoJbC8L1AozgA'
                }
            ],
            playlist: [],
            action: 2,
            keyword: ['murder on the dancefloor – sophie ellis bexto']
        }

        // await sub.start(profile.id, browser, channel)

        // let loginRs = await login.login(page, profile.email, profile.password, profile.recover_mail)
        // console.log('login result: ', loginRs)
        // if(loginRs.status!='ok')
        //     throw 'loi login'


        await utils.sleep(30*60*1000)

    }
    catch (e) {
        console.log('test7 err: ', e)
    }
    finally {
        await browser.close()
    }
}

async function testAgent() {
    let workingDir = __dirname

    let profile = {
        id: 116,
        email: 'amberphillips623@gmail.com',
        password: 'K*2blD4@@$C614@',
        recover_mail: 'c14icc32113c1ieb11qd@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    if (!fs.existsSync('test')) {
        fs.mkdirSync('test');
    }

    let profileDir = path.join(workingDir, 'test', profile.id + '')
    console.log('profileDir: ', profileDir)

    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    let proxy = 'zproxy.lum-superproxy.io:22225'
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        // args : ['--no-first-run', '--disable-session-crashed-bubble', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=' + profileDir, '--proxy-server=' + proxy],
        args: ['--no-first-run', '--disable-session-crashed-bubble', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update'],
        // args : ['--no-first-run', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=test', '--proxy-server=socks5://profiles.dominhit.pro:10000'],
        // args : ['--no-first-run', '--enable-sync', '--disable-popup-blocking', '--safebrowsing-disable-auto-update', '--user-data-dir=' + profileDir],
        ignoreDefaultArgs: true
    });
    try {
        const agents = ['Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36',
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
            'Mozilla/5.0 (Linux; Android 6.0.1; SM-J700M Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36']

        const views = [{w: 320, h: 480},{w: 480, h: 720}, {w: 640, h: 960}, {w: 720, h: 1280}]

        const page = await browser.newPage();

        for (let i = 0; i < agents.length; i++) {
            await page.setUserAgent(agents[i])
            let view = views[i%views.length]
            await page.setViewport({
                width: view.w,
                height: view.h,
                isMobile: true
            })
            await page.goto('https://www.youtube.com/channel/UC6LHG08Re_bG1DcRhN_lw9w')
            await page.waitFor(5000)
            await page.screenshot({path: path.join(workingDir,'agent',i+'.jpg')})
        }
    }
    catch (e) {
        console.log('error',e)
    }

    finally {
        browser.close()
    }
}

async function testRestore(){
    let profile = {
        id: 116,
        email: 'amberphillips623@gmail.com',
        password: 'K*2blD4@@$C614@',
        recover_mail: 'c14icc32113c1ieb11qd@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    try{
        const util = require('util');
        const exec = util.promisify(require('child_process').exec);
        // const { stdout, stderr } = await exec('rsync --rsh="sshpass -p 123456a@ ssh -p 2222 -o StrictHostKeyChecking=no -l minh_dv118" -avR "./test/" "minh_dv118@35.237.93.218:/home/storage.dominhit.pro/public_html/videos/profilesub"');
        const { stdout, stderr } = await exec('sshpass -p \"123456a@\" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -P 2222 -r \"minh_dv118@35.237.93.218:/home/storage.dominhit.pro/public_html/videos/profilesub/test/'+profile.id+"\""+" " + "./test/117");
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    }
    catch (e) {
        console.log('error','testRestore:', e)
    }
}

async function testLogin(){
    let profile = {
        id: 854,
        email: 'dcmorata@gmail.com',
        password: 'B$@2hI5$$@2V4e8',
        recover_mail: '8fc3egk1c5bb2361q11l@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        userDataDir: path.join(workingDir, 'test', profile.id + '')
    });
    try{
        const page = await browser.newPage();

        let loginResult = await login.login(page, profile.email, profile.password, profile.recover_mail)

        if(page.url().indexOf('accounts.google.com/speedbump/') > -1){
            console.log('verify identity')
        }

        console.log('loginResult: ', loginResult)
    }
    catch (e) {
        console.log('error','testLogin:', e)
    }
    finally {
        await browser.close()
    }
}

async function testSearch(){
    let profile = {
        id: 854,
        email: 'dcmorata@gmail.com',
        password: 'B$@2hI5$$@2V4e8',
        recover_mail: '8fc3egk1c5bb2361q11l@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        executablePath: '/usr/bin/google-chrome',
        userDataDir: path.join(workingDir, 'test', profile.id + '')
    });
    try{
        const page = await browser.newPage();

        await page.goto("https://www.youtube.com/")

        await page.waitFor("#search")
        await page.waitFor(1000)

        let keyword = 'abc'

        const search = await page.$("#search")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        // await page.waitForNavigation({timeout : 10000})
        await page.waitFor('a.yt-simple-endpoint.style-scope.ytd-video-renderer');
        await page.waitFor(7000)

        const hrefs = await page.$$('a.yt-simple-endpoint.style-scope.ytd-video-renderer');

        // const urls = await page.$$eval('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer', es => es.map(e => e.href));

        // console.log('urls: ', urls)

        await hrefs[0].click()
        await page.waitFor(3000)
        await page.screenshot({path: 'search.jpg'})
    }
    catch (e) {
        console.log('error','testLogin:', e)
    }
    finally {
        await browser.close()
    }
}

async function testGetIp(){
    let ip = await utils.getIp(1)
    console.log('ip of 1: ', ip)
    let ip2 = await utils.getIp(2)
    console.log('ip of 2: ', ip2)
}

async function testGetPlaylistInfo(){
    let p1 = await  utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=mYFd1Lbiaxg&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD')
    console.log('playlist info p1: ', p1)
    let p2 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=mYFd1Lbiaxg&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=1')
    console.log('playlist info p2: ', p2)
    let p3 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=D51MMSEtMh8&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=3')
    console.log('playlist info p3: ', p3)
    let p4 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=WTb2eY54p90&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=98')
    console.log('playlist info p4: ', p4)
    let p5 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=YHnLQ_aLpG0&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=99')
    console.log('playlist info p5: ', p5)
    let p6 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=5uR0dgX7H0Q&feature=youtu.be&list=PLEKaMa_OGCjvlBt32Z7WnBArx6f4-7oO6&index=11&t=125')
    console.log('playlist info p6: ', p6)
    let p7 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/watch?v=YTslFsD7ToI&list=PLEKaMa_OGCjvlBt32Z7WnBArx6f4-7oO6&index=23')
    console.log('playlist info p7: ', p7)
    let p8 = await utils.getPlaylistInfo(1000, 'https://www.youtube.com/channel/UCEZ5NIAZX26469GAIWRJqxA')
    console.log('playlist info p8: ', p8
    )
}

async function testGetPlaylistPageInfo(){
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    await page.goto('https://www.youtube.com/watch?v=mYFd1Lbiaxg&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD')

    let p1 = await  utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p1: ', p1)

    await page.goto('https://www.youtube.com/watch?v=mYFd1Lbiaxg&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=1')
    let p2 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p2: ', p2)

    await page.goto('https://www.youtube.com/watch?v=D51MMSEtMh8&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=3')
    let p3 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p3: ', p3)

    await page.goto('https://www.youtube.com/watch?v=WTb2eY54p90&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=98')
    let p4 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p4: ', p4)

    await page.goto('https://www.youtube.com/watch?v=YHnLQ_aLpG0&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD&index=99')
    let p5 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p5: ', p5)

    await page.goto('https://www.youtube.com/watch?v=5uR0dgX7H0Q&feature=youtu.be&list=PLEKaMa_OGCjvlBt32Z7WnBArx6f4-7oO6&index=11&t=125')
    let p6 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p6: ', p6)

    await page.goto('https://www.youtube.com/watch?v=YTslFsD7ToI&list=PLEKaMa_OGCjvlBt32Z7WnBArx6f4-7oO6&index=23')
    let p7 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p7: ', p7)

    await page.goto('https://www.youtube.com/channel/UCEZ5NIAZX26469GAIWRJqxA')
    let p8 = await utils.getPlaylistPageInfo(1000, page)
    console.log('playlist info p8: ', p8
    )
}

async function testAsync(){
    const arr = [ { key: 1 }, { key: 2 }, { key: 3 } ]
    const result = arr.map(async (obj) => { return obj.key; });
    console.log(`Result: ${result}`);
}

async function testGoToPlaylistIndex(){
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1280,
        height: 720
    })
    await page.goto('https://www.youtube.com/watch?v=mYFd1Lbiaxg&list=PLr9sYUXuFXln6zWT-l6hbBow0GNoyyPFD')

    let index = 33
    await page.waitFor('#wc-endpoint')
    let pl = await page.$$('#wc-endpoint')
    if(pl.length > index){
        await pl[index].click()
    }

    await page.waitFor(3000)
    await page.screenshot({path: 'pl_index.jpg'})
    console.log('finish')

    await browser.close()


}

async function testSearch(){
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        executablePath: '/usr/bin/google-chrome',
        userDataDir: path.join(workingDir, 'test', 616 + '')
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1280,
        height: 720
    })

    await page.goto('https://www.youtube.com')

    await page.waitFor("input#search")
    await page.waitFor(1000)

    let keyword = 'hhe'

    const search = await page.$("input#search")
    await search.type(keyword, {delay: 40})
    await search.type(String.fromCharCode(13));

    // await page.waitForNavigation({timeout : 10000})
    await page.waitFor('a.yt-simple-endpoint.style-scope.ytd-video-renderer');
    await page.waitFor(3000)

    const hrefs = await page.$$('a.yt-simple-endpoint.style-scope.ytd-video-renderer');
    const url = await page.$$eval('a.yt-simple-endpoint.style-scope.ytd-video-renderer',es => es.map(e => e.href));
    console.log('url: ',url)

    if(hrefs.length > 0) {
        await hrefs[2].click()
    }
    await page.waitFor(3000)

    await page.screenshot({path: 'search.jpg'})


    console.log('finish')
    await browser.close()

}

async function testWatchPlaylist(){
    try{
        for(let i = 0; i<1; i++){
            startPl(i)
            await utils.sleep(5000)
        }
    }
    catch (e) {
        console.log('error',e)
    }
}

// let pls = ['https://www.youtube.com/watch?v=5rIorePltO8','https://www.youtube.com/watch?v=BMLLvvGsYUo',
//     'https://www.youtube.com/watch?v=d8wlChgUDn0','https://www.youtube.com/watch?v=v_4us3vwg7s',
//     'https://www.youtube.com/watch?v=Xob-Fe5INKk','https://www.youtube.com/watch?v=JZFDODxs7dQ',
//     'https://www.youtube.com/watch?v=aS91yQ0tdUk', 'https://www.youtube.com/watch?v=WioV2ru_h7E']

let pls = ['https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s','https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s',
'https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s','https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s',
'https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s','https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s',
'https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s','https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq&index=2&t=0s']

async function getBrowser(pid){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
            // '--disable-extensions-except=F:\\go\\src\\dominhit.pro\\minhdv\\profile-manager\\scripts\\ublock',
            // '--load-extension=F:\\go\\src\\dominhit.pro\\minhdv\\profile-manager\\scripts\\ublock'
            // '--disable-extensions-except=/root/scripts/adblock',
            // '--load-extension=/root/scripts/adblock'
        ],
        executablePath: '/usr/bin/google-chrome',
        // headless: false,
        // executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        userDataDir: pid?path.join(workingDir, 'profiles', pid + ''):null,


    });
    return browser
}

async function getPage(browser){

    if(!browser) browser = await getBrowser()

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')
    await page.setViewport({
        width: 320,
        height: 480,
        isMobile: true
    })

    return page
}

async function startPl(i){
    let page = await getPage()
    // await page.goto('https://www.youtube.com/watch?v=1mPNe09Y-VU&list=PLTdFtpSw2QifNDPLkN--xaxAK-50HIFZq')
    await page.goto(pls[i])
    await page.waitFor(3000)

    // await utils.clickPlayIfPause(page)
    let j = 0
    while(true){
        j++
        await page.waitFor(20000)
        console.log('screenshot: ',i,',',j)
        await page.screenshot({path: './test/pl_a_'+i+'.jpg'})
        if(await page.$('.ytp-small-mode.ended-mode')){
            let btn = await page.$('button.ytp-large-play-button.ytp-button')
            if(btn){
                try{
                    await btn.click()
                    await btn.click()
                }
                catch (e) {
                    console.log('error','click play err')
                }
            }
        }
    }
}

async function mobSearch(){
    try{
        let page = await getPage()

        let keyword = 'abc'

        await page.goto("https://google.com")

        await page.waitFor("input[name='q']")
        await page.waitFor(1000)

        const search = await page.$("input[name='q']")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        await page.waitFor(3000)

        const validLinks = []
        const hrefs = await page.$$('.mnr-c a');
        if (hrefs.length > 0) {
            if(await page.$('div[role="dialog"]')){
                console.log('has dialog')
                let a = await page.$('g-bottom-sheet')
                if(a){
                    await a.click()
                }
            }

            await hrefs[utils.randomRanger(0, hrefs.length-1)].click()
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
        }

    }
    catch (e) {
        console.log('error','mobSearch: ',e)
    }
}

async function mobGotoYoutubeVideoBySearch(p) {
    try{

        let page = p?p:await getPage()
        let keyword = "abc"
        await page.goto("https://www.youtube.com/")
        await page.waitFor(3000)

        await page.waitFor('button[aria-label^="Search"]')
        await page.$$eval('button[aria-label^="Search"]', elements => elements[1].click());


        await page.waitFor("input.searchbox-input")
        await page.waitFor(1000)

        const search = await page.$("input.searchbox-input")
        await search.type(keyword, {delay: 40})
        await search.type(String.fromCharCode(13));

        await page.waitFor('a.compact-media-item-metadata-content');
        await page.waitFor(7000)

        const hrefs = await page.$$('a.compact-media-item-metadata-content');
        if(hrefs.length > 0) {
            let i = 0
            while(i<5){
                let randomIndex = utils.randomRanger(0, hrefs.length - 1)
                try {
                    await hrefs[randomIndex].click()
                    break
                }
                catch (e) {
                    i += 1
                }
            }

            await page.waitFor(3000)
        }

        return page
    }
    catch (e) {
        console.log('error','mobSearch:',e)
    }
}

async function mobLikeOrDislike(){
    try{
        let page = await mobGotoYoutubeVideoBySearch()

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

        let isLike = utils.randomRanger(0,1)

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
    }
    catch (e) {
        console.log('error','mobLikeOrDislike',e)
    }
}

async function mobGetCommentMsg(page){
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

async function mobComment(){
    try{
        let page = await getPage()
        await mobGotoYoutubeVideoBySearch(page)
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
        await page.waitFor("ytm-comment-section-header-renderer")
        await page.waitFor(2000)

        const commSec = await page.$("ytm-comment-section-header-renderer")
        await commSec.click()

        await page.waitFor(1000)

        let msg = await mobGetCommentMsg(page)
        console.log('msg to comment: ', msg)
        if(!msg.length) return

        // comment box
        await page.waitFor(".comment-simplebox-placeholder.comment-simplebox-reply")
        await page.waitFor(2000)

        const cmtBox1 = await page.$(".comment-simplebox-placeholder.comment-simplebox-reply")
        await cmtBox1.click()

        // text area
        await page.waitFor("textarea.comment-simplebox-reply")
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
    }
    catch (e) {
        console.log('error','mobComment',e)
    }
}

async function mobPlaylistSearch(){
    try{
        let page = await getPage()

        await page.goto("https://www.youtube.com/results?sp=EgIQAw%253D%253D&search_query="  + decodeURIComponent('abc'))
        await page.waitFor(3000)

        await page.waitFor('a.compact-media-item-metadata-content');
        await page.waitFor(3000)

        const hrefs = await page.$$("a.compact-media-item-metadata-content")
        if(hrefs.length > 0) {
            await hrefs[utils.randomRanger(0, hrefs.length - 1)].click()
            await page.waitFor(2000)
            let playAll = await page.$('a.playlist-play-all-button')
            if(!playAll) return
            await playAll.click()
            await page.waitFor(3000)
        }

        return page
    }
    catch (e) {
        console.log('error','mobPlaylistSearch',e)
    }
}

async function testMobGetPlaylistPageInfo(){
    try{
        let page = await mobPlaylistSearch()
        let url = page.url()
        await page.goto('https://m.youtube.com/watch?v=bWMixaQtSUE&list=PLZ4jjtEZBHUG4FVt5YoJ_kvw1NGHQC2dI&index=20')
        await page.waitFor(2000)
        console.log('url:', url)
        if(url.indexOf('youtube.com/watch') > -1 && url.indexOf('&list=') > -1){
            console.log('playlist')
            let urlId = url.substr(url.indexOf('&list=')+'&list='.length)
            let nextParam = urlId.indexOf('&')
            if(nextParam > -1){
                urlId = urlId.substr(0, nextParam)
            }
            await page.waitForSelector('.playlist-panel-header-subhead',{timeout:3000})
            let index = await page.$eval('.playlist-panel-header-subhead',e => e.childNodes[0].nodeValue)
            index = index.split('/')
            let current = parseInt(index[0])
            let last = parseInt(index[1])

            console.log( {url: urlId, index: current, last: current==last})
        }
        else{
            console.log('not playlist')
            return {url: null}
        }
    }
    catch (e) {
        console.log('error','testMobGetPlaylistPageInfo: ', e)
        return {url: null}
    }
}

async function mobGotoIndexPlaylist(){
    try{
        let page = await getPage()

        let url = 'https://www.youtube.com/watch?v=' + 'APVltUVeXSI' + '&list='+ 'PLbsKRB58_LCzkfHScthNggfCcHCiSxxtx'
        let currentIndex = 0
        console.log(' url: ', url, ', index: ', currentIndex)
        await page.goto(url)
        await page.waitFor(3000)
        if(currentIndex){
            let next = 1
            while(next <= 5){
                await page.waitForSelector('ytm-playlist-panel-video-renderer .compact-media-item-image',{timeout:5000})
                let pl = await page.$$('ytm-playlist-panel-video-renderer .compact-media-item-image')
                if(currentIndex <= pl.length){
                    // click to index video
                    console.log('click next: ', currentIndex)
                    await pl[currentIndex].click()
                    await page.waitFor(3000)
                    break
                }
                else{
                    console.log('next: ', next, 'pl length: ', pl.length)
                    await pl[pl.length-1].click()
                    await page.waitFor(7000)
                    next += 1
                }
            }
        }

        await utils.sleep(20000)
        await clickPlayIfPause(page)
    }
    catch (e) {
        console.log('error','mobGotoIndexPlaylist',e)
    }
}

async function clickPlayIfPause(page) {
    if(await page.$('.ytp-small-mode.ended-mode')){
        let btn = await page.$$('.playlist-controls-primary button')
        if(btn.length){
            try{
                await btn[1].click()
            }
            catch (e) {
                console.log('error','click play err')
            }
        }
    }
}

function testSort(){
    let watchRunnings = [
        { pid: '516', action: 1 },
        { pid: '706', action: 0 },
        { pid: '118', action: 1 },
        { pid: '129', action: 1 },
        { pid: '135', action: 0 }
    ]
    let tempRun = watchRunnings.slice()
    tempRun.sort(function (a,b) {
        return a.action - b.action
    })
    console.log('running by order: ', tempRun)
}

async function testLoginMobile(){
    let profile = {
        id: 1850,
        email: 'robloxshing@gmail.com',
        password: '$@g@4Bh2@3D4@G1',
        recover_mail: 'bg81i6i23c17kbdb3k33@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    try{
        let page = await getPage()
        let loginRs = await login.login(page,profile.email,profile.password,profile.recover_mail)
        console.log('login: ',loginRs)

        await page.goto('https://m.youtube.com/select_site?action_language=1')
        await page.waitFor(3000)

        const textLanguage = await page.$eval('option[selected]',e => e.textContent);
        if(textLanguage.indexOf("English") == -1) {
            await page.select('select','en')
        }
    }
    catch (e) {
        console.log('error','testLoginMobile',e)
    }
}

async function testSubErr(){
    let profile = {
        id: 1179,
        email: 'pacmaxl1@gmail.com',
        password: '12o@bB4@C21$@C@',
        recover_mail: '342h1jf121e12bie1cmk@hotmail.com',
        status: 'NEW',
        proxy: null
    }
    let page = await getPage()



    let loginRs = await login.login(page,profile.email,profile.password,profile.recover_mail)
    console.log('login: ',loginRs)
    await page.screenshot({path: 'login.jpg'})
    console.log('url: ',page.url())

    await page.goto("https://m.youtube.com/account_notifications")
    await page.waitFor(3000)
    await page.screenshot({path: 'notify.jpg'})

}

async function testRelogin(){
    let browser = await getBrowser()
    let page = await getPage(browser)

    // await page.goto('https://mail.google.com/mail/logout?hl=en')
    // await page.waitFor(2000)
    //
    // let relogin = await main.reLogin(1827, browser, page)
    // console.log('relogin', relogin)
}

async function testRelogin(){
    let browser = await getBrowser()
    let page = await getPage(browser)

    await sub.watchBeforeSub(116,page,'abc')

    // await browser.close()
}

async function testIp(){

    console.log('ip: ', await publicIp.v4())
}

async function testGetVideoInfo(){
    let browser = await getBrowser()
    let page = await getPage(browser)

    await page.goto('https://m.youtube.com/watch?list=PLTtw_Mx7rLiahyQ5wrwoQshCQXURHpU8g&v=wuCK-oiE3rM')

    await page.waitFor(3000)

    let videoInfo = await utils.getVideoInfo(111,page)

    console.log('videoInfo: ', videoInfo)


}


async function testSubMulti(){
    let browser = await getBrowser()
    // let page = await getPage(browser)

    let channels = {
        channels: [
            {
                channel_id: 55,
                c_url: 'https://www.youtube.com/channel/UCpaieTPd_KATl4fcAvcp4bg'
            },
            {
                channel_id: 55,
                c_url: 'https://www.youtube.com/channel/UCpaieTPd_KATl4fcAvcp4bg'
            }
        ],
        playlist: [],
        action: 2,
        keyword: [ 'comfortably numb – pink floyd' ,'abc']
    }

    await sub.start(1,browser,channels)

    // let videoInfo = await utils.getPlaylistPageInfoMobile(111,page)
    //
    // console.log('videoInfo: ', videoInfo)

}

async function testLoginSwitcher(){
    let browser = await getBrowser()
    let page = await getPage(browser)

    let profile = {
        id: 2266,
        email: 'lspierrels@gmail.com',
        password: '@E13Fb@C11$*e1@',
        recover_mail: '2c2gg2bl14kb81b4d12m@hotmail.com',
        status: 'NEW',
        proxy: null
    }

    let kw = ['last day','forever','night','lemon','tree','forest','rain']

    await reading.gotoYoutubePlaylistBySearchOrUrl(1,page,[{playlist_url:'PLFKP9MPlpWnWVrOcZcax5dGayo0LxbxgY'}],false,60*60*1000,1)

    // while(true){
    //     await sub.watchBeforeSub(profile.id, page, kw[utils.randomRanger(0,kw.length-1)])
    // }

}

async function testCopy(){
    fs.copySync('./profiles/2266', './profiles/3')
}

async function testPlaylist(){
    let browser = await getBrowser()
    let page = await getPage(browser)

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36')
    await page.setViewport({
        width: 480,
        height: 720,
        isMobile: true
    })

    let keywordOrUrlList = [
        {
            playlist_url: 'PL8nyNWbv0HQIQcsc2MO_aWGUpFv-b_hAK',
            video: 'TOp9j8i1PY8',
            total_times: 1800000,
            current_index: 0,
            current_video: null,
            video_time: null
        }]
    let i=0
    let url
    url = 'https://www.youtube.com/playlist?list='+keywordOrUrlList[i].playlist_url
    let currentIndex = keywordOrUrlList[i].current_index
    console.log('pid: ', '', ' url: ', url, ', index: ', currentIndex)
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

    let next = 1
    while(next <= 5){
        await page.waitForSelector('a#wc-endpoint',{timeout:5000})
        let pl = await page.$$('a#wc-endpoint')
        if(currentIndex < pl.length){
            // click to index video
            console.log('pid:','','click next: ', currentIndex)
            await pl[currentIndex].click()
            await page.waitFor(3000)
            break
        }
        else{
            console.log('pid:','','next: ', next, 'pl length: ', pl.length)
            await pl[pl.length-1].click()
            await page.waitFor(7000)
            next += 1
        }
    }

    if(next<=5){
        // change resolution

    }
    else{
        throw "retry playlist over 5"
    }

}

async function testPlaylist() {
    let browser = await getBrowser(1)
    let page = await getPage(browser)
    let page1 = await getPage(browser)
    let page2 = await getPage(browser)



}

async function removeAcc() {
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        // executablePath: '/usr/bin/google-chrome',
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir, 'default')


    });
    // let browser = await getBrowser()
    let page = await getPage(browser)

    await page.goto('https://mail.google.com/mail/logout?hl=en')
    await page.waitFor(3000)
    await page.goto('https://accounts.google.com/ServiceLogin/signinchooser?flowName=GlifWebSignIn&flowEntry=ServiceLogin')
    await page.waitFor(7000)

    await page.screenshot({path: "testlogout1.jpg"})

    console.log('before click')
    let li  = await page.$$('form li > div')
    if(li.length > 2){
        await page.evaluate(x => x.click(),li[li.length-2])
    }

    await page.waitFor(2000)

}

async function testDefault() {
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir, 'default')


    });

}



async function testWebDriver(){
    const {Builder, By, Key, until} = require('selenium-webdriver');
    const firefox = require('selenium-webdriver/firefox');

    (async function example() {

        // let create = '-CreateProfile "2 '+path.join(workingDir,"profiles","2")+'"'
        // console.log('create: ',create)
        // let option = new firefox.Options()
        //
        // option.addArguments("-CreateProfile","2")
        // let driver = new Builder()
        //     .forBrowser('firefox')
        //     .setFirefoxOptions(option).build()
        //
        // await driver.quit();

        let playlists = ['PLRjIX-C7Zlp3zS5wQH8ryFbqIUK3gGQwf',
            'PLRjIX-C7Zlp02Z2pJZp8HxIomhkIXoxzD',
            'PLRjIX-C7Zlp17-4nnS0wUZ3cINCoAo2_4',
            'PLRjIX-C7Zlp2MChH-gvS3ezswN9Fc134N',
            'PLRjIX-C7Zlp2A4q9uxvCgMgHQMfToiMj_',
            'PLRjIX-C7Zlp2z_nnd9BR0oXzrwAs0gT0a',
            'PLRjIX-C7Zlp1RvPZDh9slRFM4oWjEyhcs',
            'PLRjIX-C7Zlp1pP75apNDgLk6e9K9QtGlJ',
            'PLRjIX-C7Zlp3oTLbkzRBtUASLznBg4ksO',
            'PLRjIX-C7Zlp3XlKnlO3Xy2ColknncRgBV']

        for(let i = 0; i < playlists.length; i++){
            let options = new firefox.Options()
            let agr = '-profile "'+path.join(workingDir,"profiles","1")+'"'
                console.log('agr: ',agr)
            // options.setProfile(path.join(workingDir,"profiles","1"))

            let driver = new Builder()
                .forBrowser('firefox')
                // .setFirefoxOptions(options)
                .build()
            await driver.get('https://www.youtube.com/playlist?list='+playlists[i]);
            let q = await driver.findElements(By.css('a#thumbnail'));
            await driver.sleep(5000)
            if(q.length){
                await q[0].click()
                // q[0].sendKeys('webdriver', Key.RETURN);
                // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
            }
        }
    })();
}

async function testWindow(){
    const pptrFirefox = require('puppeteer-firefox');

    const browser = await pptrFirefox.launch({headless: false,
        defaultViewport: {width: 320,height:480,isMobile:true},
        args : ['-profile','C:\\Users\\Antz\\Desktop\\5\\Data\\profile'],});
        // args : ['-profile',path.join(workingDir,'profiles',9+'')],});

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')
    await page.setViewport({
        width: 320,
        height: 480
    })

    let playlists = ['PL9283EBA918D222DA']

    for(let i = 0; i< playlists.length;i++){
        await page.goto('https://m.youtube.com/playlist?list='+playlists[i])
        await page.waitFor(3000)
        let links = await page.$$eval('a.playlist-play-all-button',es => es.map(e => e.href))
        if(links.length){
            await page.evaluate(x =>
            {
                window.open(x,'_blank','height=300,width=300')
            },links[0])
        }

    }
}

async function testChromeCentos(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        // args: ['--no-sandbox'],
        executablePath : '/usr/bin/google-chrome',
        headless: false,
        userDataDir: path.join(workingDir, 'profiles','1')
    });

    await page.goto('https://www.youtube.com/watch?v=jKUB2Mz4XYY')
    await page.waitFor(5000)
    await page.screenshot({path: 'head.jpg'})

    console.log('finish')
}

async function testChromePlaylist(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
            '--disable-extensions-except=/root/scripts/ublock,/root/scripts/adblock',
            '--load-extension=/root/scripts/ublock,/root/scripts/adblock'],
        // executablePath : '/usr/bin/google-chrome',
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir, 'profiles','1')
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')
    await page.setViewport({
        width: 320,
        height: 480
    })

    let playlists = ['PLRjIX-C7Zlp0x9wnCIZxJurcHh0Kw6THj',
        'PLRjIX-C7Zlp1nSJjz87oF3W2KGKsWLpbI',
        'PLRjIX-C7Zlp0nfjFHwj-bX7K0g4iJ-A04',
        'PLRjIX-C7Zlp3RskGjKqODkZ9d3wOiCC8K',
        'PLRjIX-C7Zlp3UmabDYHUWYOXus31HSPDH',
        'PLRjIX-C7Zlp1TjCQ_2SYMCRajAfrR1P1O',]

    for(let i = 0; i< playlists.length;i++){
        await page.goto('https://m.youtube.com/playlist?list='+playlists[i])
        await page.waitFor(3000)
        let links = await page.$$eval('a.playlist-play-all-button',es => es.map(e => e.href))
        if(links.length){
            await page.evaluate(x =>
            {
                window.open(x,'_blank','height=300,width=300')
            },links[0])
        }
    }
    console.log('finish')
}

async function testSync(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath : '/usr/bin/google-chrome',
        headless: true,
        userDataDir: path.join(workingDir, '5088')
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')
    await page.setViewport({
        width: 320,
        height: 480
    })

    await page.goto("https://m.youtube.com/")
    await page.waitFor(5000)
    await page.screenshot({path:'sync.jpg'})
}

async function testQuality(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')
    await page.setViewport({
        width: 320,
        height: 480
    })

    await page.goto("https://m.youtube.com/watch?v=X-jdl9hcCeg&list=RDpw8mOUEaY-k&index=4")
    await page.waitFor(5000)
    await utils.changeMobQuality(1,page)
}

async function testPlaylistByChannel() {
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false
    });

    let playlist = [
        {
            playlist_url: 'UC4YWJtUBVMQf9VAHCJCp6Pw#1',
            video: '1KX5d7tRGmI',
            total_times: 3600000,
            current_index: null,
            current_video: null,
            video_time: null,
            url_type: 'channel'
        }
    ]
    global.watchRunnings = [{pid: 1, action: 1}]
    for(let i = 0; i < 1; i++){
        let page = await browser.newPage();
        // await page.setViewport({
        //     width: 480,
        //     height: 320
        // })
        // let agent = utils.AGENTS[1%utils.AGENTS.length]
        // await page.setUserAgent(agent)
        reading.gotoYoutubePlaylistBySearchOrUrl(1,page,playlist,false,3600,1,['abc'])
        await utils.sleep(5000)
    }

}

async function testFirefox(){
    const pptrFirefox = require('puppeteer-firefox');

    (async () => {
        const browser = await pptrFirefox.launch({headless: true,
            userDataDir : path.join(workingDir,'profiles','131252')
            // args : ['-profile',path.join(workingDir,'profiles',3+'')],
        });
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com/');

        await page.waitFor(5000)
        await page.screenshot({path: 'ff_yt.jpg'})

        console.log('finish')


        // const browser2 = await pptrFirefox.connect({browserWSEndpoint: browser.wsEndpoint()});
        // const page2 = await browser2.newPage();
        // await page2.goto('https://www.youtube.com/');

        // await browser.close();
    })();
}

async function testSearchByVideo(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false
    });
    const page = await browser.newPage();

    await reading.gotoYoutubeVideoBySearch(1, page, 'XvB6ozbwH0', 1, false, 'XvB6ozbwH0')

}

async function testDesktopSub(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
        ],
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir,'profiles','test')
    });
    global.subRunnings = []
    await sub.start(1, browser, {channels: [{channel_id: 1, c_url: 'https://www.youtube.com/user/itzelangeldigital', keywords:'itzelangeldigital'}], action: 2, keyword: ['abc'],ip: '127.0.0.1'})

}

async function testLogin2(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
            // '--proxy-server=104.194.9.133:3208'
        ],
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir,'profiles','rivasdiana92@yahoo.com')
    });
    let page = await browser.newPage()
    // await page.authenticate({username : 'dinh', password : '123456a'});
    let rs = await login.login(page,'rivasdiana92@yahoo.com','HDmedia@12345','rivasdiana92@yahoo.com','338467364')
    console.log(rs)

    global.subRunnings = []
    global.proxy = {1: {username: 'dinh', password: '123456a'}}
    global.workingDir = __dirname

    let channels = {
        channels: [
            {
                channel_id: 373,
                c_url: 'https://www.youtube.com/channel/UCL9267A4noIsnnOjpRHIGoA',
                keywords: 'UCL9267A4noIsnnOjpRHIGoA',
                name: 'UCL9267A4noIsnnOjpRHIGoA'
            },
            {
                channel_id: 374,
                c_url: 'https://www.youtube.com/channel/UCCet5p71VMGlgAMAcRZLE6g',
                keywords: 'dudesofhockey',
                name: 'dudesofhockey'
            }
        ],
        playlist: [],
        action: 2,
        keyword: [ 'comfortably numb – pink floyd' ,'abc']
    }

    await sub.start(1,browser, channels)
}

async function testGui(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    const browser = await puppeteer.launch({
        args: ['--no-sandbox','--disable-extensions-except='+workingDir+'/quality','--load-extension='+workingDir+'/quality',
            '--proxy-server=50.117.24.170:12115'
        ],
        executablePath : "/usr/bin/google-chrome",
        headless: false,
        userDataDir: path.join(workingDir,'profiles','test')
    });
    let page = await browser.newPage()
    await page.authenticate({username : 'dinh', password : '123456a'});

    await login.login(page,'hugo.rodrigues.hr61@gmail.com','freedome@3181','hugo_dani69321012019@yahoo.com')

    await reading.gotoYoutubeVideoBySearch(111,page,'HlbOL0rAmsk',0,false,'HlbOL0rAmsk')

}

async function testReading2(){
    let channel = {
        search: false,
        watch_time: 5400000,
        playlist: [
            {
                playlist_url: 'PLkZg3Vf2KXoeYxKW_bjJ6D-Qyj2ogoLOr',
                video: 'PLkZg3Vf2KXoeYxKW_bjJ6D-Qyj2ogoLOr',
                total_times: 5400000,
                url_type: 'playlist'
            }
        ],
        keyword: [
            'dancing in the street – david bowie/mick jagg',
            'rockafeller skank – fatboy slim',
            'where’s the love – hanson',
            'games download',
            'all fired up – pat benatar'
        ]
    }

    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    // const UserAgentPlugin = require("puppeteer-extra-plugin-anonymize-ua")
    // puppeteer.use(UserAgentPlugin({ makeWindows: true }))
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--proxy-server=45.134.23.245:65510'
        ],
        // executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: path.join(workingDir,'profiles','ricardoindaia@hotmail.com')
    });
    let page = await browser.newPage()
    await page.authenticate({username : 'minh', password : 'minh'});

    let rs = await login.login(page, 'ricardoindaia@hotmail.com','HDmedia@12345','ricardoindaia@hotmail.com','373900143')
    console.log(rs)

    global.proxy = {1: {username: 'minh', password: 'minh'}}
    global.workingDir = __dirname
    global.watchRunnings = [{pid: 1, action: 1, playlist: {}}]

    // await reading.start(1, browser, 1, channel)
}

async function testReading(){
    const pluginStealth = require("puppeteer-extra-plugin-stealth")
    puppeteer.use(pluginStealth())
    let userDataDir = path.join(workingDir,'profiles_test','saysongkhamotha1757452331@gmail.com')
    if (!fs.existsSync(userDataDir)){
        fs.mkdirSync(userDataDir);
    }
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            // '--proxy-server=45.141.128.17:47301'
        ],
        // executablePath : "/usr/bin/google-chrome",
        executablePath : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        userDataDir: userDataDir
    });
    let page = await browser.newPage()
    // await page.authenticate({username : 'minh', password : 'minh'});

    console.log('start login')
    let rs = await login.login(page,'aldera16_gyn@hotmail.com','Tung@12345','aldera16_gyn@hotmail.com','862612827')
    console.log(rs)

    global.proxy = false
    global.workingDir = __dirname
    global.watchRunnings = [{pid: 1, action: 1, playlist: {}, playlistTime: {}}]

    let channel = {
        search: false,
        watch_time: 10,
        playlist: [
            {
                playlist_url: 'PL3PqVZxrUDrWtHWmtsTVi3U7qcZIf-xHR',
                video: 'abc kids tv',
                total_times: 30*60*1000,
                url_type: 'playlist'
            }
        ],
        keyword: [
            'dancing in the street – david bowie/mick jagg',
            'rockafeller skank – fatboy slim',
            'where’s the love – hanson',
            'games download',
            'all fired up – pat benatar'
        ]
    }

    // await page.waitFor(10000)
    // await reading.start(1, browser, 1, channel)
    let videos = ['https://www.youtube.com/watch?v=8qFt9DCXJ-8',
    'https://www.youtube.com/watch?v=thbIOKR76aw',
    'https://www.youtube.com/watch?v=IDds0Pe8Bp8',
    'https://www.youtube.com/watch?v=ntD2qiGx-DY',
    'https://www.youtube.com/watch?v=t-eu6QGFgas',
    'https://www.youtube.com/watch?v=WGkmodmKwH4']
    // for(let i = 0; i < videos.length; i++){
    //     await page.goto(videos[i])
    //     await page.waitFor(2000)
    //     await reading.skipAds(page)
    //     await page.waitFor(20000)
    // }

    // await reading.CommentYoutubeVideo(1, page, 1, 'thank you mate!')
    // // await reading.gotoYoutubeVideoBySearch(1,page,'đo đạc điều chỉnh để lắp cửa gỗ #5',1,false,'18z7oQSt4FI')
    // await reading.gotoYoutubePlaylistBySearchOrUrl(1, page, [{url_type:'video', video:'đo đạc điều chỉnh để lắp cửa gỗ #5',playlist_url:'18z7oQSt4FI'}], false, 0, 1, '')
}

async function testReadingSel(){
    let userDataDir = path.join(workingDir,'profiles_test','saysongkhamotha1757452331@gmail.com')
    const {Builder, By, Key, until} = require('selenium-webdriver');

    (async function example() {
        let driver = await new Builder().forBrowser('firefox').build();
        try {
            console.log('abc')
            // Navigate to Url
            let login_sel = require('./login_sel')
            let rs = await login_sel.login(driver,'bayareamuzik@gmail.com','thhcddtcfa@!&@3629','bayareambnjhuxvs0129@hotmail.com')
            console.log(rs)
        }
        finally{
            driver.quit();
        }
    })();
}

// async function testLogin(){
//     var robot = require("robotjs");
//     await utils.sleep(5000)
//     robot.setMouseDelay(2);
//     robot.moveMouseSmooth(750.5+15,553.5+10)
//     robot.mouseClick();
//     robot.typeString("Hello World");
//     robot.keyTap("enter");
//
// }

async function testExtention(){
    try{
        // var robot = require("robotjs");
        // await utils.sleep(1000)
        // robot.typeString("Hello World");
        // var mouse=robot.getMousePos();
        // console.log(mouse)
        // robot.scrollMouse(300,300)
        // robot.moveMouseSmooth(100, 100);
        //
        // mouse=robot.getMousePos();
        // console.log(mouse)
        // return

        const main = require('./main')
        main.initExpress()

        const execSync = require('child_process').execSync;


        let action = {
            id: 'login',
            pid: 2,
            email: 'olliealmyers3y@gmail.com',
            password: 'Wq6nBs1pIV',
            recover_mail: 'cforopdtbdks944425@gmail.com',
            recover_phone: ''
        }

        let action2 = {
            id: 'watch',
            playlist_url: 'gWW6pBRfxAo',
            video: 'hướng dẫn gấp hoa bằng giấy gWW6pBRfxAo',
            total_times: 3,
            url_type: 'video',
            video_time: null,
            pid: '220862',
            keyword: 'fame – david bowie',
            suggest_videos: 'abc'
        }

        let action3 = {
            id: 'sub',
            pid: 1,
            channels: [
                {
                    channel_id: 373,
                    c_url: 'https://www.youtube.com/channel/UCFYwUkzaMet2lg-l9mQqnmg',
                    keywords: 'UCpZ-tSDMyS9ziRaLc_qfbBg',
                    name: 'UCpZ-tSDMyS9ziRaLc_qfbBg'
                },
                {
                    channel_id: 372,
                    c_url: 'https://www.youtube.com/channel/UCFYwUkzaMet2lg-l9mQqnmg',
                    keywords: 'UCUkhcOw2vUAir15DxgQKTig',
                    name: 'UCUkhcOw2vUAir15DxgQKTig'},
            ]
        }


        let param = new URLSearchParams(action2).toString();

        await utils.sleep(2000)

        let port = 2000
        let startPage = `http://localhost:${port}/action?`+param

        const exec = require('child_process').exec;
        // await new Promise(resolve => exec('chrome --user_data_dir="'+action.pid+'" --load-extension="F:\\go\\src\\dominhit.pro\\minhdv\\profile-manager\\selenium\\ex" "'+startPage+'"',
        //         _ => resolve('ok')))

        param = new URLSearchParams({data:JSON.stringify(action2)}).toString();
        startPage = `http://localhost:${port}/action?`+param

        let currentDir = __dirname
        let proxy = '--proxy-server="45.95.0.114:44207" --proxy-bypass-list="localhost:2000"'
        let cmd = `chrome ${proxy} "${startPage}" --user-data-dir="profiles_test/${action2.pid}" --load-extension="${path.resolve('ex')}"`
        console.log(cmd)

        await new Promise(resolve => exec(cmd,
                _ => resolve('ok')))
        // await new Promise(resolve => exec('google-chrome --no-sandbox --disable-infobars --user-data-dir="profiles_test/'+action.pid+'" --load-extension="/root/scripts/ex" "'+startPage+'"',
        //     _ => resolve('ok')))

        await utils.sleep(60000)
    }
    catch (e) {
        console.log('error',e)
    }
    finally {
        process.exit()
    }
}

testExtention()