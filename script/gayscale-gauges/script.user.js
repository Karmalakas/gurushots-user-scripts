
// ==UserScript==
// @name         GuruShots grayscale fill gauges
// @description  Make all gauges on GuruShots grayscale
// @namespace    http://karmalakas.lt/
// @version      1.2.0
// @author       Karmalakas
// @updateURL    https://github.com/Karmalakas/gurushots-user-scripts/blob/main/script/grayscale-gauges/script.user.js
// @downloadURL  https://github.com/Karmalakas/gurushots-user-scripts/blob/main/script/grayscale-gauges/script.user.js
// @supportURL   https://github.com/Karmalakas/gurushots-user-scripts/issues
// @match        https://gurushots.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle('' +
        '.c-challenges-item__exposure__meter__wrapper img {filter: grayscale(1);}'
    );
})();