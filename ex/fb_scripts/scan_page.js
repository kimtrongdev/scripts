async function scanPage(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, `https://www.facebook.com/search/groups?q=${action.keyword}&filters=eyJwdWJsaWNfZ3JvdXBzOjAiOiJ7XCJuYW1lXCI6XCJwdWJsaWNfZ3JvdXBzXCIsXCJhcmdzXCI6XCJcIn0ifQ%3D%3D`)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, `https://www.facebook.com/search/groups?q=${action.keyword}&filters=eyJwdWJsaWNfZ3JvdXBzOjAiOiJ7XCJuYW1lXCI6XCJwdWJsaWNfZ3JvdXBzXCIsXCJhcmdzXCI6XCJcIn0ifQ%3D%3D`)
    }
    else if (url.includes('facebook.com/search/pages')) {
      let groupQR = 'div[role="article"] g image'
      let groups = document.querySelectorAll(groupQR)
      let groupLinks = []
      let currentLenth = groups.length

      let reportedCount = 0
      try {
        let retry = 0
        while (groups.length < 1000) {
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
              let hrefEl = element.parentNode.parentNode.parentNode.parentNode
              let hrefLink = hrefEl.getAttribute('href').split('?')[0]
              let name = hrefEl.parentNode.parentNode.parentNode.querySelector('a[role="presentation"]').innerText
              hrefLink = hrefLink.replace('href="', '')
              if (hrefLink != 'https://www.facebook.com/profile.php') {
                groupLinks.push({
                  link: hrefLink,
                  name: name
                })
              }
            })
            if (groupLinks.length) {
              action.group_link = 'PAGE_' +  JSON.stringify(groupLinks)
              reportFBGroup(action)
            }
          }

          if (groups.length <= currentLenth) {
            if (retry <= 3) {
              retry++
            } else {
              break
            }
          }
        }
      } catch (error) {
        console.log('error', error);
      }

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
