const path = require('path')
const request_api = require('../../request_api')
const { closeChrome } = require('../browser/closeChrome');
const { TIKTOK_CAPCHA_API_KEY, LOCAL_PORT } = require('../constant');
const execSync = require('child_process').execSync;
const request2 = require('request').defaults({ encoding: null });
const del = require('del');
const { stopDisplay } = require('../execSync/stopDisplay');
const utils = require('../../utils');
const { ids, isPauseAction, systemConfig , IS_REG_USER, BACKUP, ERROR_TYPE_1_MAP, actionsData} = require('../settings');
const { getScriptData } = require('../../main');
const { runUpdateVps } = require('../execSync/runUpdateVps');
let addresses = require('../adress.json').addresses
const request = require('request-promise')


function initExpress() {
    const express = require('express')
    const app = express()

    app.get('/handle-capcha-tiktok', async (req, res) => {
        let data = req.query
        let result = await handleCapchaTiktok(data)
        return res.json({ success: true, result })
    })

    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.resolve("favicon.ico"))
        return
    })

    app.get('/debug', (req, res) => {
        isPauseAction = true
        res.send({ rs: 'ok' })
        return
    })

    app.get('/report-playlist-jct', async (req, res) => {
        let rs = await request_api.reportPlaylistJCT(req.query)
        return res.send(rs)
    })

    app.get('/reset-profile-by-pid', async (req, res) => {
        const pid = req.query.pid
        if (pid) {
            console.log('--reset pid: ', pid)
            let updateData = {
                pid,
                status: 'NEW',
                description: 're_login',
            }

            removePidAddnew(pid, 0)
            await utils.sleep(5000)
            await request_api.updateProfileData(updateData)
        }
        return res.send({ success: true })
    })

    app.get('/get-comment', async (req, res) => {
        let rs = await request_api.getComment()
        return res.send(rs)
    })

    app.get('/get-phone', async (req, res) => {
        let rs = await request_api.getPhone(req.query.re_phone)
        res.send(rs)
        return
    })

    app.get('/update-profile-data', async (req, res) => {
        let data = req.query
        request_api.updateProfileData(data)
        res.send({})
        return
    })

    app.get('/get-address-random', async (req, res) => {
        console.log(addresses.length);
        const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
        console.log(randomAddress);
        return res.send(randomAddress)
    })

    app.get('/report-fb-group', async (req, res) => {
        let groupLink = req.query.group_link
        let groupTopic = req.query.fb_topic_code
        console.log('---groupLink--', groupLink);
        let rs = await request_api.reportFBGroup(groupLink, groupTopic)
        res.send(rs)
        return
    })

    app.get('/get-phone-code', async (req, res) => {
        let order_id = req.query.order_id
        let api_name = req.query.api_name
        let rs = await request_api.getPhoneCode(order_id, api_name)
        res.send(rs)
        return
    })

    app.get('/get-mail-code', async (req, res) => {
        let mail = req.query.mail
        let rs = await request_api.getMailCode(mail)
        res.send(rs)
        return
    })

    app.get('/report-mail-code', async (req, res) => {
        let data = req.query
        let rs = await request_api.reportMailCode(data)
        res.send(rs)
        return
    })

    app.get('/get-reco-mails', async (req, res) => {
        console.log('get reco mail');
        let data = req.query
        let rs = await request_api.getRecoMails(data)
        console.log('get reco rs', rs);
        res.send(rs)
        return
    })

    app.get('/login', (req, res) => {
        utils.log(req.query)
        if (req.query.status == 1) {
            utils.log(req.query.pid, 'login success')
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED')
        }
        else {
            utils.log(req.query.pid, 'login error', req.query.msg)
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'ERROR', req.query.msg)
        }
        removePidAddnew(req.query.pid, req.query.status)

        res.send({ rs: 'ok' })
    })

    app.get('/get-new-playlist', async (req, res) => {
        let rs = await request_api.getYTVideo()
        let playlist = rs.playlist
        handlePlaylistData(playlist)
        res.send(playlist)
    })

    app.get('/report', async (req, res) => {
        if (isPauseAction) {
            //res.send({ rs: 'ok' })
            return
        }
        utils.log(req.query)

        if (req.query.id == 'reg_account' || req.query.id == 'change_pass') {
            let action = req.query

            if (req.query.id == 'change_pass' && req.query.status == '0') {
                if (req.query.msg.startsWith('UPDATE_FB_SUCCESS_TO_')) {
                    req.query.msg = req.query.msg.replace('UPDATE_FB_SUCCESS_TO_', '')
                    request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR', password: req.query.msg, description: 'update_success', proxy_server: proxy[req.query.pid].server })
                } else {
                    request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR', description: req.query.msg })
                }
                return res.json({})
            }

            if (action.username && action.password) {
                request_api.reportAccount({
                    username: action.username,
                    password: action.password,
                    verify: action.verify,
                    type: action.type,
                    reg_ga_success: action.reg_ga_success,
                    proxy_server: proxy[action.pid].server
                })

                if (req.query.id == 'change_pass') {
                    request_api.updateProfileData({ pid: req.query.pid, status: 'TRASH', description: 'update_pass_to_' + action.password })
                }
            }

            if (action.reg_ga_success) {
                request_api.updateProfileData({ pid: Number(action.pid), status: 'ERROR', description: 'ga' })
            }

            if (action.stop && action.stop != 'false') {
                removePidAddnew(req.query.pid, 0)
            }
        }
        else if (req.query.id == 'total_created_channel') {
            request_api.updateProfileData({ pid: req.query.pid, total_created_users: req.query.count })
        }
        else if (req.query.id == 'live_report') {
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
        }
        else if (req.query.isScriptReport) {
            if (req.query.status == 'ERROR_TYPE_1') {
                req.query.isBreak = true
                let pid = req.query.pid
                if (!ERROR_TYPE_1_MAP[pid]) {
                    ERROR_TYPE_1_MAP[pid] = 1
                }

                ERROR_TYPE_1_MAP[pid]++
                if (ERROR_TYPE_1_MAP[pid] > 3) {
                    delete ERROR_TYPE_1_MAP[pid]
                    removePidAddnew(pid, 0)
                }
                return
            }

            if (!['watch', 'create_playlist', 'search', 'end_script'].includes(req.query.script_code)) {
                await request_api.reportScript(req.query.pid, req.query.service_id, req.query.status, req.query.data_reported)
            }

            if (req.query.script_code == 'add_recovery_mail' && !req.query.data_reported.includes('p_not_found_code')) {
                closeChrome(req.query.pid, systemConfig.browsers)
                deleteProfile(req.query.pid)
                ids = ids.filter(i => i != req.query.pid)
                runnings = runnings.filter(i => i.pid != req.query.pid)
                return
            }
            if ([1, '1', 'true', true].includes(req.query.isBreak)) {
                // execSync(`xdotool key Control_L+w && sleep 1`)
                // browser will closed by background extention
                closeChrome(req.query.pid, systemConfig.browsers)
                runnings = runnings.filter(i => i.pid != req.query.pid)
            } else {
                let action = await getScriptData(req.query.pid)
                if (req.query.script_code == action.script_code) {
                    closeChrome(req.query.pid, systemConfig.browsers)
                    runnings = runnings.filter(i => i.pid != req.query.pid)
                } else {
                    runnings.forEach(running => {
                        if (running.pid == req.query.pid) {
                            running.lastReport = Date.now()
                        }
                    });
                    return res.json(action)
                }
            }
        }
        else if (req.query.id == 'channel-position') {
            let channel = usersPosition.find(u => u.pid == req.query.pid)
            if (channel) {
                channel.position = req.query.position
            } else {
                usersPosition.push({
                    pid: req.query.pid,
                    position: req.query.position,
                })
            }

            if (usersPosition) {
                config.usersPosition = usersPosition
                fs.writeFileSync("vm_log.json", JSON.stringify(config))
            }
        }
        else if (req.query.id == 'watched') {
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
            request_api.updateWatchedVideo(req.query.pid, req.query.viewedAds)
        }
        else if ((req.query.report_error_profile && req.query.report_error_profile != 'false') || req.query.id == 'login' || req.query.id == 'reg_user' || req.query.id == 'reg_user_youtube' || req.query.id == 'check_mail_1' || req.query.id == 'recovery_mail') {
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'login success')
                if (req.query.id == 'reg_user') {
                    request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR' })
                } else {
                    let params = { pid: req.query.pid, status: 'SYNCED' }
                    if (systemConfig.is_fb) {
                        params.proxy_server = proxy[req.query.pid].server
                    }
                    request_api.updateProfileData(params)
                }
            }
            else {
                utils.log(req.query.pid, 'login error', req.query.msg)
                request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR', description: req.query.msg })
            }
            removePidAddnew(req.query.pid, req.query.status)
        }
        else if (req.query.id == 'logout') {
            utils.log(req.query.pid, 'logout ok')
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'ERROR', 'disabled_logout')
            ids = ids.filter(x => x != req.query.pid)
            deleteProfile(req.query.pid)
        }
        else if (req.query.id == 'confirm') {
            utils.log(req.query.pid, 'confirm', req.query.status)
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'confirm success')
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', 'CONFIRM_SUCCESS')
            }
            else {
                utils.log(req.query.pid, 'confirm error', req.query.msg)
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
            }
        }
        else if (req.query.id == 'changepass') {
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
        }
        else if (req.query.id == 'checkpremium' || req.query.id == 'checkcountry') {
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
        }
        else if (req.query.id == 'watch') {
            if (req.query.stop == 'true' || req.query.stop == true) {
                runnings = runnings.filter(i => i.pid != req.query.pid)
            }
        }
        else if (req.query.id == 'sub') {
            if (req.query.stop == 'true' || req.query.stop == true) {
                utils.log('remove pid from subRunnings', req.query.pid)
                subRunnings = subRunnings.filter(x => x.pid != req.query.pid)
            }
        }
        if (req.query.msg && req.query.msg == 'NOT_LOGIN') {
            utils.log('error', req.query.pid, 'NOT_LOGIN')
            deleteProfile(req.query.pid)
            ids = ids.filter(x => x != req.query.pid)
            deleteBackup(req.query.pid)
        }
        res.send({ rs: 'ok' })
    })

    app.get('/run-update-vps', (req, res) => {
        runUpdateVps()
        res.send({ success: true })
    })

    app.get('/action', (req, res) => {
        utils.log(req.query)
        res.send(JSON.stringify(req.query))
    })

    app.get('/input', async (req, res) => {
        actionsData.push({ ...req.query, res })
    })

    app.listen(LOCAL_PORT, () => {
        utils.log('start app on', LOCAL_PORT)
    })
}

