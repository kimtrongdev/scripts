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
let closeSizes = [968, 1125, 1225, 1325]

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
  if (action.is_show_ui) {
    //click Fingerprinting blocking
    await updateUserInput(action.pid,'CLICK', 1183, 737,0,0,"",'click')
    // select option
    await updateUserInput(action.pid,'CLICK', 1188, 760,0,0,"",'click')
    // click Trackers & ads blocking
    await updateUserInput(action.pid,'CLICK', 1186, 588,0,0,"",'click')
    // select option
    await updateUserInput(action.pid,'CLICK', 1185, 650,0,0,"",'click')
  } else {
    //click Fingerprinting blocking
    await updateUserInput(action.pid,'CLICK', 1183, 737,0,0,"",'click')
    // select option
    await updateUserInput(action.pid,'CLICK', 1188, 760,0,0,"",'click')
    // click Trackers & ads blocking
    await updateUserInput(action.pid,'CLICK', 1186, 588,0,0,"",'click')
    // select option
    await updateUserInput(action.pid,'CLICK', 1185, 650,0,0,"",'click')
  }

  await updateUserInput(action.pid,'GO_TO_FISRT_TAB',0,0,0,0,"",'GO_TO_FISRT_TAB')
  await goToLocation(action.pid, 'accounts.google.com')
  await sleep(15000)
}

async function scrollForViewAds (action) {
  let positionSize = Number(action.positionSize)
  let scroll1Sizes = [977, 1133, 1233, 1333]
  await sleep(1000)

  await userScroll(action.pid, 6)
  await sleep(12000)
  await userScroll(action.pid, 6)
  await sleep(4000)
  await userScroll(action.pid, 6)
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
      reportLive(action.pid)
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

  await updateActionStatus(action.pid, action.id, 1)
  updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
  await sleep(3000)
  await updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
 // reportScript(action)
}

async function trickAds (action) {
  let randomScroll = randomRanger(0,8)
  let positionSize = Number(action.positionSize)
  let scroll1Sizes = [977, 1133, 1233, 1333]

  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await sleep(3000)
  await userScroll(action.pid, 6)
  await sleep(7000)
  await userScroll(action.pid, 6)
  await sleep(2000)
  await userScroll(action.pid, 6)
  await sleep(2000)
  // click on news
  await updateUserInput(action.pid,'CLICK', 650, 400,0,0,"",'click')
  await sleep(3000)
  await userScroll(action.pid, randomScroll)

  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
  await sleep(3000)
  await userScroll(action.pid, 6)
  await sleep(7000)
  await userScroll(action.pid, 6)
  await sleep(2000)
  await userScroll(action.pid, 6)
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
  let textBAT = (action.is_show_ui ? [932, 947, 997, 1013] : [862, 877, 927, 943])
  await updateUserInput(action.pid,'DOUBLE_CLICK', textBAT[positionSize], action.is_show_ui ? 299:270 ,0,0,"",'click')
  await sleep(2000)
  // copy bat data
  let rs = await updateUserInput(action.pid,'COPY_BAT', 0,0,0,0,"",'COPY_BAT')
  if (rs.disable_ads || rs.enable_ads) {
      let xPos = [638, 654, 702, 754]
      await updateUserInput(action.pid,'CLICK', xPos[positionSize],380,0,0,"",'click')
      await sleep(3000)
  }

  await clearBSData()
  updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
  await sleep(3000)
  await updateUserInput(action.pid,'END_SCRIPT', closeSizes[positionSize],46,0,0,"",'close browser')
}

function getYPos(action, y) {
  return (action.is_show_ui ? y : y - 30)
}
function getXPos(action, x) {
  return (action.is_show_ui ? x : x - 51)
}

async function enableBAT (action) {
  await goToLocation(action.pid,'brave://rewards/')
  await sleep(5000)
  // click start using btn
  await updateUserInput(action.pid,'CLICK', getXPos(action, 385), getYPos(action, 574),0,0,"",'start using btn')
  await sleep(1000)

  // click skip
  let count = 0
  while (count <= 10) {
      await updateUserInput(action.pid,'CLICK', getXPos(action, 448), getYPos(action, 660),0,0,"",'click')
      count++
  }

  // click setting ads/h
  await updateUserInput(action.pid,'CLICK', getXPos(action, 565),getYPos(action, 380),0,0,"",'click')
  await sleep(1000)
  // click selection
  await updateUserInput(action.pid,'CLICK', getXPos(action, 638),getYPos(action, 458),0,0,"",'click')
  await sleep(1000)
  // click 10ads/h
  await updateUserInput(action.pid,'CLICK', getXPos(action, 148),getYPos(action, 713),0,0,"",'click')

  await sleep(1000)
  await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'click')
  await sleep(3000)

  await updateUserInput(action.pid,'SHOW_BRAVE_ADS', 0,0,0,0,"",'SHOW_BRAVE_ADS')
  reportLive(action.pid)
  await sleep(30000)
}
