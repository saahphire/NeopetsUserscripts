// ==UserScript==
// @name         Neopets: Codestone Tracker
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      3.0.0
// @description  Tracks your codestones, removes them with a click on the training page, adds a link to SW for the ones you don't have yet
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/codestoneTracker.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/codestoneTracker.js
// @match        *://*.neopets.com/island/training.phtml?type=status
// @match        *://*.neopets.com/island/fight_training.phtml?type=status
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @require      https://update.greasyfork.org/scripts/567035/1759043/Neopets%3A%20Shop%20Wizard%20Anchor%20Creator.js
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.
........................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    Apparently this doesn't work for the Ninja Training School. I can't access it so you're out of luck.
    This script does the following:
    1. Accesses your SDB to count how many codestones of each type you have
    2. Forwards any random events to the page you're in (in theory. It's hard to test)
    3. Highlights any pet waiting for their course to be paid if you don't own all needed codestones
    4. Adds a link to the Shop Wizard (or SSW, if you have Premium) to each codestone you don't own
    5. Adds a link to remove one codestone from your Safety Deposit Box if you own it
       - To do this, you'll either have to add your PIN to the pin const, fill your PIN in the PIN box
         at the top of the page, or not have a pin at all. I couldn't get PIN autofillers to work with
         this script, sorry.
    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
........................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.
*/

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
            Configuration
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Whether codestones on your SDB should have a link to retrieve it with a click (if true) or to your SDB's search function (if false)
* @constant {boolean}
* @default
*/
const iWantToRemoveCodestonesFromMySDBWithAClick = true;

/**
* Your PIN, or, if you don't have a PIN set on your SDB, an empty string ''
* @constant {string}
*/
const pin = '0000';

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
                 PIN
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Tries to retrieve your PIN from either the input field or your pin const
* @returns {string|undefined}
*/
const getPin = () => {
    const pinField = document.getElementById("pin_field")?.value;
    if(pinField && pinField !== '') return pinField;
    if(pin === '' || pin.match(/^\d{4}$/)) return pin;
}

/**
* Adds an input field for your PIN in the Training School's page
*/
const addPinField = () => document.querySelector(".content > div:nth-child(2) center")?.insertAdjacentHTML('afterEnd', `<div class="saahphire-pin" style="display:flex;place-content:center;place-items:center;gap:0.5em">
<p>Enter your <a href="/pin_prefs.phtml">PIN</a>:</p>
<input type="password" name="pin" id="pin_field" size="4" maxlength="4" style="width:10ex;height:15px;">
<img src="https://images.neopets.com/pin/bank_pin_mgr_35.jpg" border="1" width="35" height="35" align="left">
</div>`);

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
             Utility
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Takes an image's URL and retrieves the codestone's ID from within
* @returns {number}
*/
const getIndexFromImageUrl = (imageUrl) => parseInt(imageUrl.match(/codestone(\d+)/)[1]);

/**
* Takes a codestone's index (from 1 to 16) and returns its item id.
* @returns {number}
*/
const getIdFromIndex = (index) => index < 22208 ? index + 7457 : index + 22197;

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
                Links
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Edits a given anchor to communicate a successful action
* @param anchor {Element} The anchor element that should be edited to reflect success
*/
const communicateSuccess = (anchor) => {
    anchor.textContent = anchor.textContent.replace("⌛", "✔️");
    anchor.style.textDecoration = "line-through";
    anchor.removeAttribute("href");
}

/**
* Edits a given anchor to communicate a failed action and logs its error in the console
* @param anchor {Element} The anchor element that should be edited to reflect failure
* @param error {string} The error that should be logged
*/
const communicateFailure = (anchor, error) => {
    console.error("Something went wrong! " + error);
    anchor.textContent = anchor.textContent.replace("⌛", "✖️");
}

