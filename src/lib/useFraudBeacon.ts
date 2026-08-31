"use client";

import { useEffect } from "react";

// Registers the checkout session's UUID with WorldPay's ThreatMetrix
// device-fingerprinting network (FraudSight) before payment, so the
// backend's risk engine has a profile to check against when the payment
// call references the same sessionID. Ported from the reference
// crypto-widget's src/helpers/useFIS.tsx (NOT actually obfuscated, just
// minified vendor JS - confirmed by reading it directly) - org id
// "dzppsd1h" and host "ddc.worldpay.com" are the merchant/backend's
// WorldPay account identifiers, not anything specific to that frontend, so
// they should be valid regardless of which widget calls the same backend.
//
// Neither deposit-onboarding nor this app ran this beacon before - both
// generated a bare random UUID for sessionID instead, and deposit-
// onboarding's own comment flags that as the likely cause of a
// "Forbidden"-shaped payment rejection (confirmed live here). This is a
// best-effort port, not something previously proven working in a Next.js
// app - if payment still fails after this, check the browser console for
// errors from the injected script itself.
export function useFraudBeacon(sessionUUID: string | null) {
  useEffect(() => {
    if (!sessionUUID) return;
    if (document.getElementById("fraudsighttmx")) return;

    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("id", "fraudsighttmx");
    script.appendChild(
      document.createTextNode(`
        var tmx=tmx||{};
        tmx.version=4,
        tmx.create_url=function(t,e,r,n,c){function i(){return Math.floor(2742745743359*Math.random())}function a(){return o(i())}function o(t){return(t+78364164096).toString(36)}var m=i(),u=i(),l=885187064159;u=((u=u-u%256+tmx.version)+m)%2742745743359,l=(l+m)%2742745743359;var s="https://"+t+"/"+(m=a()+o(m))+e,h=[(u=o(l)+o(u))+"="+r,a()+a()+"="+n];return void 0!==c&&c.length>0&&h.push(a()+a()+"="+c),s+"?"+h.join("&")},tmx.beacon=function(t,e,r,n){var c="turn:aa.online-metrix.net?transport=",i="1:"+e+":"+r,a={iceServers:[{urls:c+"tcp",username:i,credential:r},{urls:c+"udp",username:i,credential:r}]};try{var o=new RTCPeerConnection(a);o.createDataChannel(Math.random().toString());var m=function(){},u=function(t){o.setLocalDescription(t,m,m)};"undefined"==typeof Promise||o.createOffer.length>0?o.createOffer(u,m):o.createOffer().then(u,m),setInterval(function(){o.close()},1e4)}catch(t){}},tmx.load_tags=function(t,e,r,n){tmx.beacon(t,e,r,n);var c=document.getElementsByTagName("head").item(0),i=document.createElement("script");i.id="tmx_tags_js",i.setAttribute("type","text/javascript");var a=tmx.create_url(t,".js",e,r,n);i.setAttribute("src",a),tmx.set_csp_nonce(i),c.appendChild(i)},tmx.csp_nonce=null,tmx.register_csp_nonce=function(t){if(void 0!==t.currentScript&&null!==t.currentScript){var e=t.currentScript.getAttribute("nonce");null!=e&&""!==e?tmx.csp_nonce=e:void 0!==t.currentScript.nonce&&null!==t.currentScript.nonce&&""!==t.currentScript.nonce&&(tmx.csp_nonce=t.currentScript.nonce)}},tmx.set_csp_nonce=function(t){null!==tmx.csp_nonce&&(t.setAttribute("nonce",tmx.csp_nonce),t.getAttribute("nonce")!==tmx.csp_nonce&&(t.nonce=tmx.csp_nonce))},tmx.cleanup=function(){for(;null!==(hp_frame=document.getElementById("tdz_ifrm"));)hp_frame.parentElement.removeChild(hp_frame);for(;null!==(tmx_frame=document.getElementById("tmx_tags_iframe"));)tmx_frame.parentElement.removeChild(tmx_frame);for(;null!==(tmx_script=document.getElementById("tmx_tags_js"));)tmx_script.parentElement.removeChild(tmx_script)},tmx.check=function(t,e,r,n){void 0!==t&&void 0!==e&&void 0!==r&&8===e.length&&(tmx.cleanup(),tmx.register_csp_nonce(document),tmx.load_tags(t,e,r,n))};
        tmx.check('dzppsd1h','ddc.worldpay.com','${sessionUUID}',1);
      `)
    );
    document.body.appendChild(script);

    return () => {
      document.getElementById("fraudsighttmx")?.remove();
      document.getElementById("tmx_tags_js")?.remove();
    };
  }, [sessionUUID]);
}
