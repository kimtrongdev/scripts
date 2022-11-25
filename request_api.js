const request = require('request-promise')
const fs = require('fs')
const SUB_URL = `http://${ devJson.hostIp }`
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function rq (data) {
    data.headers = {
        api_key: process.env.API_KEY
    }
    return request(data)
}

module.exports = {
    reportAccount: async function (data) {
        return await rq({method: 'POST', uri: SUB_URL + '/api/account', body: data, json: true})
    },
    getRandomName: async () => {
        let rs = await rq({uri: 'https://story-shack-cdn-v2.glitch.me/generators/vietnamese-name-generator/male', json: true}).then(response => {
            let fullName = response.data.name
            let firstName = fullName.split(' ').slice(0, -1).join(' ');
            let lastName = fullName.split(' ').slice(-1).join(' ');
            return {
                last_name: lastName,
                first_name: firstName,
            }
        }).catch(error => {
            return {
                last_name: makeName(5),
                first_name: makeName(5),
            }
        })
        return rs
    },
    reportPlaylistJCT: async (data) => {
        return await rq({ method: 'POST', uri: SUB_URL + '/api/playlist/report/playlist_jct', body: data, json: true })
    },
    getComment: async () => {
        return await rq({uri: SUB_URL + '/api/data/comment?type=youtube',json: true})
    },
    getPhone: async () => {
        return await rq({uri: SUB_URL + '/api/phone',json: true})
    },
    getPhoneCode: async (orderID, api_name) => {
        return await rq({uri: SUB_URL + `/api/phone/code?order_id=${orderID}&api_name=${api_name}`,json: true})
    },
    getProfileForRegChannel: async (pid = 0) => {
        return await rq({uri: SUB_URL + '/api/profile/get-for-reg-channel?pid='+pid,json: true})
    },
    reportUpgrade: async () => {
        return await rq({uri: SUB_URL + '/report-upgrade?vmId=' + config.vm_id,json: true})
    },
    getProxyV4: async (data) => {
        let query = ''
        if (data) {
            query = '?api_id='+data.api_id+'&isLoadNewProxy='+data.isLoadNewProxy
        }
        
        return await rq({uri: SUB_URL + '/api/proxy/get-proxy-v4' + query, json: true})
    },
    updateProfileData: async (data) => {
        return await rq({method: 'POST', uri: SUB_URL + '/api/profile/update-data', body: data, json: true})
    },
    getBraveInfo: async (pid) => {
        return await rq({uri: SUB_URL + '/api/profile/get-brave-info?pid='+pid, json: true})
    },
    getRandomKeyWord: async () => {
        return await rq({uri: 'https://random-data-api.com/api/commerce/random_commerce',json: true})
    },
    reportScript: async (pid, serviceId = '', status = true, data_reported = '') => {
        return await rq({uri: SUB_URL + '/api/script/report',json: true,qs: { _id: serviceId, pid: pid, status: status, data_reported }})
    },
    getNewScript: async (pid) => {
        return await rq({uri: SUB_URL + '/api/script/get-new?pid='+pid, json: true})
    },
    checkToUpdate: async () => {
        try {
            return await rq({uri: SUB_URL + '/get-to-update?vmId=' + config.vm_id, json: true})
        } catch (error) {
            console.log(error);
            return false
        }
    },
    getYTVideo: async (pid = '') => {
        return await rq({uri: SUB_URL + '/YTVideo',json: true,qs: { vmId: config.vm_id, pid: pid }})
    },
    getNewProfile: async () => {
        return await rq({uri: SUB_URL + '/api/profile',json: true,qs: {vmId: config.vm_id}})
    },
    updateProfileStatus: async (pid, vmId, status, description) => {
        return await rq({method: 'POST', uri: SUB_URL + '/profile/update-status',body: {pid: pid, vmId: vmId, status: status, description: description}, json: true})
    },
    getSubChannels: async (pid, vmId, proxy) => {
        return await rq({uri: SUB_URL + '/playlist/get-sub-channels',json: true, qs: {pid: pid, vmId: vmId, proxy: proxy}})
    },
    getPlaylist: async (pid, action) => {
        return await rq({uri: SUB_URL + '/playlist/get-playlist',json: true, qs: {pid: pid, vmId: config.vm_id, action: action}})
    },
    updateWatchedVideo: async (pid, viewedAds) => {
        return await rq({method: 'POST',uri: SUB_URL + '/profile/update-watched',json: true, body: {pid: pid, viewed_ads: viewedAds}})
    },
    getChannelSub: async (channelId) => {
        const apiUrl = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&key=AIzaSyCVfKZdlQgwiFY-lEeZ6xKsgUBTbTEDZWA&id='
        return await rq({uri: apiUrl+channelId, json: true, qs: {vmId: config.vm_id}})
    },
    getProfileProxy: async (pid,action, isLoadNewProxy = '') => {
        return await rq({uri: SUB_URL + '/api/proxy/get-profile-proxy',json: true,qs: { pid: pid,action, isLoadNewProxy }})
    },
    getSystemConfig: async () => {
        try{
            return await rq({ uri: SUB_URL + '/api/config/system?vmId=' + config.vm_id, json: true })
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    reportVM: async (data = {}) => {
        try{
            return await rq({uri: SUB_URL + '/api/vm/report',json: true,qs: data})
        }
        catch (e) {
        }
    },
    getNavigator: async (pid,os = 'Windows',browser = 'Chrome',seo) => {
        try{
            let nav = await rq({uri: `https://dominhit.pro/api?action=get-fingerprint&os=${os}&browser=${browser}&id=${pid}&seo=${seo}`})
            nav = JSON.parse(nav)
            nav = JSON.parse(nav.data.data)
            return nav
        }
        catch (e){
            console.log('error','getNavigator',e)
        }
    },
    getAvatar: async function(pid,dir,gender){
        try{
            console.log(pid,'getAvatar',gender)
            let avaUrl
            if(true && Math.random() < 0.8){
                let ava = await rq({uri: `https://dominhit.pro/render/api?action=get-avalist`,json: true})
                avaUrl = ava.avatar
            }
            else{
                gender = gender || (Math.random() < 0.5 ? "male":"female")
                let ava = await rq({uri: `https://fakeface.rest/face/json?gender=${gender}`,json: true})
                avaUrl = ava.image_url
            }
            
            let res = await rq({uri: avaUrl, encoding: null})
            const buffer = Buffer.from(res, 'utf8');
            fs.writeFileSync(dir, buffer);
            return true
        }
        catch (e){
            console.log('error','getNavigator',e)
            return false
        }
    }
}