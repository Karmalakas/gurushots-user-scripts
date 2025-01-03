// ==UserScript==
// @name         GuruShots mini-game info
// @description  Show some info for each photo in a mini-game popup
// @namespace    http://karmalakas.lt/
// @version      1.1.0
// @author       Karmalakas
// @updateURL    https://github.com/Karmalakas/gurushots-user-scripts/blob/main/script/mini-game-info/script.user.js
// @downloadURL  https://github.com/Karmalakas/gurushots-user-scripts/blob/main/script/mini-game-info/script.user.js
// @supportURL   https://github.com/Karmalakas/gurushots-user-scripts/issues
// @match        https://gurushots.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict'

    GM_addStyle('' +
        '.GS__mini_game_image_info {' +
        '    z-index: 9999;' +
        '    position: absolute;' +
        '    padding: 8px;' +
        '    margin: 8px;' +
        '    font-weight: 600;' +
        '    border-radius: 22px 8px 8px;' +
        '    color: whitesmoke;' +
        '    background-color: rgba(0, 0, 0, 0.5);' +
        '}'
    );

    const mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    const observerOptions = {'childList': true, 'subtree': true, 'attributeFilter': ['class']};

    let gameComponentElement;

    async function request(url, data) {
        const resp = await (await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-api-version': 13,
                'x-env': 'WEB',
                'x-requested-with': 'XMLHttpRequest',
                'x-token': ((name) => {
                    var value = "; " + document.cookie;
                    var parts = value.split("; " + name + "=");
                    if (parts.length == 2) return parts.pop().split(";").shift();
                })('gs_t')
            },
            method: 'POST',
            body: new URLSearchParams(Object.entries(data)).toString()
        })).json();

        if (resp.success !== true) {
            return null;
        }

        return resp.data;
    }

    async function processMiniGame(response, post) {
        gameComponentElement = document.querySelector('modal-mini-game');

        const images = {};

        for (const battle of response.images) {
            if (
                battle.is_success !== null
                || (
                    typeof images[battle.first_image.id] !== 'undefined'
                    && typeof images[battle.second_image.id] !== 'undefined'
                )
            ) {
                continue;
            }

            images[battle.first_image.id] = await request('https://api.gurushots.com/rest/get_image_data', {id: battle.first_image.id});
            images[battle.second_image.id] = await request('https://api.gurushots.com/rest/get_image_data', {id: battle.second_image.id});
        }

        initializeMiniGame(images);
    }

    function initializeMiniGame(imagesData) {
        fillImagesData(imagesData);

        mutationObserver && new MutationObserver(function (mut, observer) {
            for (const mutation of mut) {
                if (Array.from(mutation.target.classList).includes('mini-game-voting-wrapper')) {
                    observer.disconnect();
                    fillImagesData(imagesData);
                    observer.observe(gameComponentElement, observerOptions);

                    return;
                }
            }
        }).observe(gameComponentElement, observerOptions);
    }

    function fillImagesData(imagesData) {
        fillImageData(gameComponentElement.querySelector('app-mini-game-voting .image-first'), imagesData);
        fillImageData(gameComponentElement.querySelector('app-mini-game-voting .image-second'), imagesData);
    }

    function fillImageData(imageHolder, imagesData) {
        const imageSrc = imageHolder.querySelector('app-ng-image.is-image-visible img').src;
        const regex = /_(.*)\.jpg$/g;
        const imageId = Array.from(imageSrc.matchAll(regex))[0][1];
        const data = imagesData[imageId];
        const achievementsCount = getAchievementsCount(data.achievements);

        const el = document.createElement('div');
        el.className = 'GS__mini_game_image_info';
        el.innerHTML = `
            <div>👨${data.member.member_status_name} | 🏆${achievementsCount}</div>
            <div>✔${data.votes} ∕ 👁${data.views} (%${Math.round((data.votes / data.views + Number.EPSILON) * 100) / 100})</div>
        `;

        const overlay = imageHolder.querySelector('.vote-result-overlay');
        overlay.querySelector('.GS__mini_game_image_info')?.remove();
        overlay.prepend(el);
    }

    function getAchievementsCount(achievements) {
        let total = 0;

        for (const achivementType of achievements) {
            if (
                achivementType.unique_key.startsWith('CHALLENGE_LEVEL_ACHIEVEMENT.NO_PARAM')
                || achivementType.unique_key.startsWith('TOP_PHOTOGRAPHER_ACHIEVEMENT.PERCENT')
                || achivementType.unique_key.startsWith('TOP_PHOTO_ACHIEVEMENT.PERCENT')
            ) {
                continue;
            }

            total += achivementType.count;
        }

        return total;
    }

    (function () {
        const origSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.send = function (postBody) {
            this.addEventListener('load', function () {
                if (this.responseURL === "https://api.gurushots.com/rest/get_challenge_turbo") {
                    processMiniGame(JSON.parse(this.response), new URLSearchParams(postBody));
                }
            });

            origSend.apply(this, arguments);
        };
    })();
})();
