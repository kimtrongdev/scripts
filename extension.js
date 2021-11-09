function copyTextToClipboard(text) {
    let textArea = document.createElement('textarea');
    textArea.value = text;

    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    document.execCommand('copy');

    document.body.removeChild(textArea);
}

async function getExtensionInfo(){
    let info = {}
    let menuBarHeight = window.outerHeight - window.innerHeight

    let extensions = document.querySelector('extensions-manager').shadowRoot.querySelector('extensions-item-list').shadowRoot.querySelectorAll('extensions-item')
    if(Array.from(extensions).filter(e => e.shadowRoot.querySelector('#name-and-version').textContent.indexOf('ViewerViewer') == 0).length > 0){
        info.installed = true
        copyTextToClipboard(JSON.stringify(info))
        return
    }

    // get dev mode position
    let devMode = document.querySelector('extensions-manager').shadowRoot.querySelector('extensions-toolbar').shadowRoot.querySelector('#devMode')
    if(devMode.getAttribute('aria-pressed')=='false') {
        devMode.click()
        await new Promise(resolve => setTimeout(function () {
            resolve('ok')
        }, 3000))
    }
    // get load package position
    let loadPackage = document.querySelector('extensions-manager').shadowRoot.querySelector('extensions-toolbar').shadowRoot.querySelector('#loadUnpacked')
    let pos = loadPackage.getBoundingClientRect()

    info.x  = pos.left + window.screenX + pos.width*0.3
    info.y = pos.top + window.screenY + menuBarHeight + pos.height*0.3
    copyTextToClipboard(JSON.stringify(info))
    return
}

getExtensionInfo()