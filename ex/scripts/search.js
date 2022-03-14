async function scriptSearch(action) {
  try {
    let url = window.location.toString()
      
    if (url.indexOf('google.com/search?q') > -1) {
      await sleep(3000)
      let linkEl = document.querySelector(`#search a[href="${action.link}"]`)
      if (linkEl) {
        await userClick(action.pid, '', linkEl)
      }
    }
    else if (url.indexOf(action.link) > -1) {
      let randomScroll = randomRanger(7, 15)
      await userScroll(action.pid, randomScroll)
      await sleep(3000)
      await userScroll(action.pid, -randomScroll)

      await reportScript(action)
    } 
  } catch (error) {
    
  }
}