async function scriptSearch(action) {
  try {
    let url = window.location.toString()
      
    if (url.indexOf('https://www.google.com/') > -1) {
      if (action.isSearched) {
        await sleep(3000)
        let randomScroll = randomRanger(3,10)
        await userScroll(action.pid, randomScroll)
        await reportScript(action)
      } else {
        action.isSearched = true
        await setActionData(action)

        let keyword = action.search_keyword
        if (!keyword) {
          let rs = await fetch('https://random-data-api.com/api/commerce/random_commerce')
          .then(response => {
            console.log('response', response)
            return response.json()
          })
          .then(response => response)
          .catch(error => {
            return {
              product_name: makeName(5)
            }
          })
          keyword = rs.product_name
        }

        await userTypeEnter(action.pid,'input[maxLength="2048"]', keyword)
      }

      await sleep(60000)
    }
  } catch (error) {
    
  }
}