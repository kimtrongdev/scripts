
async function directLink(action) {
  try {
    await reportScript(action)
  } catch (error) {
    console.log(error);
  }
}
