async function likeX(action) {
  try {
    await sleep(3000);
    let url = window.location.toString();
    reportLive(action.pid);
    console.log("likeX action : ", action);

    let likeBtn = document.querySelector(`div[data-testid="like"]`);
    if (likeBtn) {
      await userClick(action.pid, "likeBtn", likeBtn);
    }

    // await reportScript(action);
  } catch (error) {
    console.log("likeX errr", error);
    // await reportScript(action, false);
  }
}
