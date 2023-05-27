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
      let addBtns = document.querySelectorAll('div[role="list"] div[role="listitem"] div[role="button"]')
      let maxFriend = Math.min(Number(action.count) || 5, addBtns.length)
      for (let index = 0; index < maxFriend; index++) {
        await userClick(action.pid, 'addBtn', addBtns.item(index))
        await sleep(2000)
      }
    }
    else if (url.includes('/friends')) {
      let addBtns = document.querySelectorAll('div[style="border-radius:max(0px, min(8px, calc((100vw - 4px - 100%) * 9999))) / 8px"] div[role="button"]')
      let maxFriend = Math.min(Number(action.count) || 5, addBtns.length)
      for (let index = 0; index < maxFriend; index++) {
        await userClick(action.pid, 'addBtn', addBtns.item(index))
        await sleep(2000)
      }
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}