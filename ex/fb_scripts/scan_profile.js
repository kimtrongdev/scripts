async function scanProfile(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.group_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.group_link)
    }
    else if (url.includes('/members')) {
      let groupQR = 'div[role="list"] div[role="listitem"] span>span>a[aria-hidden="true"]'
      let groups = document.querySelectorAll(groupQR)
      let groupLinks = []
      let currentLenth = groups.length
      let reportedCount = 0
      try {
        let retry = 0
        while (groups.length < 3000) {
          currentLenth = groups.length
          await userScroll(action.pid, 50)
          await sleep(5000)
          groups = document.querySelectorAll(groupQR)

          groups = [...groups]
          let currentPos = groups.length - reportedCount
          if (currentPos > 50) {
            reportLive(action.pid)
            groupLinks = []
            let pageGroup = groups.splice(reportedCount, 50)
            reportedCount = reportedCount + 50
            pageGroup.forEach(element => {
              let pID = element.href
              if (pID) {
                pID = pID.split("user/").pop()
                if (pID) {
                  pID = pID.replace('/', '')
                  if (pID) {
                    groupLinks.push(pID)
                  }
                }
              }
            })
            if (groupLinks.length) {
              action.group_link = 'PID_' + groupLinks.join(',')
              await reportFBGroup(action)
            }
          }

          if (document.querySelector('.signup_box_content')) {
            await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'logout')
          }
          // if (groups.length <= currentLenth) {
          //   if (retry <= 3) {
          //     retry++
          //   } else {
          //     break
          //   }
          // }
        }
      } catch (error) {
        console.log('error', error);
        await reportScript(action, false)
        return
      }

      await checkErrorAfterRunScript(action)
      await reportScript(action)
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}
