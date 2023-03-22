async function scanGroup(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, `https://www.facebook.com/search/groups?q=${action.keyword}`)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, `https://www.facebook.com/search/groups?q=${action.keyword}`)
    }
    else if (url.includes('facebook.com/search/groups')) {
      if (!action.pos_group) {
        action.pos_group = 0
      }
      let groups = document.querySelectorAll('div[role="article"] g image')
      let group = groups.item(action.pos_group)
      action.pos_group += 1
      await setActionData(action)

      if (group) {
        await userClick(action.pid, 'group', group)
      }
    }
    else if (url.includes('facebook.com/groups')) {
      let createPostInput = getElementContainsInnerText('span', ['Write something...'], '', 'equal')
      await userClick(action.pid, 'createPostInput', createPostInput)
      await sleep(5000)

      let contentInput = getElementContainsInnerText('div', ['Create a public post…'], '', 'equal')
      await userType(action.pid, 'input_post_fb', action.content + action.link, contentInput)
      await sleep(5000)
      let postBtn = getElementContainsInnerText('span', ['Post'], '', 'equal')
      await userClick(action.pid, 'postBtn', postBtn)

      await sleep(10000)

      let discussion = getElementContainsInnerText('span', ['Discussion'], '', 'equal')
      if (discussion) {
        await userClick(action.pid, 'discussion', discussion)
        await sleep(1000)
      }

      if (getElementContainsInnerText('span', ['Your post is pending'], '', 'equal')) {
        // report to backend
        history.back()
      }

      action.group_link = 'NEW_' + url
      await reportFBGroup(action)

      history.back()
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}
