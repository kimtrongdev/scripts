async function likeX(action) {
    try {
      let url = window.location.toString()
      reportLive(action.pid)
      console.log("likeX action : ", action)

      if (url.indexOf(action.link) > -1) {
        await sleep(3000)
        let likeBtn = document.querySelector(`div[data-testid="like"]`)
        if (likeBtn) {
          await userClick(action.pid, 'likeBtn', likeBtn)
        } 
      } 
      await reportScript(action)
    } catch (error) {
      console.log("likeX", error);
      await reportScript(action)
    }
  }
  