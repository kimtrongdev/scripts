async function fbAddFriend(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    //https://www.facebook.com/tuyen.duong.1088/friends
    //https://www.facebook.com/groups/454797563505128/members

    await checkErrorFB(action)

    if (url.includes('facebook.com/groups')) {
      let addBtns = getElementContainsInnerText('span', ['Add friend', 'Thêm bạn bè'], '', 'equal', 'array')
      let maxFriend = Math.min(Number(action.count) || 5, addBtns.length)
      for (let index = 1; index <= maxFriend; index++) {
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