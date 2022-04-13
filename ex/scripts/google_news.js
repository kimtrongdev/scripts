
async function scriptGoogleNews(action) {
  try {
    let url = window.location.toString()

    for await (let site of newsNames) {
      if (url.indexOf(site) > -1) {
        await sleep(7000)
        let randomScroll = randomRanger(0,10)
        await userScroll(action.pid, randomScroll)
        await sleep(2000)
        await userScroll(action.pid, randomScroll)
        await sleep(2000)
        await reportScript(action)
        break
      }
    }

    return

    //let url = window.location.toString()
    
    if (url.indexOf('https://www.google.com/') > -1) {
      if (action.isSearched) {
        //await goToLocation(action.pid, 'https://news.google.com/topstories')
        await sleep(3000)
        let randomScroll = randomRanger(3,10)
        await userScroll(action.pid, randomScroll)
        await handleBeforeTrickAds(action)
      } else {
        action.isSearched = true
        await setActionData(action)

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

        let key = rs.product_name
        await userTypeEnter(action.pid,'input[maxLength="2048"]', key)
      }

      await sleep(60000)
    }

    return

    if (action.countViewed >= (Number(action.brave_view_news_count) || 0)) {
      action.id = 'watch'
      action.view_type = 'random'
      await setActionData(action)
      await goToLocation(action.pid, 'https://www.youtube.com')

      return
    }

    if (url.indexOf('news.google.com/topstories') > -1) {
      await sleep(3000)

      let randomPoSite = randomRanger(0, newsNames.length - 1)
      await userTypeEnter(action.pid,'form', newsNames[randomPoSite])
      // newsNames = []
      // let newsElements = []
      // for await (let newsName of newsNames) {
      //   let xpath = `//a[text()='${newsName}']`;
      //   let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      //   if (matchingElement) {
      //     newsElements.push(matchingElement)
      //   }
      // }

      // let randomPo = randomRanger(0, newsElements.length - 1)
      // await userClick(action.pid, '', newsElements[randomPo])
      await sleep(60000)
    } 
    else if (url.indexOf('https://news.google.com/search') > -1) {
      if (action.reSearch) {
        action.reSearch = false
        await setActionData(action)
        let randomPoSite = randomRanger(0, newsNames.length - 1)
        await userTypeEnter(action.pid,'form', newsNames[randomPoSite])
        await sleep(10000)
      }

      let articles = document.querySelectorAll('article[ve-visible="true"]')
      let random = randomRanger(0, articles.length - 1)
      
      await sleep(2000)
      await userClick(action.pid, 'article[ve-visible="true"] - ' + random, articles.item(random))

      await sleep(60000)
    }
    else {
      console.log('check sites news')
      for await (let site of newsNames) {
        if (url.indexOf(site) > -1) {
          if (!action.countViewed) {
            action.countViewed = 0
          }
    
          action.countViewed++
          action.reSearch = true
          await setActionData(action)
          let randomScroll = randomRanger(3,10)

          await userScroll(action.pid, randomScroll)
          await sleep(1000)
          await userScroll(action.pid, -randomScroll)

          await updateUserInput(action.pid,'CLICK',114,49,0,0,"",'go tab')
          await sleep(2000)
         // await updateUserInput(action.pid,'CLICK',159,83,0,0,"",'reload')
          await updateUserInput(action.pid,'RELOAD_PAGE',0,0,0,0,"",'reload')
          break
        }
      }
    }
  } catch (error) {
    
  }
}
