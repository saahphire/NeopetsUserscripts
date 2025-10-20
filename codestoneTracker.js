// ==UserScript==
// @name         Neopets: Codestone Tracker
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
// @description  Tracks your codestones, removes them with a click on the training page, adds a link to SW for the ones you don't have yet
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/codestoneTracker.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/codestoneTracker.js
// @match        *://*.neopets.com/island/training.phtml?type=status
// @match        *://*.neopets.com/island/fight_training.phtml?type=status
// @match        *://*.neopets.com/safetydeposit.phtml?*category=2&*
// @match        *://*.neopets.com/safetydeposit.phtml?*category=2
// @match        *://*.neopets.com/quickstock.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM.setValue
// @grant        GM.getValue
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    This script does the following:
    0. Every feature SHOULD work for both the Training School and the Ninja Training School, but I can't test
       the Ninja Training School so I'm doing it blindly.
    1. Remembers which codestones you have in your SDB
       - To do that, you must go to your SDB's Codestones page:
         https://www.neopets.com/island/training.phtml?type=status
       - If the script gets out of sync, go back to the Codestones page to update it.
    2. Adds a link to your SDB's Codestones page to the top links (Courses, Status, etc)
    3. Highlights any pet waiting for their course to be paid if you don't own all needed codestones
    4. Adds a link to the Shop Wizard search page to each codestone you don't own
    5. Adds a link to remove one codestone from your Safety Deposit Box if you own it
       - To do this, you'll either have to add your PIN to the pin const, fill your PIN in the PIN box at the top
         of the page, or not have a pin at all. I couldn't get PIN autofillers to work with this script, sorry.
    6. Remembers whenever you add codestones to your SDB by using the quick stock page
       - I didn't do the same with the inventory page because I don't know if anyone uses it
    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
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

/**
* The language Neopets is in. Case sensitive. For Portuguese and Spanish, if your Quick Stock shows the letter í instead of �, add an _ok to your language's name.
* @constant {('english' | 'nederlands' | 'portugues' | 'portugues_ok' | 'deutsch' | 'francais' | 'italiano' | 'espanol' | 'espanol_ok')}
* @default
*/
const locale = 'english';

/**
* Turns debug mode on or off. In debug mode, your codestone storage will be printed on the console on every page refresh.
* @constant {boolean}
* @default
*/
const isDebug = false;

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
             Localization
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* All existing codestones except for Main.
* @constant {string[]}
*/
const codestoneNames = ['Mau', 'Tai-Kai', 'Lu', 'Vo', 'Eo', 'Zei', 'Orn', 'Mar', 'Bri', 'Mag', 'Vux', 'Cui', 'Kew', 'Sho', 'Zed'];

/**
* Strings used in the Quick Sort and SDB pages.
* @constant {boolean}
* @default
*/
const localize = {
    english: {
        prefix: '',
        suffix: ' Codestone',
        main: 'Main Codestone'
    },
    nederlands: {
        prefix: '',
        suffix: ' Codesteen',
        main: 'Main Codesteen'
    },
    portugues: {
        prefix: 'Pedra M�stica de ',
        suffix: '',
        main: 'Pedra M�stica Principal'
    },
    portugues_ok: {
        prefix: 'Pedra Mística de ',
        suffix: '',
        main: 'Pedra Mística Principal'
    },
    deutsch: {
        prefix: '',
        suffix: '-Codestein',
        main: 'Main-Codestein'
    },
    francais: {
        prefix: 'Codestone ',
        suffix: '',
        main: 'Codestone Principale'
    },
    italiano: {
        prefix: 'Sassocodice ',
        suffix: '',
        main: 'Sassocodice Principale'
    },
    espanol: {
        prefix: 'Piedra m�stica de ',
        suffix: '',
        main: 'Piedra m�stica principal'
    },
    espanol_ok: {
        prefix: 'Piedra m�stica de ',
        suffix: '',
        main: 'Piedra m�stica principal'
    }
};

/**
* Retrieves a list with the full names of every codestone in the game, in your language.
* @returns {string[]}
*/
const getExistingCodestones = () => {
    const i18n = localize[locale];
    const res = codestoneNames.map(name => `${i18n.prefix}${name}${i18n.suffix}`);
    res.push(i18n.main);
    return res;
}

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
const addPinField = () => {
    const div = document.createElement("div");
    div.classList.add("saahphire-pin");
    div.style = "display: flex;place-content:center;place-items:center;gap:0.5em;";
    div.innerHTML = `<p>Enter your <a href="/pin_prefs.phtml">PIN</a>:</p>
    <input type="password" name="pin" id="pin_field" size="4" maxlength="4" style="width:10ex;height:15px;">
    <img src="https://images.neopets.com/pin/bank_pin_mgr_35.jpg" border="1" width="35" height="35" align="left">`;
    document.querySelector(".content > div:nth-child(2) center").insertAdjacentElement("afterEnd", div);
}

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
               Storage
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Retrieves stored data about your codestones
* @returns {Object.<string, {id: number, qty: number}>}
*/
const getStoredCodestones = async () => {
    return JSON.parse(await GM.getValue("saahphire-codestone-tracker", "{}"));
}

/**
* Saves data about your codestones
* @param codestones {Object.<string, {id: number, qty: number}>} The data to be saved
*/
const setStoredCodestones = (codestones) => {
    GM.setValue("saahphire-codestone-tracker", JSON.stringify(codestones));
}

