(()=>{"use strict";window.addEventListener("checkIsHCaptchaSolved",(()=>{var e;const t=new CustomEvent("checkIsHCaptchaSolvedResponse",{detail:""!==(null===(e=null===window||void 0===window?void 0:window.hcaptcha)||void 0===e?void 0:e.getResponse())});window.dispatchEvent(t)})),window.addEventListener("checkIsReCaptchaSolved",(()=>{var e;const t=new CustomEvent("checkIsReCaptchaSolvedResponse",{detail:""!==(null===(e=null===window||void 0===window?void 0:window.grecaptcha)||void 0===e?void 0:e.getResponse())});window.dispatchEvent(t)})),window.addEventListener("getLocationHrefEvent",(()=>{var e;const t=new CustomEvent("getLocationHrefResponse",{detail:null===(e=null===window||void 0===window?void 0:window.location)||void 0===e?void 0:e.href});window.dispatchEvent(t)})),window.addEventListener("resetRecaptchaFrameEvent",(()=>{var e;try{null===(e=null===window||void 0===window?void 0:window.grecaptcha)||void 0===e||e.reset()}catch(e){}})),window.addEventListener("setSettingsToGlobalEvent",(e=>{try{const t=e.detail;function n(e,t,n){e[t]=n;const o=new CustomEvent("propertySet",{detail:{property:t,value:n}});window.dispatchEvent(o)}const o=new Proxy(t,{set:n});window[t.globalVariable||"CMExtension"]=o}catch(e){}})),window.addEventListener("dispatchEventToPageEvent",(e=>{const{dispatchEvent:t,dispathParams:n}=e.detail;try{const e=new CustomEvent(t,n);window.dispatchEvent(e)}catch(e){}}))})();