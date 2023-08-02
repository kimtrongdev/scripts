async function postFB(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url == 'https://www.facebook.com/') {
      if (action.link.includes('facebook.com')) {
        await goToLocation(action.pid, action.link)
      } else {
        await userTypeEnter(action.pid, 'label > input', action.link)
      }
      return
    }

    if (url.includes('facebook.com/search/top')) {
      let groupBtn = document.querySelector('a[href*="/search/groups"]')
      await userClick(action.pid, 'groupBtn', groupBtn)
      return
    }
    if (url.includes('facebook.com/search/groups')) {
      let items = document.querySelectorAll('div[role="article"] g image')
      if (items) {
        let item = items[randomRanger(0, items.length - 1)]
        await userClick(action.pid, 'item', item)
      }
      return
    }

    if (url.includes('facebook.com/groups')) {
      await sleep(3000)
      let joinBtn = getElementContainsInnerText('span', ['Join Group', 'Tham gia nhóm'], '', 'equal')
      let joined = getElementContainsInnerText('span', ['Joined'], '', 'equal')
      let followBtn = getElementContainsInnerText('span', ['Follow Group'], '', 'equal')

      if (true || joinBtn || joined || followBtn) {
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
        
        let createPostInput = getElementContainsInnerText('span', ['Write something...', 'Bạn viết gì đi...'], '', 'equal')
        await userClick(action.pid, 'createPostInput', createPostInput)
        await sleep(5000)

        let contentInput = getElementContainsInnerText('div', ['Create a public post…', 'Tạo bài viết công khai...'], '', 'equal')
        await userType(action.pid, 'input_post_fb', action.content, contentInput)
        if (Number(action.total_image) > 0) {
          for (let i = 1; i <= Number(action.total_image); i++) {
            let curentInput = document.querySelector('div[aria-label="Tạo bài viết công khai..."]')
            await userPasteImage(action.pid, 'contentInput', curentInput)
            await sleep(2000)
          }
        }
        await sleep(5000)
        let postBtn = getElementContainsInnerText('span', ['Post', 'Đăng'], '', 'equal')
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