// ==UserScript==
// @name         Neopets: Grayscale Forgotten Shore
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Makes the Forgotten Shore image black and white when there's nothing to be found
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/grayscaleForgottenShore.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/grayscaleForgottenShore.js
// @match        *://*.neopets.com/pirates/forgottenshore.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

(function() {
    'use strict';
    document.head.insertAdjacentHTML("beforeEnd", `<style>
    #shore_back:not(:has(a)) {
      filter: grayscale(1);
    }
    </style>`);
})();
