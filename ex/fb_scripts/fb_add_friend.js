async function fbAddFriend(action) {
  try {
    //await userScroll(action.pid, randomRanger(10,20))
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    //https://www.facebook.com/tuyen.duong.1088/friends
    //https://www.facebook.com/groups/454797563505128/members

    //await checkErrorFB(action)
    //await userScroll(action.pid, randomRanger(5))

    if (url == 'https://www.facebook.com/') {
      await userTypeEnter(action.pid, 'label > input', action.link)
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
      if (!url.includes('/members')) {
        let everyBtn = document.querySelector('div[role="tablist"] a[href*="/members/"]')
        if (everyBtn) {
          await userClick(action.pid, 'everyBtn', everyBtn)
        } else {
          await reportScript(action, false)
        }
        return
      }
      
      let addBtns = getElementContainsInnerText('span', ['Add friend', 'Thêm bạn bè'], '', 'equal', 'array')
      let maxFriend = Math.min(Number(action.count) || 5, addBtns.length)
      for (let index = 0; index < maxFriend; index++) {
        await userClick(action.pid, 'addBtn', addBtns[index])
        await sleep(4000)
      }

      await reportScript(action)
    }
    else if (url.includes('/friends')) {
      let addBtns = getElementContainsInnerText('span', ['Add friend', 'Thêm bạn bè'], '', 'equal', 'array')
      let maxFriend = Math.min(Number(action.count) || 5, addBtns.length)
      for (let index = 1; index <= maxFriend; index++) {
        await userClick(action.pid, 'addBtn', addBtns[index])
        await sleep(4000)
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