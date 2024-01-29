async function fbAddMember(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.link)
    }
    else {
      await sleep(2000)
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let btn = getElementContainsInnerText('span', ['Join Group', 'Join group'], '', 'equal')

      if (btn) {
        await userClick(action.pid, 'join btn', btn)
        let reportData = getReportFbAddMember()
        if (reportData) {
          action.data_reported = reportData
        }
        await sleep(5000)
        await reportScript(action)
        return
      }

      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

function getReportFbAddMember () {
  let reportData = ''
  let navigation = document.querySelector('div[aria-label="Group navigation"]')
  if (navigation) {
    let memberReport = getElementContainsInnerText('a', ['members'], navigation)
    if (memberReport) {
      reportData = memberReport.innerText
    }
  }

  return reportData
}
