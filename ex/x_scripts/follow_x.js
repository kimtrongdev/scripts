async function followX(action) {
    try {
      let url = window.location.toString()
      reportLive(action.pid)

      if (url.indexOf(action.link) > -1) {
        await sleep(3000)
        let followBtn = document.querySelector(`div[aria-label="Follow @VisionaryVoid"]`)
        if (followBtn) {
          await userClick(action.pid, 'followBtn', followBtn)
        } else {
          await reportScript(action, false)
        }

        await reportScript(action)
      } else {
        await reportScript(action, false)
      }

    } catch (error) {
      console.log(33, error);
      await sleep(5000)
      await reportScript(action)
    }
  }
  