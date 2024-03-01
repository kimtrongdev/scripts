async function commentX(action) {
  try {
    let url = window.location.toString();
    reportLive(action.pid);
    console.log("commentTwitter action : ", action);

    if (url.indexOf(action.link) > -1) {
      await sleep(5000);
      const spanElement = document
        .querySelector(
          'div[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]'
        )
        .querySelector("span");

      if (spanElement) {
        await userClick(action.pid, "spanElement", spanElement);
        await sleep(5000);
        console.log(16);
        await userType(action.pid, '', action.comment_content, spanElement)

       

        await sleep(3000);

        const btnReply = document.querySelector(
          'div[data-testid="tweetButtonInline"]'
        );
        if (btnReply) {
          await userClick(action.pid, "btnReply", btnReply);
        } 
      } else {
        await reportScript(action, false)
      }

      await sleep(3000);

      console.log("spanElement", spanElement);
      await reportScript(action)
    } else {
      await reportScript(action, false);
    }
  } catch (error) {
    console.log(error);
    // await reportScript(action);
  }
}