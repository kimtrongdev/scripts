async function likePost(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.post_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (url.includes('https://www.facebook.com/profile')) {
      await goToLocation(action.pid, action.post_link)
    }
    // facebook.com/lugshop.vn/posts/pfbid
    // facebook.com/story.php?story_fbid=pfbid
    // facebook.com/watch/?v=481708590811457
    // facebook.com/photo/?fbid=
    else if (url.includes('/posts/') || url.includes('/photo/')) {
      const likeBtn = document.querySelector('div[role="dialog"] div[aria-label] span i') || document.querySelector('div[aria-label="Like"]') || document.querySelector('div[aria-label="Thích"]')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)

        let likeData = document.querySelector('div[data-visualcompletion="ignore-dynamic"]>div>div>div>div>div>div>div>span>div>span>span>span')
        if (likeData) {
          let data_reported = likeData.innerText
          action.data_reported = data_reported
        }

        await sleep(7000)
        await checkErrorAfterRunScript(action)
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