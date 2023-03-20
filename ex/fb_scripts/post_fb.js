async function postFB(action) {
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
    else if (url.includes('facebook.com/groups')) {
      let joinBtn = getElementContainsInnerText('span', ['Join Group'], '', 'equal')
      if (joinBtn) {
        await userClick(action.pid, 'joinBtn', joinBtn)
        await sleep(8000)

        let joinConfirmBtn = getElementContainsInnerText('span', ['Join Group Anyway'], '', 'equal')
        if (joinConfirmBtn) {
          await userClick(action.pid, 'joinConfirmBtn', joinConfirmBtn)
          await sleep(4000)
        }

        let joined = getElementContainsInnerText('span', ['Joined'], '', 'equal')
        if (!joined) {
          // report to backend
          await reportGroup(action)
          await reportScript(action, false)
        }

        let createPostInput = getElementContainsInnerText('span', ['Write something...'], '', 'equal')
        await userClick(action.pid, 'createPostInput', createPostInput)
        await sleep(2000)

        let contentInput = getElementContainsInnerText('div', ['Create a public post…'], '', 'equal')
        await userType(action.pid, 'contentInput', action.content + action.link, contentInput)
        let postBtn = getElementContainsInnerText('span', ['Post'], '', 'equal')
        await userClick(action.pid, 'postBtn', postBtn)

        await sleep(2000)

        if (getElementContainsInnerText('span', ['Your post is pending'], '', 'equal')) {
          // report to backend
          await reportGroup(action)
          await reportScript(action, false)
        }

        let likeBtn = getElementContainsInnerText('span', ['Like'], '', 'equal')
        await userClick(action.pid, 'likeBtn', likeBtn)

        await reportScript(action)
      }
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

function getFolowDataPage () {
  let likeData = ''
  //let url = window.location.toString()

  let likeEl = document.querySelector('div[role="main"]>div>div>div>div>div>div>div>div>div>span')
  if (likeEl) {
    likeData = likeEl.innerText
  }
  return likeData
}