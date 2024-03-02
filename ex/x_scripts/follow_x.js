async function followX(action) {
  try {
    await sleep(5000);
    console.log("followX followX followX", action);
    let url = window.location.toString();
    reportLive(action.pid);
    
    const link = action.link;
    const parts = link.split("/");
    const username = parts[parts.length - 1];

    let followBtn = document.querySelector(
      `div[aria-label="Follow @${username}"]`
    );
    if (followBtn) {
      await userClick(action.pid, "followBtn", followBtn);
    }
    console.log("followBtn", followBtn);
    await sleep(5000);
    await reportScript(action);
  } catch (error) {
    console.log(33, error);
    await sleep(5000);
    await reportScript(action, false);
  }
}
