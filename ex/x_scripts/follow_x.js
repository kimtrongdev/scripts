async function followX(action) {
  try {
    await sleep(5000);
    console.log("followX followX followX", action);
    let url = window.location.toString();
    reportLive(action.pid);
    let followBtn = document.querySelector(
      `div[aria-label="Follow ${action.user_name}"]`
    );
    if (followBtn) {
      await userClick(action.pid, "followBtn", followBtn);
    }
    console.log('followBtn', followBtn);
    await sleep(5000);
    await reportScript(action);
  } catch (error) {
    console.log(33, error);
    await sleep(5000);
    await reportScript(action, false);
  }
}
