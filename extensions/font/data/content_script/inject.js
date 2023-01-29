var background = (function () {
  let tmp = {};
  /*  */
  chrome.runtime.onMessage.addListener(function (request) {
    for (let id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-page") {
          if (request.method === id) {
            tmp[id](request.data);
          }
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {
      tmp[id] = callback;
    },
    "send": function (id, data) {
      chrome.runtime.sendMessage({
        "method": id, 
        "data": data,
        "path": "page-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  }
})();

var inject = function () {
  let rand = {
    "noise": function () {
      let SIGN = Math.random() < Math.random() ? -1 : 1;
      return Math.floor(Math.random() + SIGN * Math.random());
    },
    "sign": function () {
      const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
      const index = Math.floor(Math.random() * tmp.length);
      return tmp[index];
    }
  };
  //
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    "get": new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight").get, {
      apply(target, self, args) {
        const height = Math.floor(self.getBoundingClientRect().height);
        const valid = height && rand.sign() === 1;
        const result = valid ? height + rand.noise() : height;
        //
        if (valid && result !== height) {
          window.top.postMessage("font-fingerprint-defender-alert", '*');
        }
        //
        return result;
      }
    })
  });
  //
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    "get": new Proxy(Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth").get, {
      apply(target, self, args) {
        const width = Math.floor(self.getBoundingClientRect().width);
        const valid = width && rand.sign() === 1;
        const result = valid ? width + rand.noise() : width;
        //
        if (valid && result !== width) {
          window.top.postMessage("font-fingerprint-defender-alert", '*');
        }
        //
        return result;
      }
    })
  });
  // Note: this variable is for targeting sandboxed iframes
  document.documentElement.dataset.fbscriptallow = true;
};

let script_1 = document.createElement("script");
script_1.textContent = "(" + inject + ")()";
document.documentElement.appendChild(script_1);
script_1.remove();

if (document.documentElement.dataset.fbscriptallow !== "true") {
  let script_2 = document.createElement("script");
  //
  script_2.textContent = `{
    const iframes = [...window.top.document.querySelectorAll("iframe[sandbox]")];
    for (let i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.HTMLElement) {
          iframes[i].contentWindow.HTMLElement.prototype.offsetWidth = HTMLElement.prototype.offsetWidth;
          iframes[i].contentWindow.HTMLElement.prototype.offsetHeight = HTMLElement.prototype.offsetHeight;
        }
      }
    }
  }`;
  //
  window.top.document.documentElement.appendChild(script_2);
  script_2.remove();
}

window.addEventListener("message", function (e) {
  if (e.data && e.data === "font-fingerprint-defender-alert") {
    background.send("fingerprint", {
      "host": document.location.host
    });
  }
}, false);