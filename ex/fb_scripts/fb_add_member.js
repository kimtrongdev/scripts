async function fbAddMember(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url.includes('facebook.com/groups')) {
      let joinBtn = getElementContainsInnerText('span', ['Tham gia nhóm'], '', 'equal')
      if (joinBtn) {
        await userClick(action.pid, 'joinBtn', joinBtn)
        await sleep(3000)
      }

      let inviteBtn = getElementContainsInnerText('span', ['Mời'], '', 'equal')
      if (inviteBtn) {
        await userClick(action.pid, 'inviteBtn', inviteBtn)
        await sleep(5000)
        const items = document.querySelectorAll('div[aria-checked="false"] i[data-visualcompletion="css-img"]')
        let count = 0
        let max = 3
        for (let item of items) {
          await userClick(action.pid, 'item', item)
          await sleep(2000)
          count++
          if (count > max) {
            break
          }
        }

        const confirmBtn = getElementContainsInnerText('span', ['Gửi lời mời'], '', 'equal')
        await userClick(action.pid, 'confirmBtn', confirmBtn)
        await sleep(2000)
        await reportScript(action)
      }
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}
