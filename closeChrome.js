const { getBrowserOfProfile } = require('./src/browser/getBrowserOfProfile');

const execSync = require('child_process').execSync;

function closeChrome(pid) {
    try {
        if (WIN_ENV) {
            execSync('input CLOSE_CHROME')
        }
        else {
            if (pid) {
                execSync(`pkill -f "profiles/${pid}"`)
            }
            else {
                execSync(`pkill ${getBrowserOfProfile(pid)}`)
            }
        }
    }
    catch (e) {
    }
}

module.exports = closeChrome