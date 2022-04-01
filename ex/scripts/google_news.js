var newsNames = [
  "cnn.com",
  "theguardian.com",
  "news18.com",
  "kyma.com",
  "inquirer.com",
  "artesianews.com",
  "npr.org",
  "thehindu.com",
  "foxnews.com",
  "politico.com",
  "nbcnews.com",
  "news.yahoo.com",
]

async function scriptGoogleNews(action) {
  try {
    let url = window.location.toString()
    
    if (action.countViewed >= 3) {
      action.id = 'watch'
      action.view_type = 'random'
      await setActionData(action)
      window.open('https://www.youtube.com', 'selt')
      return
    }

    if (url.indexOf('news.google.com/topstories') > -1) {
      await sleep(3000)

      let randomPoSite = randomRanger(0, newsNames.length - 1)
      await userTypeEnter(action.pid,'form input', newsNames[randomPoSite])
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
    else if (url.indexOf('"https://news.google.com/search') > -1) {
      let articles = document.querySelectorAll('article[ve-visible="true"] h3')
      let random = randomRanger(0, articles.length - 1)
      
      if (!action.countViewed) {
        action.countViewed = 0
      }

      action.countViewed++
      await setActionData(action)
      await userClick(action.pid, '', articles[random])

      await sleep(60000)
    }
    else {
      for await (let site of newsNames) {
        if (url.indexOf(site) > -1) {

        }
      }
    }
  } catch (error) {
    
  }
}