function handlePlaylistData(playlist) {
    const properties = [
      'total_times_next_video',
      'watching_time_non_ads',
      'watching_time_start_ads',
      'watching_time_end_ads'
    ];
  
    for (const prop of properties) {
      if (!playlist[prop]) {
        delete playlist[prop];
      }
    }
  }

const getBase64FromUrl = async (url) => {
    return new Promise((resolve) => {
        request2.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body.toString('base64'))
            }
        })
    })
}

async function handleCapchaTiktok(data) {
    let job
    if (data.type == 'cicle') {
        let innerImage = ''
        let outerImage = ''
        await Promise.all([
            getBase64FromUrl(data.innerImageURL),
            getBase64FromUrl(data.outerImageURL)
        ]).then(rs => {
            innerImage = rs[0]
            outerImage = rs[1]
        })

        // send data to api
        job = await createJob({ type_job_id: 23, image_base64: innerImage + '|' + outerImage })
    } else if (data.type == 'square') {
        // shot screen
        let capchaImgName = 'tiktokCapcha' + Date.now()
        execSync(`${nircmdPath} savescreenshot ${path.join(process.cwd(),"logscreen")}/${capchaImgName}.png ${data.startImageX} ${data.startImageY} ${data.endImageX - data.startImageX} ${data.endImageY - data.startImageY}`)
        let imageBase64 = fs.readFileSync(`${path.join(process.cwd(),"logscreen")}/${capchaImgName}.png`, { encoding: 'base64' })
        job = await createJob({ type_job_id: 21, image_base64: imageBase64, width_view: data.image_width })
    }
    let result = { status: 'waiting' }
    while (result.status == 'waiting' || result.status == 'running') {
        result = await getJobResult(job.job_id)
        await utils.sleep(3000)
    }
    console.log('final res', result)
    return result
}

