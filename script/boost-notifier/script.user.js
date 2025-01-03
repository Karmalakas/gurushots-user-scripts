// ==UserScript==
// @name         GuruShots boost notifier
// @description  Mark challenge when boost is available
// @namespace    http://karmalakas.lt/
// @version      1.2.0
// @author       Karmalakas
// @updateURL    https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/boost-notifier/script.user.js
// @downloadURL  https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/boost-notifier/script.user.js
// @supportURL   https://github.com/Karmalakas/gurushots-user-scripts/issues
// @match        https://gurushots.com/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    function process() {
        var buttons = document.querySelectorAll(
            'app-active-challenge-action-button-component .blink[class^="boost"],app-active-challenge-action-button-component .blink[class*=" boost"]'
        );

        if (!buttons.length) {
            return;
        }

        for (var i = 0; i < buttons.length; i++) {
            processButton(buttons[i]);
        }
    }

    function processButton(button) {
        var challengeHolder = button.closest('challenges-item').style['boxShadow'] = '0 0 0 7px rgba(151,255,151,0.75)';
    }

    if (mutationObserver) {
        var body = document.querySelector('body');
        if (!body) {
            return;
        }

        (new mutationObserver(process)).observe(body, {
            'childList': true,
            'subtree': true
        });
    }
})();