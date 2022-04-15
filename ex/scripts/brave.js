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
let closeSizes = [1025, 1125, 1225, 1325]

async function scriptCheckBat(action) {
  if (!action.checkingBAT) {
    action.checkingBAT = true
    await setActionData(action)

    await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
    await scrollForViewAds(action)
    await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
    await scrollForViewAds(action)
    
    await checkBAT(action) //await handleBeforeTrickAds(action)
  }
}

async function handleBraveSetting (action) {
  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await goToLocation(action.pid, `brave://settings/shields`)
  await sleep(2000)
  //click Fingerprinting blocking
  await updateUserInput(action.pid,'CLICK', 737, 894,0,0,"",'click')
  // select option
  await updateUserInput(action.pid,'CLICK', 715,917,0,0,"",'click')
  // click Trackers & ads blocking
  await updateUserInput(action.pid,'CLICK', 734,698,0,0,"",'click')
  // select option
  await updateUserInput(action.pid,'CLICK', 726,758,0,0,"",'click')

  await updateUserInput(action.pid,'CLICK',114,49,0,0,"",'go tab')
  await goToLocation(action.pid, 'accounts.google.com')
}

async function scrollForViewAds (action) {
  let positionSize = Number(action.positionSize)
  let scroll1Sizes = [1033, 1133, 1233, 1333]
  await sleep(1000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(12000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(4000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(2000)
}

async function handleBeforeTrickAds (action) {
  let positionSize = Number(action.positionSize)
  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  async function viewNews () {
      //await scrollForViewAds(action)

      let randomPoSite = randomRanger(0, newsNames.length - 1)
      await goToLocation(action.pid, `https://www.${newsNames[randomPoSite]}/`)
      await sleep(7000)
      let randomScroll = randomRanger(0,10)
      await userScroll(action.pid, randomScroll)
      await sleep(2000)
      await userScroll(action.pid, randomScroll)
      await sleep(2000)
  }

  let count = 0
  while (count < 2) {
      await viewNews()
      count++ 
  }

  //await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')

  //await scrollForViewAds(action)
  reportLive(action.pid)

  await goToLocation(action.pid, 'https://www.youtube.com/')
  await sleep(8000)
  await updateUserInput(action.pid,'CLICK', 582,650,0,0,"",'click')

  await sleep(randomRanger(10000, 15000))

  if (action.enableBAT) {
      await enableBAT(action)
      reportLive(action.pid)
      await trickAds(action)
  } else {
      //await trickAds(action)
      await checkBAT(action)
  }

  // if (action.checkBAT) {
  //    await checkBAT(action)
  // }
  // else if (action.enableBAT) {
  //     await enableBAT(action)
  // } else {
  //     await trickAds(action)
  // }

  updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
  await sleep(3000)
  await updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
 // reportScript(action)
}

async function trickAds (action) {
  let randomScroll = randomRanger(0,8)
  let positionSize = Number(action.positionSize)
  let scroll1Sizes = [1033, 1133, 1233, 1333]

  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await sleep(3000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(7000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(2000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(2000)
  // click on news
  await updateUserInput(action.pid,'CLICK', 650, 400,0,0,"",'click')
  await sleep(3000)
  await userScroll(action.pid, randomScroll)

  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await sleep(3000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(7000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(2000)
  await updateUserInput(action.pid,'CLICK', scroll1Sizes[positionSize],900,0,0,"",'click')
  await sleep(2000)

  await updateUserInput(action.pid,'CLICK', 650, 400,0,0,"",'click')
  await sleep(3000)
  randomScroll = randomRanger(0,8)
  await userScroll(action.pid, randomScroll)
}

async function checkBAT (action) {
  let positionSize = Number(action.positionSize)
  // click menu
  // let iconPosition = [1019, 1118, 1217, 1318]
  // await updateUserInput(action.pid,'CLICK', iconPosition[positionSize],82,0,0,"",'click')
  // await sleep(8000)

  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await goToLocation(action.pid,'brave://rewards/')
  await sleep(3000)

  // double click
  let textBAT = [932, 947, 997, 1013]
  await updateUserInput(action.pid,'DOUBLE_CLICK', textBAT[positionSize],299,0,0,"",'click')
  await sleep(2000)
  // copy bat data
  let rs = await updateUserInput(action.pid,'COPY_BAT', 0,0,0,0,"",'COPY_BAT')
  if (rs.disable_ads || rs.enable_ads) {
      let xPos = [638, 654, 702, 754]
      await updateUserInput(action.pid,'CLICK', xPos[positionSize],380,0,0,"",'click')
      await sleep(3000)
  }

  updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
  await sleep(3000)
  await updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
}

async function enableBAT (action) {
  // click menu browser
  await updateUserInput(action.pid,'CLICK', 1017,80,0,0,"",'click')
  await sleep(3000)
  // click brave reward
  await updateUserInput(action.pid,'CLICK', 773,218,0,0,"",'click')
  await sleep(5000)
  // click start using btn
  await updateUserInput(action.pid,'CLICK', 385,574,0,0,"",'click')
  await sleep(1000)

  // click skip
  let count = 0
  while (count <= 10) {
      await updateUserInput(action.pid,'CLICK', 488,682,0,0,"",'click')
      count++
  }

  // click setting ads/h
  await updateUserInput(action.pid,'CLICK', 568,381,0,0,"",'click')
  await sleep(1000)
  // click selection
  await updateUserInput(action.pid,'CLICK', 638,458,0,0,"",'click')
  await sleep(1000)
  // click 10ads/h
  await updateUserInput(action.pid,'CLICK', 148,713,0,0,"",'click')

  await sleep(1000)
  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'click')
  await sleep(3000)
  await updateUserInput(action.pid,'CLICK', 1033,818,0,0,"",'click')
  await sleep(2000)
  // click show brave ads
  await updateUserInput(action.pid,'CLICK', 543,650,0,0,"",'click')
  await sleep(25000)
}
