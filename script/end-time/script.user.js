// ==UserScript==
// @name         GuruShots end time
// @description  Show ending time in GuruShots next to countdown timer
// @namespace    http://karmalakas.lt/
// @version      1.15.0
// @author       Karmalakas
// @updateURL    https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/end-time/script.user.js
// @downloadURL  https://github.com/Karmalakas/gurushots-user-scripts/raw/refs/heads/main/script/end-time/script.user.js
// @supportURL   https://github.com/Karmalakas/gurushots-user-scripts/issues
// @match        https://gurushots.com/*
// @require      http://code.jquery.com/jquery-3.5.1.slim.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function ($) {
    'use strict';

    GM_addStyle('' +
        '.gs-challenge__countdown {padding-bottom: 1px;}' +
        '.c-challenges-item__title .TM-timer-end-date {' +
        '    bottom: 22px;' +
        '    font-size: .95em;' +
        '}' +
        '.challenges-exhibition-banner__title .TM-timer-end-date {' +
        '    bottom: 24px;' +
        '    position: absolute;' +
        '    text-align: center;' +
        '    width: 100%;' +
        '    color: #FFFFFF;' +
        '}' +
        '.c-challenges-speed-item__countdown .TM-timer-end-date,' +
        '.challengesItemSuggested__timer__wrap .TM-timer-end-date {' +
        '    top:33%;' +
        '    color:#b4ada4;' +
        '}' +
        '.match-active__top__info__c-timer .TM-timer-end-date {' +
        '    text-align: right;' +
        '    color: white;' +
        '    font-weight: bold;' +
        '    font-size: 14px;' +
        '}' +
        '.gs-challenge__data .gs-challenge__match-timer,' +
        '.gs-challenge__data .gs-challenge__match-timer .gs-challenge__countdown,' +
        '#page leaderboard-page leaderboard-header league-timer {' +
        '    width: auto;' +
        '    padding: 0 5px;' +
        '}' +
        '.gs-challenge__data .gs-challenge__match-timer .gs-challenge__countdown.TM-timer-team {' +
        '    border-right: 1px solid white;' +
        '    color: white;' +
        '}' +
        '.TM-timer-list,' +
        '.TM-timer-team {' +
        '    font-size: 12px;' +
        '    font-weight: normal;' +
        '}' +
        'p > .TM-timer-team {' +
        '    font-weight: bold;' +
        '}' +
        '.leader-board__modal__timer > .TM-timer-team {' +
        '    font-weight: bold;' +
        '    font-size: 12px;' +
        '    margin-bottom: 0;' +
        '}' +
        '.team-leaderboard__main-header__content-timer div.TM-timer-league,' +
        '#page leaderboard-page leaderboard-header league-timer div.TM-timer-league {' +
        '    border-right: 1px solid #3397d2;' +
        '    padding-right: 4px;' +
        '    margin-right: 3px;' +
        '}' +
        '.team-leaderboard__main-header__content-timer div.TM-timer-league {' +
        '    font-size: 12px;' +
        '    color: #3397d2;' +
        '    margin-bottom: inherit;' +
        '}' +
        '#page leaderboard-page leaderboard-header league-timer div.TM-timer-league {' +
        '    font-weight: 400;' +
        '}' +
        'challenges-item div.TM-timer-boost-holder {' +
        '     height: auto;' +
        '     width: auto;' +
        '     left: -17px;' +
        '     top: -5px;' +
        '     right: auto !important;' +
        '     padding: 2px !important;' +
        '     padding-left: 9px !important;' +
        '     border-top-right-radius: 10px;' +
        '     border-bottom-right-radius: 10px;' +
        '}' +
        'challenges-item div.TM-timer-boost {' +
        '    font-size: .9em;' +
        '}' +
        'challenges-upcoming gs-challenge footer .soon .starts,' +
        'challenge-details .c-tab-view__stat__item--soon p > div {' +
        '    display: grid;' +
        '    row-gap: 5px;' +
        '    column-gap: 5px;' +
        '    grid-template-rows: auto;' +
        '    grid-template-columns: auto auto;' +
        '    justify-content: space-between;' +
        '    padding: 0 10px;' +
        '}' +
        'challenges-upcoming gs-challenge footer .soon .starts div:nth-child(odd),' +
        'challenge-details .c-tab-view__stat__item--soon p > div div:nth-child(odd) {' +
        '    text-align: left;' +
        '}' +
        'challenges-upcoming gs-challenge footer .soon .starts div:nth-child(even),' +
        'challenge-details .c-tab-view__stat__item--soon p > div div:nth-child(even) {' +
        '    text-align: right;' +
        '}' +
        'challenge-details .c-tab-view__stat__item--soon p > div {' +
        '    font-size: .75em;' +
        '}'
    );

    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var timerSelectors = ['gs-timer'];
    var timeoutWarnings = {};

    function process() {
        var timers = document.querySelectorAll('gs-timer');
        if (!timers.length) {
            return;
        }

        for (var i = 0; i < timers.length; i++) {
            processTimer(
                timers[i],
                getTimerType(timers[i])
            );
        }
    }

    function getTimerType(timer) {
        var timerParent = $(timer).parent();

        if (timerParent.hasClass('c-challenges-item__title')) {
            return 'daysLeft';
        } else if (timerParent.hasClass('c-challenges-speed-item__countdown') || timerParent.hasClass('challengesItemSuggested__timer__wrap')) {
            return 'circleBar';
        } else if (timerParent.hasClass('gs-challenge')) {
            return 'list';
        } else if (timerParent.hasClass('match-active__top__info__c-timer')) {
            return 'match';
        } else if (timerParent.hasClass('team-leaderboard__main-header__content-timer') || timerParent.hasClass('league-timer')) {
            return 'league';
        } else if (timerParent.hasClass('gs-challenge__match-timer')) {
            return 'teamMatch';
        } else if (timerParent.hasClass('challenges-exhibition-banner__title')) {
            return 'banner';
        } else if (timerParent.hasClass('') === true) {
            return 'other';
        }
    }

    function processTimer(timer, type) {
        if ($(timer).prev().hasClass('TM-timer-end-date')) {
            return;
        }

        switch (type) {
            case 'daysLeft':
                break;

            case 'circleBar':
                processTimerCircleBar(timer);
                break;

            case 'list':
                processTimerList(timer);
                break;

            case 'match':
                processTimerMatch(timer);
                break;

            case 'league':
                processTimerLeague(timer);
                break;

            case 'teamMatch':
                processTimerTeamMatch(timer);
                break;

            default:
                processTimerOther(timer);
                break;
        }
    }

    function processTimerCircleBar(timer) {
        timer = $(timer);
        var duration = moment.duration(
            timer.find('.timer__digit, .timer__delimiter').text()
        );

        addDate(timer, duration, 'c-challenges-speed-item__countdown__timer');
    }

    function processTimerList(timer) {
        timer = $(timer);
        addDate(timer, getBasicDuration(timer), 'TM-timer-list');
    }

    function processTimerMatch(timer) {
        timer = $(timer);
        addDate(timer, getBasicDuration(timer), 'TM-timer-match');
    }

    function processTimerLeague(timer) {
        addDate($(timer), getStringDuration(timer), 'TM-timer-league');
    }

    function processTimerOther(timer) {
        timer = $(timer);
        addDate(timer, getBasicDuration(timer), 'TM-timer-match');
    }

    function processTimerTeamMatch(timer) {
        var duration = getStringDuration(timer);
        timer = $(timer);
        addDate(timer, duration, timer.attr('class') + ' TM-timer-team');
    }

    function getBasicDuration(timer) {
        var text = timer.text().replace(/(h|m|s)/g, '');
        text = text.trim().replace(/\s+/g, ':');

        return moment.duration(text);
    }

    function getStringDuration(timer) {
        var text = timer.textContent || timer.innerText || '',
            timeMatches = [...text.trim().matchAll(/(?:(\d+)d\s?)?(?:(\d+)h\s?)?(?:(\d+)m\s?)?(?:(\d+)s\s?)?/gi)];

        return moment.duration({
            seconds: parseInt(30),
            minutes: parseInt(timeMatches[0][3] || 0, 10),
            hours: parseInt(timeMatches[0][2] || 0, 10),
            days: parseInt(timeMatches[0][1] || 0, 10)
        });
    }

    function addDate(timer, duration, cssClass, format) {
        format = format || 'ddd HH:mm';
        var date = moment().add(duration);

        // Lets round to 1 minute (there are challenges ending like xx:14)
        var coeff = 60 * 1;
        date = moment.unix(Math.round(date.unix() / coeff) * coeff)

        timer.before(
            $('<div class="' + (cssClass || '') + ' TM-timer-end-date">' + date.format(format) + '</div>')
        );
    }

    function processMemberChallenges(response, retry_count) {
        if (response.success !== true || !Array.isArray(response.items)) {
            return;
        }

        var domChallenges = awaitDomToLoad('app-challenges-upcoming-wrapper gs-challenge');

        if (domChallenges === false) {
            return;
        }

        var i, challenge, challengeData, startsHolder;

        for (i = 0; i < domChallenges.length; i++) {
            challenge = domChallenges[i];
            challengeData = response.items.find(o => `"${o.title}"` === challenge.querySelector('a').textContent);

            challenge.querySelector('footer .soon .starts').innerHTML = '<div><strong>Start:</strong> ' + moment.unix(challengeData.start_time).format('Do MMM, ddd HH:mm') + '</div><div><strong>End:</strong> ' + moment.unix(challengeData.close_time).format('Do MMM, ddd HH:mm') + '</div>';
        }
    }

    function processChallenge(response) {
        if (response.success !== true || typeof (response.challenge) !== 'object') {
            return;
        }

        var upcomingSingleChallengeSoon = awaitDomToLoad('challenge-details .c-tab-view__stat__item--soon', true);

        if (!upcomingSingleChallengeSoon) {
            return;
        }

        var challengeData = response.challenge;
        var closeTime = moment.unix(challengeData.close_time);

        upcomingSingleChallengeSoon.querySelector('p').innerHTML = '<div>End:</div><div>' + moment.unix(challengeData.close_time).format('Do MMM, ddd HH:mm') + '</div>';
    }

    function processActiveChallenges(response) {
        if (response.success !== true || !Array.isArray(response.challenges)) {
            return;
        }

        var domChallenges = awaitDomToLoad('.my-challenges__items .my-challenges__item');

        if (domChallenges === false) {
            return;
        }

        for (var challenge of response.challenges) {
            const domChallenge = [...domChallenges].filter(element => element.classList.contains(`c-id-${challenge.id}`))[0];
            const boostTimeout = challenge.member?.boost?.timeout;

            delete challenge.time_left.days;

            const duration = moment.duration(challenge.time_left);
            const timer = $(domChallenge.querySelector('gs-timer, .c-challenges-item__title__days'));

            addDate(timer, duration, 'c-challenges-item__title__days_left');
            processTimeoutWarning(timer, duration);

            if (boostTimeout > Math.ceil(new Date().getTime() / 1000)) {
                domChallenge.querySelector('.action-button__status__icon-message__text').innerHTML = moment.unix(challenge.member.boost.timeout).format('HH:mm')
            }
        }
    }

    function processTimeoutWarning(timer, duration) {
        var colorBorder = function (id) {
            var el = $('.c-id-' + id + ' > challenges-item');
            el.css('box-shadow', '0 0 0 7px rgba(225,151,151,0.75)');
        };

        var challengeHolder = timer.closest('.my-challenges__item');

        if (!challengeHolder.length) {
            return;
        }

        var challengeId = getChallengeIdFromClass(challengeHolder);

        if (typeof challengeId === 'undefined' || typeof timeoutWarnings[challengeId] !== 'undefined') {
            return;
        }

        var minutes = 10;

        if (moment.duration(duration).asMinutes() <= minutes) {
            colorBorder(challengeId);
        } else {
            timeoutWarnings[challengeId] = setTimeout(function () {
                colorBorder(challengeId);
            }, duration - (minutes * 60 * 1000));
        }
    }

    function awaitDomToLoad(selector, single, retry_count) {
        single = single || false;
        retry_count = retry_count || 0;

        var domResult = single ? document.querySelector(selector) : document.querySelectorAll(selector);

        if (
            (!single && !domResult.length)
            || (single && typeof (domResult) !== 'object')
        ) {
            if (retry_count < 5) {
                setTimeout(awaitDomToLoad(selector, single, ++retry_count), 1500);
            }

            return false;
        }

        return domResult;
    }

    function getChallengeIdFromClass(challengeHolder) {
        var challengeId;

        for (var index = 0; index < challengeHolder.get(0).classList.length; ++index) {
            var value = challengeHolder.get(0).classList[index];

            if (value.indexOf('c-id-') === 0) {
                challengeId = value.match(/\d+$/g)[0];

                break;
            }
        }

        return challengeId;
    }

    function processAJAXPointer(pointer) {
        switch (pointer.responseURL) {
            case 'https://api.gurushots.com/rest/get_member_challenges':
                processMemberChallenges(JSON.parse(pointer.responseText));
                break;

            case 'https://api.gurushots.com/rest/get_challenge':
                processChallenge(JSON.parse(pointer.responseText));
                break;

            case 'https://api.gurushots.com/rest/get_my_active_challenges':
                processActiveChallenges(JSON.parse(pointer.responseText));
                break;
        }
    }

    var proxiedAJAXSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function () {
        //Here is where you can add any code to process the request.
        //If you want to pass the Ajax request object, pass the 'pointer' below
        var pointer = this
        var intervalId = window.setInterval(function () {
            if (pointer.readyState != 4) {
                return;
            }

            processAJAXPointer(pointer);

            //Here is where you can add any code to process the response.
            //If you want to pass the Ajax request object, pass the 'pointer' below
            clearInterval(intervalId);
        }, 0);//I found a delay of 1 to be sufficient, modify it as you need.

        return proxiedAJAXSend.apply(this, [].slice.call(arguments));
    };

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
})(jQuery);
