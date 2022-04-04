var newsNames = [
  "cnn.com",
  "theguardian.com",
  "news18.com",
  "kyma.com",
  "inquirer.com",
  "npr.org",
  "thehindu.com",
  "politico.com",
  "nbcnews.com",
  "abc10.com",
  "click2houston.com",
  "kktv.com",
  "wsbtv.com",
  "al.com",
  "fox5atlanta.com",
  "sltrib.com",
  "pennlive.com",
  "kiro7.com",
  "wsfa.com",
]

async function scriptGoogleNews(action) {
  try {
    let url = window.location.toString()
    
    if (url.indexOf('https://www.google.com/') > -1) {
      await goToLocation(action.pid, 'https://news.google.com/topstories')
      await sleep(60000)
    }

    if (action.countViewed >= 2) {
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
      let articles = document.querySelectorAll('article[ve-visible="true"] h3')
      let random = randomRanger(0, articles.length - 1)
      
      await sleep(2000)
      await userClick(action.pid, '', articles.item(random))

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
          await setActionData(action)
          
          await sleep(2000)
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