async function createJob(capchaData) {
    try {
        const url = 'https://omocaptcha.com/api/createJob'
        const requestData = {
            api_token: TIKTOK_CAPCHA_API_KEY,
            data: capchaData,
        }

        return new Promise((resolve, reject) => {
            request['post']({
                url,
                headers: {
                    "Content-Type": "application/json",
                },
                json: true,
                body: requestData,
            }, async (err, response, data) => {
                console.log('--', data)
                if (data.job_id) {
                    return resolve({
                        success: true,
                        job_id: data.job_id
                    })
                }
                return reject({ success: false, data, err })
            })
        })
    } catch (err) {
        console.log('Error while getRequest', err)
    }
}

function removePidAddnew(pid, status) {
    try {
        runnings = runnings.filter(x => x.pid != pid)
        if (status != 1 || IS_REG_USER) {
            // login error
            deleteProfile(pid)
            utils.log('removePidAddnew', pid, status)
        }
        else {
            // login success
            closeChrome(pid, systemConfig.browsers)
            if (!ids.filter(x => x == pid).length) {
                ids.push(pid)
            }
        }

        if (IS_REG_USER) {
            ids = ids.filter(x => x != pid)
        }
        utils.log(ids)
    }
    catch (e) {
        utils.log('error removePidAddnew',  e)
    }
}

async function deleteProfile(pid, retry = 0) {
    ids = ids.filter(x => x != pid)
    runnings = runnings.filter(r => r.pid != pid)
    try {
        stopDisplay(pid)
        closeChrome(pid, systemConfig.browsers)
        del.sync([path.resolve("profiles", pid + '', '**')], { force: true })
    }
    catch (e) {
        utils.log('error', 'deleteProfile', pid, retry)
        if (retry < 3) {
            await utils.sleep(3000)
            await deleteProfile(pid, retry + 1)
        }
    }
}


async function deleteBackup(pid, retry = 0) {
    try {
        return;
        if (!BACKUP || WIN_ENV) return
        utils.log('deleteBackup', pid, retry)
        execSync(`sshpass -p "DMYT@2020" ssh -o "StrictHostKeyChecking=no" root@35.236.64.121 'rm -f /home/pf.dominhit.pro/public_html/seo_6/${pid}.tar'`)
        if (execSync(`curl -Is http://pf.dominhit.pro/seo_6/${pid}.tar | head -1`).indexOf('404') < 0) throw 'DELETE_ERROR'
    }
    catch (e) {
        utils.log('error', 'deleteBackup', e)
        if (retry < 3) {
            await utils.sleep(10000)
            await deleteBackup(pid, retry + 1)
        }
    }
}

module.exports = { initExpress }