

function getElementContainsInnerText(tagName, innerText, _document = null, type = 'contains', getType = 'fisrt') {
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
        let els = []
        let rs = headings.iterateNext()
        while (rs) {
          let pos = rs.getBoundingClientRect()
          if (pos.x || pos.y || pos.width || pos.height) {
            els.push(rs)
          }
          rs = headings.iterateNext()
        }

        if (els.length) {
          if (getType == 'fisrt') {
            return els.shift()
          } else {
            return els
          }
        }
      }
  }
  
  return null
}
