async function fbCreatePost(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url.includes('facebook.com/groups')) {
      await sleep(3000)
      let joinBtn = getElementContainsInnerText('span', ['Join Group'], '', 'equal')
      let joined = getElementContainsInnerText('span', ['Joined'], '', 'equal')
      let followBtn = getElementContainsInnerText('span', ['Follow Group'], '', 'equal')

      if (joinBtn || joined || followBtn) {
        if (joinBtn) {
          await userClick(action.pid, 'joinBtn', joinBtn)
          await sleep(8000)

          let joinConfirmBtn = getElementContainsInnerText('span', ['Join Group Anyway'], '', 'equal')
          if (joinConfirmBtn) {
            await userClick(action.pid, 'joinConfirmBtn', joinConfirmBtn)
            await sleep(4000)
          }

          // let joined = getElementContainsInnerText('span', ['Joined'], '', 'equal')
          // if (!joined) {
          //   // report to backend
          //   await reportFBGroup(action)
          //   await reportScript(action, false)
          // }
        }
        
        let createPostInput = getElementContainsInnerText('span', ['Write something...'], '', 'equal')
        await userClick(action.pid, 'createPostInput', createPostInput)
        await sleep(5000)

        let contentInput = getElementContainsInnerText('div', ['Create a public post…'], '', 'equal')
        await userType(action.pid, 'input_post_fb', action.content + action.link, contentInput)
        await sleep(5000)
        let postBtn = getElementContainsInnerText('span', ['Post'], '', 'equal')
        await userClick(action.pid, 'postBtn', postBtn)

        await sleep(13000)

        let pendingInDiscus = false
        let discussion = getElementContainsInnerText('span', ['Discussion'], '', 'equal')
        if (discussion) {
          await userClick(action.pid, 'discussion', discussion)
          await sleep(2000)
          if (getElementContainsInnerText('span', ['Your post is pending'], '', 'equal')) {
            pendingInDiscus = true
          }
        }

        let pendingInBuy = false
        let buyAndSell = getElementContainsInnerText('span', ['Buy and Sell'], '', 'equal')
        if (buyAndSell) {
          await userClick(action.pid, 'buyAndSell', buyAndSell)
          await sleep(2000)
          if (getElementContainsInnerText('span', ['Your post is pending'], '', 'equal')) {
            pendingInBuy = true
          }
        }

        if ( (!pendingInDiscus && !pendingInBuy) || (!buyAndSell && !discussion)) {
          action.group_link = 'DELETE_' + action.group_link
          await reportFBGroup(action)
          await reportScript(action, false)
        }

        let likeBtn = getElementContainsInnerText('span', ['Like'], '', 'equal')
        await userClick(action.pid, 'likeBtn', likeBtn)

        let commentInput = getElementContainsInnerText('div', ['Write a public comment…'], '', 'equal')
        await userTypeEnter(action.pid, 'commentInput', action.comment, commentInput)
        await sleep(4000)
        await reportScript(action)
      }
      await reportScript(action, false)
    } else if (url.includes('facebook.com/profile.php')) {
      let postBtn = getElementContainsInnerText('span', ['Write something to'])
      if (postBtn) {
        await userClick(action.pid, 'postBtn', postBtn)
        await sleep(5000)

        await userType(action.pid, 'form[method="POST"] p', action.content)
        await sleep(5000)
        let postBtn = getElementContainsInnerText('span', ['Đăng', 'Post'], '', 'equal')
        await userClick(action.pid, 'postBtn', postBtn)
        await sleep(5000)
      }
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}
