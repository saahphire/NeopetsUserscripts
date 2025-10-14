// ==UserScript==
// @name         Neopets: Lottery Numbers Generator (Works Oct 2025)
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      0.1.0
// @description  Generates not-so-random numbers for you to play in the lottery, making sure you repeat as little numbers as possible to increase your chances of winning. And it actually works! Unlike 90% of the lottery userscripts!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/testing/lottery.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/testing/lottery.js
// @match        *://*.neopets.com/games/lottery.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script works as of October 14th, 2025. It doesn't use GM3 and does the following:
    - Generates numbers for you to play in the lottery
    - Ensures these numbers are only repeated the minimum possible amount of times between different tickets
    - Buys and generates at the same time
    - Adds a button for you to buy your lucky numbers instead of random ones. The button disappears after you buy them.
    - Adds both buttons to a fixed location so you don't have to move your mouse between tickets
    - Makes both buttons unclickable while the server is processing your request so it doesn't give you an error page
    - Works.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Add your lucky numbers here!
// If you'd like to get rid of the lucky button instead, change "true" to "false"
const enableLuckyButton = true;
const luckyNumbers = [2, 7, 11, 20, 25, 27];

const inputNames = ["one", "two", "three", "four", "five", "six"];

const getNewNumber = (numberFrequency, currentNumbers) => {
    const randomNumber = Math.ceil(Math.random() * 30);
    if(numberFrequency[randomNumber] > 3 || currentNumbers.includes(randomNumber)) return getNewNumber(numberFrequency, currentNumbers);
    return randomNumber;
}

const addLuckyButton = (form) => {
    if(!enableLuckyButton) return;
    const luckyButton = document.createElement("input");
    luckyButton.type = "button";
    luckyButton.value = "Buy Your Lucky Ticket!";
    luckyButton.style = "padding: 1em;"
    document.querySelector('input[form="the-ONE-time-adding-an-id-would-have-been-useful-and-you-didnt"]').insertAdjacentElement("afterEnd", luckyButton);
    luckyButton.addEventListener("click", () => {
        luckyNumbers.forEach((n, i) => document.querySelector(`input[name="${inputNames[i]}"]`).value = n);
        form.submit();
    });
    return luckyButton;
}

const moveButton = (form) => {
    const button = form.querySelector('input[type="submit"]');
    document.querySelector(".content p:nth-of-type(2)").insertAdjacentElement("beforeBegin", button);
    form.id = "the-ONE-time-adding-an-id-would-have-been-useful-and-you-didnt";
    button.setAttribute("form", "the-ONE-time-adding-an-id-would-have-been-useful-and-you-didnt");
    button.style = "padding: 1em;";
    return button;
}

const changeHTML = (canBuy) => {
    const form = document.querySelector('form[action="process_lottery.phtml"]');
    const buyButton = moveButton(form);
    if(canBuy) {
        const luckyButton = addLuckyButton(form);
        form.addEventListener("submit", () => {
            buyButton.disabled = true;
            luckyButton.disabled = true;
        })
    }
    else {
        buyButton.disabled = true;
        buyButton.value = "All 20 tickets have been bought!"
        document.querySelectorAll('input[size="2"]').forEach(input => input.disabled = true);
    }
}

const fillLotteryNumbers = () => {
    const previousTicketNumbers = [...document.querySelector(".content p:nth-of-type(3)").childNodes].filter((e, i) => i % 4 === 2).flatMap(txt => txt.textContent.match(/\d+/g));
    if(previousTicketNumbers.length > 119) return false;
    const frequency = {};
    previousTicketNumbers.forEach(number => {
        frequency[number] = (frequency[number] ?? 0) + 1
    });
    const currentTicketNumbers = [];
    for(let i = 0; i < 6; i++) {
        const newNumber = getNewNumber(frequency, currentTicketNumbers);
        frequency[newNumber] = (frequency[newNumber] ?? 0) + 1;
        currentTicketNumbers.push(newNumber);
        document.querySelector(`input[name="${inputNames[i]}"]`).value = newNumber;
    }
    return true;
}

(function() {
    'use strict';
    const canBuy = fillLotteryNumbers();
    changeHTML(canBuy);
})();
