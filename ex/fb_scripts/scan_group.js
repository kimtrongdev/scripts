async function scanGroup(action) {
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
    else if (url.includes('facebook.com/search/groups')) {
      let groups = document.querySelectorAll('div[role="article"] g image')
      let groupLinks = []
      let currentLenth = groups.length

      try {
        while (groups.length < 100) {
          currentLenth = groups.length
          await userScroll(action.pid, 50)
          await sleep(5000)
          groups = document.querySelectorAll('div[role="article"] g image')
          if (groups.length <= currentLenth) {
            break
          }
        }
      } catch (error) {
        console.log('error', error);
      }
      
      try {
        while (groups.length) {
          let pageGroup = groups.splice(0, 20)
          pageGroup.forEach(element => {
            let hrefEl = element.parentNode.parentNode.parentNode.parentNode
            let hrefLink = hrefEl.getAttribute('href').split('?')[0]
            let name = hrefEl.parentNode.parentNode.parentNode.querySelector('a[role="presentation"]').innerText
            hrefLink = hrefLink.replace('href="', '')
            groupLinks.push({
              link: hrefLink,
              name: name
            })
          });
          action.group_link = 'NEW_' + JSON.stringify(groupLinks)
          console.log('report', pageGroup.length);
          await reportFBGroup(action)
        }
      } catch (error) {
        console.log(error);
        await sleep(100000)
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