/**
* Adjusts the quantity of a given codestone in your saved data by reducing it by one
* @param itemName {string} The codestone's name
* @returns {number} The new quantity
*/
const removeOneFromStorage = async (itemName) => {
    const storage = await getStoredCodestones();
    storage[itemName].qty--;
    setStoredCodestones(storage);
    return storage[itemName].qty;
}

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
                Links
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Retrieves a given codestone from your SDB
* @param itemId {string} The codestone's item ID
* @param itemName {string} The codestone's name
* @param pin {string} Your pin
* @param link {Element} The anchor element that should be edited to reflect the request's result
*/
const removeCodestone = (itemId, itemName, pin, link) => {
    link.textContent = "⌛ " + link.textContent;
    const url = `https://www.neopets.com/process_safetydeposit.phtml?offset=0&remove_one_object=${itemId}&obj_name=&category=2&pin=${pin}`;
    fetch(url, {
        method: 'GET'
    }).then(() => {
        removeOneFromStorage(itemName);
        link.innerText = link.innerText.replace("⌛", "✔️");
        link.style.textDecoration = "line-through";
        link.removeAttribute("href");
    }).catch(error => {
        console.error("Something went wrong! " + error);
        link.innerText = link.innerText.replace("⌛", "✖️");
    });
}

/**
* Adds a link to the appropriate place (or an event listener) to each codestone name
* @param codestoneElement {Element} The bold element containing the codestone's name
* @param isSDB {boolean} Whether this should link to an SDB action (on true) or the Shop Wizard (on false)
* @param itemId {string} The codestone's item ID
*/
const makeLink = (codestoneElement, isSDB, itemId) => {
    const a = document.createElement("a");
    codestoneElement.insertAdjacentElement("beforeBegin", a);
    a.appendChild(codestoneElement);
    const foundPin = getPin();
    if(iWantToRemoveCodestonesFromMySDBWithAClick && isSDB && typeof foundPin === 'string') {
        a.onclick = (e) => {
            e.preventDefault();
            removeCodestone(itemId, codestoneElement.innerText, foundPin, a)
        };
        a.href = "#";
    }
    else {
        a.href = `https://www.neopets.com/${isSDB ? 'safetydeposit.phtml?obj_name' : 'shops/wizard.phtml?string'}=${codestoneElement.innerText.replace(" ", "+")}`;
        a.target = "_blank";
    }
}

/**
* Adds a link to the Codestones page in the SDB to the top link list
*/
const addSDBLink = () => document.getElementsByTagName("center")[0].insertAdjacentHTML("beforeEnd", " | <a href='https://www.neopets.com/safetydeposit.phtml?obj_name=&category=2'>SDB</a>");

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
            Page-Specific
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Adds links to each codestone shown in the Training School status page
*/
const onTrainingPage = async () => {
    const ownedCodestones = await getStoredCodestones();
    const codestones = document.querySelectorAll("table[width='500'] tr:nth-child(2n) td:last-child b:has(~ img)");
    const usage = {};
    codestones.forEach(codestone => {
        const available = ownedCodestones[codestone.innerText]?.qty ?? 0;
        const used = usage[codestone.innerText] ?? 0;
        if (used < available) {
            usage[codestone.innerText] = used + 1;
            makeLink(codestone, true, ownedCodestones[codestone.innerText].id);
        }
        else {
            makeLink(codestone, false);
            codestone.style.color = "red";
            codestone.parentElement.parentElement.style.backgroundColor = "wheat";
        }
    });
}

/**
* Saves codestones to storage
*/
const onSDBPage = () => {
    const ownedCodestones = {};
    document.querySelectorAll("#boxform ~ tr:not(:last-child)").forEach(row => {
        const name = row.children[1].children[0].childNodes[0].data;
        const quantity = row.children[4].innerText;
        const id = row.querySelector("td:nth-child(6) a").href.match(/\(0,(\d+),/)[1];
        ownedCodestones[name] = {id: id, qty: quantity};
    });
    setStoredCodestones(ownedCodestones);
}

/**
* Adds an event listener so whenever you store codestones in the Quick Stock, their quantities get updated
*/
const onQuickStock = async () => {
    const storage = await getStoredCodestones();
    const allExistingCodestones = getExistingCodestones();
    document.querySelector("input[type='submit']").addEventListener("click", () => {
        const rows = document.querySelectorAll("input[name='buyitem'] ~ table tr:has(input[type='hidden'])");
        const limit = Math.min(70, rows.length);
        for(let i = 0; i < limit; i++) {
            const name = rows[i].children[0].innerText;
            if(allExistingCodestones.includes(name) && rows[i].children[3].children[0].checked) {
                if(!storage[name]) storage[name] = {qty: 0};
                storage[name].qty++;
            }
        }
    });
}

/*
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
            URL Checkers
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆
*/

/**
* Checks whether the current page's url contains a string.
* @param query {string} The string to search for
* @returns {boolean} Whether the string is in the current page's url
*/
const isUrl = (query) => window.location.href.includes(query);

/**
* Checks whether the current page's url contains a parameter and its value is the desired value.
* @param parameter {string} The parameter to check for
* @param value {string} The value the parameter should have
* @param nullIsTrue {boolean} Whether the ausence of the parameter should be counted as a positive or negative result
* @returns {boolean} Whether the parameter has the appropriate value
*/
const isParam = (parameter, value, nullIsTrue = false) => window.location.href.match(new RegExp(`${parameter}=${value}(&|$)`)) ?? (nullIsTrue && !window.location.href.match(parameter + '='));

(async function() {
    'use strict';
    if(isParam('type', 'status')) {
        addPinField();
        addSDBLink();
        onTrainingPage();
    }
    else if(isUrl('safetydeposit') && isParam('offset', 0, true) && isParam('obj_name', '', true) && isParam('category', 2)) onSDBPage();
    else if(isUrl('quickstock')) onQuickStock();
    if(isDebug) {
        console.info("Codestone Tracker storage:");
        console.info(await getStoredCodestones());
    }
})();
