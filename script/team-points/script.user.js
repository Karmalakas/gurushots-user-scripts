// ==UserScript==
// @name         GuruShots team points
// @description  Show team points based on current vote count in a team battle
// @namespace    http://karmalakas.lt/
// @version      1.2.1
// @author       Karmalakas
// @updateURL    https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/team-points/script.user.js
// @downloadURL  https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/team-points/script.user.js
// @supportURL   https://github.com/Karmalakas/gurushots-user-scripts/issues
// @match        https://gurushots.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle('' +
        '.match-active-header > app-ng-image-component.match-active-header__vs {' +
        '    display: block;' +
        '    text-align: center;' +
        '}' +
        '.match-active-header > app-ng-image-component.match-active-header__vs div[class^="diff-"] {' +
        '    font-weight: 700;' +
        '    font-size: 16px;' +
        '    margin-top: -22px;' +
        '}' +
        '.match-active-header > app-ng-image-component.match-active-header__vs div.diff-red {' +
        '    color: #933;' +
        '    text-shadow: 0px 0px 3px #F00;' +
        '}' +
        '.match-active-header > app-ng-image-component.match-active-header__vs div.diff-green {' +
        '    color: #070;' +
        '    text-shadow: 0px 0px 3px #070;' +
        '}' +
        '.match-active-header__item-content__badge-wrapper__total-votes {' +
        '    padding: 0 8px;' +
        '    width: auto;' +
        '    left: 50%;' +
        '    transform: translate(-50%);' +
        '}' +
        '.match-active-header__item-content__badge-wrapper__total-votes div.GS__team_result {' +
        '    margin-left: 8px;' +
        '    font-weight: 600;' +
        '    font-size: 12px;' +
        '}' +
        '.match-state-CLOSED.match-myteam-won .match-active-header__my-team .match-active-header__item-content__badge-wrapper__total-votes,' +
        '.match-state-CLOSED.match-opponent-won .match-active-header__opponent .match-active-header__item-content__badge-wrapper__total-votes {' +
        '    background-color: #e9b009;' +
        '}'
    );

    const mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    const observerOptions = {'childList': true, 'subtree': true};
    const observeTarget = document.querySelector('body');

    function process(matchHeader) {
        var voteHolders = matchHeader.querySelectorAll('.match-active-header__item-content__badge-wrapper__total-votes');

        if (voteHolders.length !== 2) {
            return;
        }

        let data = [];

        for (var i = 0; i < voteHolders.length; i++) {
            data.push(
                {
                    holder: voteHolders[i],
                    votes: parseInt(voteHolders[i].querySelector(':scope > div:first-child').innerText)
                }
            );
        }

        processData([...data]);
        addDiff(
            matchHeader.querySelector(':scope > app-ng-image-component.match-active-header__vs'),
            data[0].votes,
            data[1].votes
        );
    }

    function processData(data) {
        data.sort((a, b) => Math.sign(b.votes - a.votes));

        addResult(data[0].holder, calcWinner(data[0].votes, data[1].votes));
        addResult(data[1].holder, calcLoser(data[0].votes, data[1].votes));
    }

    function calcWinner(winnerVotes, loserVotes) {
        return Math.round(winnerVotes * 1000 / loserVotes);
    }

    function calcLoser(winnerVotes, loserVotes) {
        return Math.round(loserVotes * 500 / winnerVotes);
    }

    function addResult(holder, result) {
        const el = document.createElement('div');
        el.className = 'GS__team_result';
        el.innerText = result;

        holder.appendChild(el);
    }

    function addDiff(holder, home, opponent) {
        const diff = home - opponent;

        if (diff === 0) {
            return;
        }

        const el = document.createElement('div');
        el.className = diff < 0 ? 'diff-red' : 'diff-green';
        el.innerText = diff.toString();

        holder.lastChild.replaceWith(el);
    }

    mutationObserver && new MutationObserver(function (mut, observer) {
        for (const mutation of mut) {
            if (Array.from(mutation.target.classList).includes('match-active-header')) {
                observer.disconnect();
                process(mutation.target);
                observer.observe(observeTarget, observerOptions);

                return;
            }
        }
    }).observe(observeTarget, observerOptions);
})();
