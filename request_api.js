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
    getComment: async () => {
        return await rq({uri: SUB_URL + '/api/data/comment',json: true})
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
    reportScript: async (pid, serviceId = '', status = true) => {
        return await rq({uri: SUB_URL + '/api/script/report',json: true,qs: { _id: serviceId, pid: pid, status: status }})
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
    getComment: async (keyword) => {
        try{
            return await rq({uri: 'https://dominhit.pro/get-comment-api',json: true,qs: {keyword: keyword}})
        }
        catch (e) {
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
    }
}