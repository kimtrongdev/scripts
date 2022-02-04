const rq = require('request-promise')
const fs = require('fs')
let config
try{
    config = require('./config.json')
}
catch (e) {
    config = {vm_id:2}
}
let devJson = require('./dev.json')
const SUB_URL = `http://${ devJson.hostIp }`
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
    getNewProfile: async function getNewProfile() {
        return await rq({uri: SUB_URL + '/profile/get-new',json: true,qs: {vmId: config.vm_id}})
    },
    getProfile: async function getProfile(pid) {
        return await rq({uri: SUB_URL + '/profile/get-profile',json: true,qs: {pid: pid}})
    },
    updateProfileStatus: async function getNewProfile(pid, vmId, status, description) {
        return await rq({method: 'POST', uri: SUB_URL + '/profile/update-status',body: {pid: pid, vmId: vmId, status: status, description: description}, json: true})
    },
    getSubChannels: async function getSubChannels(pid, vmId, proxy) {
        return await rq({uri: SUB_URL + '/playlist/get-sub-channels',json: true, qs: {pid: pid, vmId: vmId, proxy: proxy}})
    },
    getPlaylist: async function getSubChannels(pid, action) {
        return await rq({uri: SUB_URL + '/playlist/get-playlist',json: true, qs: {pid: pid, vmId: config.vm_id, action: action}})
    },
    updateWatchingTime: async function(pid, action, readingTime, playlistTime, lastPlaylist){
        console.log('updateWatchingTime pid: ', pid, ', action: ', action, ', readingTime: ', readingTime, ', playlistTime: ', playlistTime, ', lastPlaylist: ', lastPlaylist)
        return await rq({method: 'POST',uri: SUB_URL + '/profile/update-watch-time',json: true, body: {pid: pid, action: action, reading_time: readingTime, playlist_time: playlistTime, last_playlist: lastPlaylist}})
    },
    updateWatchedVideo: async function(pid, viewedAds){
        return await rq({method: 'POST',uri: SUB_URL + '/profile/update-watched',json: true, body: {pid: pid, viewed_ads: viewedAds}})
    },
    reportWatchingTime: async function(pid, time){
        return await rq({method: 'POST',uri: SUB_URL + '/profile/report-watching',json: true, body: {pid: pid, vmId: config.vm_id}})
    },
    subStatusReport: async function(pid, channelId, status, ip, preSub, postSub, note){
        return await rq({method: 'POST',uri: SUB_URL + '/profile/sub-update',json: true,
            body: {pid: pid, vmId: config.vm_id, channel_id: channelId, status: status, ip: ip, pre_sub: preSub, post_sub: postSub, note: note}})
    },
    getChannelSub: async function getNewProfile(channelId) {
        const apiUrl = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&key=AIzaSyCVfKZdlQgwiFY-lEeZ6xKsgUBTbTEDZWA&id='
        return await rq({uri: apiUrl+channelId, json: true, qs: {vmId: config.vm_id}})
    },
    updateVmVersion: async function updateVmVersion(vmId,version, ip) {
        return await rq({method: 'POST', uri: SUB_URL + '/manage/update-vm-version',body: {vmId: vmId, version: version, ip: ip}, json: true})
    },
    getProxy: async function getProxy(vmId) {
        return await rq({uri: SUB_URL + '/manage/get-proxy',json: true,qs: {vmId: vmId}})
    },
    getProfileProxy: async function getProxy(pid,action) {
        return await rq({uri: SUB_URL + '/manage/get-profile-proxy',json: true,qs: {pid: pid,action}})
    },
    getVmFromIp: async function getVmFromIp(ip) {
        return await rq({uri: SUB_URL + '/manage/get-vm-from-ip',json: true,qs: {ip: ip}})
    },
    getMobilePercent: async function() {
        try{
            // return await rq({uri: SUB_URL + '/manage/get-mobile-percent',json: true})
            return 0
        }
        catch (e) {
            console.log('getMobilePercent error')
            return 0
        }
    },
    getSystemConfig: async function() {
        try{
            return await rq({uri: SUB_URL + '/oam/api-system-config',json: true})
        }
        catch (e) {
            console.log('getSystemConfig error')
            return {};
        }
    },
    getComment: async function(keyword){
        try{
            return await rq({uri: 'https://dominhit.pro/get-comment-api',json: true,qs: {keyword: keyword}})
        }
        catch (e) {
        }
    },
    updateVmStatus: async function(){
        try{
            return await rq({uri: SUB_URL + '/manage/update-vm-status',json: true,qs: {vmId: config.vm_id}})
        }
        catch (e) {
        }
    },
    getNavigator: async function(pid,os = 'Windows',browser = 'Chrome',seo){
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