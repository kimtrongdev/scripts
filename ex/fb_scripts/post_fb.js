async function postFB(action) {
  try {
    await sleep(4000)
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
      await userScroll(action.pid, randomRanger(20,30))
      if (Number(action.min_total_member) || Number(action.min_total_post_a_day)) {
        try {
          let publicItems = getElementContainsInnerText('span', ['Công khai ·', 'Public ·'], '', 'contains', 'array')
          let items = []
          publicItems.forEach(publicItem => {
            let textItem = publicItem.innerText // 'Công khai · 3,5K thành viên · 4 bài viết/ngày'
            if (textItem) {
              textItem = textItem.split('·') //  ['Công khai ', ' 3,5K thành viên ', ' 4 bài viết/ngày']
              if (textItem.length) {
                let matched = true
                if (Number(action.min_total_member)) {
                  matched = false
                  let totalMemberData = (textItem[1] || '').trim() // '3,5K thành viên'
                  if (totalMemberData) {
                    totalMemberData = totalMemberData.split(' ')[0] // 3,5K
                    if (totalMemberData) {
                      totalMemberData = totalMemberData.replace(',', '.')
                      totalMemberData = totalMemberData.replace('k', '000')
                      if (Number(totalMemberData) && Number(totalMemberData) >= Number(action.min_total_member)) {
                        matched = true
                      }
                    }
                  }
                }

                if (Number(action.min_total_post_a_day) && matched) {
                  matched = false
                  let totalPostData = (textItem[2] || '').trim() // '4 bài viết/ngày'
                  if (totalPostData && (totalPostData.includes('/ngày') || totalPostData.includes('a day'))) {
                    totalPostData = totalPostData.replace('bài viết/ngày', '')
                    totalPostData = totalPostData.replace('+ posts a day', '')
                    totalPostData = totalPostData.replace('posts a day', '')
                    if (Number(totalPostData) && Number(totalPostData) >= Number(action.min_total_post_a_day)) {
                      matched = true
                    }
                  }
                }
                
                if (matched) {
                  items.push(publicItem)
                }
              }
            }
          })

          if (items.length) {
            let item = items[randomRanger(0, items.length - 1)]
            let pos = item.getBoundingClientRect()
            await userClick(action.pid, 'item', item, null, -(pos.width*0.6 + 45))
            return
          }
        } catch (error) {
          console.log(error);
        }
      }
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

          if (document.querySelector('div[role="dialog"]')) {
            for (let textareaEl of [...document.querySelectorAll('div[role="dialog"] textarea')]) {
              await userType(action.pid, 'textareaEl', 'Ok ad', textareaEl)
            }

            for (let radioEl of [...document.querySelectorAll('div[role="dialog"] input[type="radio"]')]) {
              await userClick(action.pid, 'radioEl', radioEl)
            }

            let sendBtn = document.querySelector('div[role="dialog"] div[aria-label="Gửi"]') || document.querySelector('div[role="dialog"] div[aria-label="Submit"]')
            if (sendBtn) {
              await userClick(action.pid, 'sendBtn', sendBtn)
            }
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
        await sleep(3000)
        if (Number(action.total_image) > 0) {
          for (let i = 1; i <= Number(action.total_image); i++) {
            let curentInput = document.querySelector('div[aria-label="Tạo bài viết công khai..."]') || document.querySelector('div[aria-label="Create a public post…"]')
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