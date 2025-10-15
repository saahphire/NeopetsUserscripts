// ==UserScript==
// @name         Neopets: Lottery Numbers Generator (Real) (Works) (I promise)
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Generates not-so-random numbers for you to play in the lottery, making sure you repeat as little numbers as possible to increase your chances of winning. And it actually works! Unlike 90% of the lottery userscripts!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/lottery.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/lottery.js
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

// Add your lucky numbers here! If you'd like to get rid of the lucky button instead, change "true" to "false"
const enableLuckyButton = true;
const luckyNumbers = [2, 7, 11, 20, 25, 27];

const inputNames = ["one", "two", "three", "four", "five", "six"];

const shuffleArray = (array) => {
    // In my humble opinion if Durstenfeld had credited Fisher-Yates, it should be called a Durstenfeld shuffle, but karma got him
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const isValidArray = (array) => {
    for(let i = 5; i < array.length; i++) if(array.slice(Math.max(0, i - 6), i).includes(array[i])) return false;
    const subArrays = [];
    for(let i = 0; i < array.length; i += 6) subArrays.push(array.slice(i, i + 6));
    for(let i = 0; i < subArrays.length; i++) if(subArrays.slice(0, i).includes(subArrays[i])) return false;
    return true;
}

const getShuffledArray = (array, numberOfTries = 0) => {
    if(isValidArray(array)) return array;
    if(numberOfTries > 250) throw new Error(`Maximum shuffling tries reached. Tried to shuffle the following array: [${array.join(", ")}]`);
    return getShuffledArray(shuffleArray(array), numberOfTries + 1);
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

const pickRandomIndex = (array, condition, attempts = 0) => {
    if(attempts === 250) throw new Error(`Couldn't find any indices satifying the condition! Array: [${array.join(", ")}]`);
    const picked = Math.floor(Math.random() * array.length);
    return (array[picked] >= condition) ? picked : pickRandomIndex(array, condition, attempts + 1);
}

const getRandomTicketNumbers = (currentNumbers) => {
    if(currentNumbers.length === 6) return currentNumbers;
    const newNumber = Math.ceil(Math.random() * 30);
    return getRandomTicketNumbers(currentNumbers.includes(newNumber) ? currentNumbers : currentNumbers.concat([newNumber]));
}

const fillLotteryNumbers = () => {
    const frequencies = (new Array(30)).fill(4);
    const previousTicketNumbers = [...document.querySelector(".content p:nth-of-type(3)").childNodes].filter((e, i) => i % 4 === 2).flatMap(txt => {
        const number = txt.textContent.match(/\d+/g);
        frequencies[number - 1]--;
        return number;
    });
    const nextNumberQuantity = 120 - previousTicketNumbers.length;
    if(nextNumberQuantity <= 0) return false;
    const nextTicketNumbers = [];
    frequencies.forEach((frequency, index) => {
        if(frequency > nextNumberQuantity / 6) return;
        nextTicketNumbers.concat((new Array(frequency).fill(index + 1)));
    });
    let ticketNumbers = [];
    try {
        for(let i = nextTicketNumbers.length + previousTicketNumbers.length; i < 120; i++) nextTicketNumbers.push(pickRandomIndex(frequencies, 0));
        console.log(nextTicketNumbers);
        ticketNumbers = getShuffledArray(nextTicketNumbers);
    } catch(e) {
        document.querySelector(".content p:nth-of-type(2)").insertAdjacentHTML("beforeBegin", `<p style="color:darkred">Something went wrong! You can buy non-optimized numbers like usual or refresh the page. If you see this message again after refreshing the page, please <a href="https://www.neopets.com/neomessages.phtml?type=send&recipient=saahphire">neomail saahphire</a> with your current lottery numbers and the following text:</p><p style="color:red;">${e}</p>`);
        ticketNumbers = getRandomTicketNumbers([]);
    } finally {
        inputNames.forEach((name, index) => {
            document.querySelector(`input[name="${name}"]`).value = ticketNumbers[index];
        });
    }
    return true;
}

(function() {
    'use strict';
    const canBuy = fillLotteryNumbers();
    changeHTML(canBuy);
})();
