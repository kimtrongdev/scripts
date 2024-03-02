async function commentX(action) {
  try {
    await sleep(5000);
    console.log("commentTwitter action : ", action);
    let url = window.location.toString();
    reportLive(action.pid);
    const spanElement = document
      .querySelector(
        'div[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]'
      )
      .querySelector("span");

    if (spanElement) {
      // await userClick(action.pid, "spanElement", spanElement);
      // await sleep(5000);
      console.log("action.comment", action.comment);
      await userType(action.pid, "", action.comment, spanElement);
      await sleep(3000);
      const btnReply = document.querySelector(
        'div[data-testid="tweetButtonInline"]'
      );
      if (btnReply) {
        await userClick(action.pid, "btnReply", btnReply);
      }
    }
    await sleep(3000);
    console.log("spanElement", spanElement, btnReply);

    // await reportScript(action)
  } catch (error) {
    console.log("commentX errr", error);
    // await reportScript(action, false);
  }
}
