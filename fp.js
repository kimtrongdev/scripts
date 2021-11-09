const utils = require('./utils')
const rq = require('request-promise')
const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync
const NodeRSA = require('node-rsa');
const crypto = require('crypto')
const StringifyWithFloats = require('stringify-with-floats')
const stringify = StringifyWithFloats({devicePixelRatio: 'float',dischargingTime: 'float',noise: 'float',accuracy: 'float'})
const fontList = require('font-list')
const PUB_KEY = `-----BEGIN RSA PUBLIC KEY-----
MIGJAoGBAO7Afic6CduJio3vZ9oWl9kLZf0tT5CBZOu6fQ7lU0BMy3oZv5z2/PkL
AiI6TYYkPZAYczD+uHdcl4kaVWnQ1+1WJJp6VX7lMpJ56xzWNtabwc1bWgBaqRVA
OYuaqFdAa7yhD08a/Y6Ex57gXJ968teg+BOdGSmJtwkjerjMxGJ5AgMBAAE=
-----END RSA PUBLIC KEY-----`
const PASSWD = 'EiiTivR8zE'

function get_url(url){
    return 'https://dm.quantatee.com:8443' + url
}

function encrypt_passwd(passwd){
    const key = new NodeRSA(PUB_KEY,'pkcs1-public',{encryptionScheme: 'pkcs1'})
    return key.encrypt(passwd,'base64')
}

async function get_token(){
    let url = get_url('/api/auth/token')
    let passwd_crypt = encrypt_passwd(PASSWD)
    console.log('passwd_crypt',passwd_crypt)
    return await rq({method: 'POST',uri: url,json: true, form: {'k1': 'dm', 'k2': passwd_crypt}})
}

async function list_token(token){
    url = get_url(`/api/auth/list?id=${token}`)
    // r = requests.get(url)
    return await rq({method: 'GET',uri: url,json: true, qs: {'k1': 'dm', 'k2': passwd_crypt}})
}

async function delete_token(token){
    url = get_url(`/api/auth/token?id=${token}`)
    // r = requests.delete(url)
    return await rq({method: 'DELETE',uri: url})
}

async function get_fp(token, fp_id){
    try{
        let url = get_url(`/api/fp/get?id=${token}`)
        // r = requests.post(url, json={'_id': fp_id})
        return await rq({method: 'POST',uri: url, json: true, body: {'_id': fp_id}})
    }
    catch(e){
        return {err: e}
    }
}

async function list_fp(token, fp_filter){
    let url = get_url(`/api/fp/list?id=${token}`)
    // r = requests.post(url, json=fp_filter)
    return await rq({method: 'POST',uri: url,json: true, body: fp_filter})
}

async function set_fp(token, fp_data){
    let url = get_url(`/api/fp/set?id=${token}`)
    let r = await rq({method: 'POST',uri: url,json: false, body: stringify(fp_data)})
    return r
}

async function update_fp(token, fp_data){
    url = get_url(`/api/fp/update?id=${token}`)
    // r = requests.post(url, json=fp_data)
    return await rq({method: 'POST',uri: url,json: true, body: fp_data})
}

async function delete_fp(token, fp_id){
    try{
        url = get_url(`/api/fp/del?id=${token}`)
        // r = requests.post(url, json={'_id': fp_id})
        return await rq({method: 'POST',uri: url,json: true, body: {'_id': fp_id}})
    }
    catch(e){
        console.log('error','delete_fp',fp_id)
    }
}

function gen_fp_id(pid){
    return crypto.createHash('md5').update(`${pid}`).digest("hex");
}

async function gen_random_fp(pid,os = 'Windows',browser = 'Chrome'){
    return await rq({uri: `https://dominhit.pro/api?action=get-fingerprint&os=${os}&browser=${browser}`})
}

async function getFP(pid, token){
    let fp_id = gen_fp_id(`${pid}`)
    let resp = await get_fp(token, fp_id)
    if(!resp.err && resp.msg.fp_name){
        if(fs.existsSync(path.resolve(resp.msg.fp_name))) return resp.msg.fp_name
        let fp_file_path = path.resolve(resp['msg']['fp_name'])
        fs.writeFileSync(fp_file_path,Buffer.from(resp['msg']['fp_body'],'base64'))
        return fp_file_path
    }

    // get template
    let templateFp = JSON.parse(fs.readFileSync(path.join(__dirname,'fp_sample.json'),'utf8'))
    // get fp from pid
    let fp = await gen_random_fp(pid)
    fp = JSON.parse(fp)
    console.log(fp)
    fp = JSON.parse(fp.data.data)
    // update template
    templateFp.navigator = fp.navigator
    templateFp.navigator.acceptLanguages = "en-US"
    templateFp.language = "en"
    templateFp.network = fp.network

    templateFp.fonts = await fontList.getFonts()
    templateFp.fonts = templateFp.fonts.map(x => x.replace(/"/g,'')).slice(0,-pid%5-1)

    templateFp.webGL.vendor = fp.webGL.vendor
    templateFp.webGL.renderer = fp.webGL.renderer
    templateFp.webGL.unmaskedVendor = fp.webGL.unmaskedVendor
    templateFp.webGL.unmaskedRenderer = fp.webGL.unmaskedRenderer

    templateFp.mediaDevices = fp.mediaDevices

    templateFp.canvas.randSeed = parseInt(pid)
    templateFp.clientRects.randSeed = parseInt(pid)
    templateFp.audio.randSeed = parseInt(pid)

    // set fp
    
    await set_fp(token, {'_id': fp_id,'fp': templateFp})

    // get profile
    resp = await get_fp(token, fp_id)
    let fp_file_path = path.resolve(resp['msg']['fp_name'])
    fs.writeFileSync(fp_file_path,Buffer.from(resp['msg']['fp_body'],'base64'))

    return fp_file_path
}

async function getProxyParam(proxy, retry = 1){
    try{
        let ipInfo = execSync(`curl http://ip-api.com/json/$(curl -s -x ${proxy.username}:${proxy.password}@${proxy.server} ifconfig.co)`)
        ipInfo = JSON.parse(ipInfo)
        console.log(ipInfo)
        process.env.TZ = ipInfo.timezone
        return `--webrtc-ip=${ipInfo.query} --geolocation=${ipInfo.lat},${ipInfo.lon},0.7`
    }
    catch(e){
        if(retry < 5){
            return await getProxyParam(proxy, retry + 1)
        }
        else{
            throw e
        }
    }
}

module.exports.getToken = get_token
module.exports.getFP = getFP
module.exports.getProxyParam = getProxyParam
module.exports.delete_fp = delete_fp
module.exports.gen_fp_id = gen_fp_id
