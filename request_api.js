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
    updateProfileData: async (data) => {
        return await rq({method: 'POST', uri: SUB_URL + '/api/profile/update-data', body: data, json: true})
    },
    reportScript: async (pid, serviceId = '', status = true, data_reported = '') => {
        return await rq({uri: SUB_URL + '/api/script/report',json: true,qs: { _id: serviceId, pid: pid, status: status, data_reported }})
    },
    getNewScript: async (pid) => {
        return await rq({uri: SUB_URL + '/api/script/get-new?pid='+pid, json: true})
    },
    getNewProfile: async () => {
        return await rq({uri: SUB_URL + '/api/profile',json: true,qs: {vmId: config.vm_id}})
    },
    updateProfileStatus: async (pid, vmId, status, description) => {
        return await rq({method: 'POST', uri: SUB_URL + '/profile/update-status',body: {pid: pid, vmId: vmId, status: status, description: description}, json: true})
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
}