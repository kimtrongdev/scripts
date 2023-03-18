

function getElementContainsInnerText(tagName, innerText, _document = null, type = 'contains') {
  function getXPath (tagName, text) {
    let xpathMap = {
      'contains': `//${tagName}[contains(., '${text}')]`,
      'equal': `//${tagName}[text()='${text}']`
    }
    return  xpathMap[type]
  }

  if (!Array.isArray(innerText)) {
      innerText = [innerText]
  }

  for (let text of innerText) {
      let headings = document.evaluate(
        getXPath(tagName, text),
        _document || document,
        null, XPathResult.ANY_TYPE, null
      );
      if (headings) {
        return headings.iterateNext();
      }
  }
  
  return null
}
