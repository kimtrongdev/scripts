async function scriptSearch(action) {
  try {
    let url = window.location.toString()

    if (url.indexOf('https://www.google.com/search?q') > -1) {
      let site = getElementContainsInnerText('cite', action.site_url)
      if (site) {
        await userClick(action.pid, '', site)
      } else {
        await searchKeyword(action)
      }
    } else if (url.indexOf('https://www.google.com/') > -1) {
      await searchKeyword(action)

      // if (action.isSearched) {
      //   await sleep(3000)
      //   let randomScroll = randomRanger(3,10)
      //   await userScroll(action.pid, randomScroll)
      //   await reportScript(action)
      // } else {
      //   action.isSearched = true
      //   await setActionData(action)

      //    let keyword = action.search_keyword
      //   if (!keyword) {
      //     let rs = await fetch('https://random-data-api.com/api/commerce/random_commerce')
      //     .then(response => {
      //       console.log('response', response)
      //       return response.json()
      //     })
      //     .then(response => response)
      //     .catch(error => {
      //       return {
      //         product_name: makeName(5)
      //       }
      //     })
      //     keyword = rs.product_name
      //   }
      // }

      await sleep(60000)
    } else if (url.indexOf(action.site_url) > -1) {
      await sleep(3000)
      let randomScroll = randomRanger(3,10)
      await userScroll(action.pid, randomScroll)
      await sleep(10000)
      await reportScript(action)
    } else {
      await reportScript(action, false)
    }
  } catch (error) {
    console.log(error);
  }
}

async function searchKeyword (action) {
  if (action.search_keywords.length) {
    let keyword = action.search_keywords.shift()
    await setActionData(action)
    await userTypeEnter(action.pid,'input[maxLength="2048"]', keyword)
  } else {
    // handle end script
    await reportScript(action, false)
  }
}