/**
* Retrieves a given codestone from your SDB
* @param itemIndex {number} The codestone's index within image numbers and our storage
* @param itemName {string} The codestone's name
* @param pin {string} Your pin
* @param anchor {Element} The anchor element that should be edited to reflect the request's result
*/
const removeCodestone = async (itemIndex, pin, anchor) => {
    anchor.textContent = "⌛ " + anchor.textContent;
    const itemId = getIdFromIndex(itemIndex);
    const url = `https://www.neopets.com/process_safetydeposit.phtml?offset=0&remove_one_object=${itemId}&obj_name=&category=2&pin=${pin}`;
    try {
        await fetch(url);
        communicateSuccess(anchor);
    } catch (e) {
        communicateFailure(anchor, e)
    }
}

/**
* Adds a link to the appropriate place (or an event listener) to each codestone name
* @param codestoneElement {Element} The bold element containing the codestone's name
* @param isSDB {boolean} Whether this should link to an SDB action (on true) or the Shop Wizard (on false)
* @param itemIndex {number} The codestone's index within image numbers and our storage
*/
const makeLink = (codestoneElement, isSDB, itemIndex) => {
    if(isSDB) {
        const foundPin = getPin();
        if(!iWantToRemoveCodestonesFromMySDBWithAClick || typeof foundPin !== 'string') return;
        const a = document.createElement("a");
        codestoneElement.insertAdjacentElement("beforeBegin", a);
        a.appendChild(codestoneElement);
        a.onclick = (e) => {
            e.preventDefault();
            removeCodestone(itemIndex, foundPin, a)
        };
        a.href = "#";
    }
    else codestoneElement.previousElementSibling.insertAdjacentElement('afterend', createSWLink(codestoneElement.textContent, codestoneElement));
}

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
            Page-Specific
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Fetches the codestone SDB page and retrieves each codestone's quantity
* @returns {Object.<number, number>} A dictionary with the item's id as key and quantity as value
*/
const getStoredCodestones = async () => {
    const fetched = await fetch('https://www.neopets.com/safetydeposit.phtml?obj_name=&category=2');
    const text = await fetched.text();
    const randomEvent = text.match(/<link [^>]+randomevents.+>[\s\S]+<div class="copy">\s*.+\s*<\/div>/);
    if(randomEvent) document.querySelector('td[class="content"], .container').insertAdjacentHTML('afterbegin', randomEvent);
    const matches = text.matchAll(/center"><b>(\d+)<\/b>[\s\S]+?back_to_inv\[(\d+)\]/g);
    const result = {};
    matches.forEach(match => result[match[2]] = parseInt(match[1]));
    return result;
}

/**
* Adds links to each codestone shown in the Training School status page
*/
const onTrainingPage = async () => {
    const codestones = document.querySelectorAll("table[width='500'] tr:nth-child(2n) td:last-child b + img");
    if(!codestones.length) return;
    const ownedCodestones = await getStoredCodestones();
    const usage = new Array(17);
    codestones.forEach(codestone => {
        const textElement = codestone.previousElementSibling;
        const itemIndex = getIndexFromImageUrl(codestone.src);
        const itemId = getIdFromIndex(itemIndex);
        const available = ownedCodestones[itemId] ?? 0;
        const used = usage[itemIndex] ?? 0;
        if (used < available) {
            usage[itemIndex] = used + 1;
            makeLink(textElement, true, itemIndex);
        }
        else {
            makeLink(textElement, false);
            textElement.style.color = "red";
            codestone.parentElement.parentElement.style.backgroundColor = "wheat";
        }
    });
}

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
            URL Checkers
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Checks whether the current page's url contains a parameter and its value is the desired value.
* @param parameter {string} The parameter to check for
* @param value {string} The value the parameter should have
* @param nullIsTrue {boolean} Whether the ausence of the parameter should be counted as a positive or negative result
* @returns {boolean} Whether the parameter has the appropriate value
*/
const isParam = (parameter, value, nullIsTrue = true) => window.location.href.match(new RegExp(`${parameter}=${value}(&|$)`)) ?? (nullIsTrue && !window.location.href.match(parameter + '='));

(async function() {
    'use strict';
    if(isParam('type', 'status', false)) {
        addPinField();
        onTrainingPage();
    }
})();
