// ==UserScript==
// @name         Neopets: Outbox (Sent NeoMail)
// @namespace    https://github.com/saahphire/NeopetsUserscripts
<<<<<<< HEAD
<<<<<<< HEAD
// @version      1.0.0
=======
// @version      1.1.0
>>>>>>> parent of 0fda26a... Fix query for input instead of textarea
// @description  Generates not-so-random numbers for you to play in the lottery, making sure you repeat as little numbers as possible to increase your chances of winning. And it actually works! Unlike 90% of the lottery userscripts!
=======
// @version      1.0.5
// @description  Saves the last 100 sent neomails in an Outbox
>>>>>>> main
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @match        *://*.neopets.com/neomessages.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @downloadURL  none
// ==/UserScript==

<<<<<<< HEAD
/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
<<<<<<< HEAD
    This script works as of October 19th, 2025. It doesn't use GM3 and does the following:
=======
    This script does the following:
>>>>>>> parent of 0fda26a... Fix query for input instead of textarea
    - Generates numbers for you to play in the lottery
    - Ensures these numbers are only repeated the minimum possible amount of times between different tickets
    - Buys and generates at the same time
    - Adds a button for you to buy your lucky numbers instead of random ones. The button disappears after you buy them.
    - Adds both buttons to a fixed location so you don't have to move your mouse between tickets
    - Makes both buttons unclickable while the server is processing your request so it doesn't give you an error page

<<<<<<< HEAD
    I tried making my own script but gave up in the middle. Math hurts my head.
    The idea of interleaving numbers is from https://www.andrew.cmu.edu/user/kmliu/neopets/lottery2.html
=======
    inb4 "Why another lottery script?", mine actually gets you tickets as diverse as possible, which increases your
    chances of winning as per https://www.neopets.com/ntimes/index.phtml?section=456732&week=398
    There are other scripts that claim to do the same but really don't. In testing, mine had a maximum of 4 numbers in
    common with another ticket, only once, and it was in my lucky number. Usually it gets 2-3, which is unavoidable.
>>>>>>> parent of 0fda26a... Fix query for input instead of textarea

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Add your lucky numbers here! If you'd like to get rid of the lucky button instead, change "true" to "false"
const enableLuckyButton = true;
<<<<<<< HEAD
const luckyNumbers = [1, 2, 3, 4, 5, 6];
=======
const luckyNumbers = [2, 7, 11, 20, 25, 27];
>>>>>>> parent of 0fda26a... Fix query for input instead of textarea
const verbose = true;

const inputNames = ["one", "two", "three", "four", "five", "six"];

<<<<<<< HEAD
const interleave = (array) => {
    const res = [];
    const a = array.slice(0, Math.floor(array.length / 2));
    const b = array.slice(Math.ceil(array.length / 2));
    for(var i = 0; i < a.length; i++) {
        res[i * 2] = a[i]; 
        res[i * 2 + 1] = b[i]; 
=======
const savedMessageLimit = 100;

const properties = ["timestamp", "nickname", "username", "subject", "body", "reply"];

class Outbox {
    constructor(rawMessages) {
        const parsedMessages = JSON.parse(rawMessages);
        this.messages = parsedMessages.map(msg => new Message(msg.t, msg.n, msg.u, msg.s, msg.b, msg.r));
>>>>>>> main
    }

    async save() {
        this.messages = this.messages.slice(savedMessageLimit * -1);
        GM.setValue("neopets-outbox", JSON.stringify(this.messages.map(msg => msg.minify())));
    }

    async add() {
        const timestamp = new Date().getTime();
        const nickname = document.querySelector('input[name="recipient"] ~ span')?.textContent;
        const username = document.querySelector('input[name="recipient"]').value;
        const subject = document.querySelector('input[name="subject"]').value;
        const bodyTextArea = document.getElementById("message_body") ?? document.querySelector('textarea[name="message_body"]');
        const body = bodyTextArea.value ?? bodyTextArea.contentDocument.body.innerText.replaceAll(/\n\n/g, "\n");
        const replyElement = document.querySelector('td[bgcolor="#DEDEDE"]')?.cloneNode(true);
        if (replyElement) {
            replyElement.querySelector("input").remove();
            const reply = replyElement.innerHTML;
            this.messages.push(new Message(timestamp, nickname, username, subject, body, reply));
        }
        else this.messages.push(new Message(timestamp, nickname, username, subject, body));
        this.save();
    }
}

class Message {
    constructor(timestamp, nickname, username, subject, body, reply) {
        this.timestamp = timestamp;
        this.nickname = nickname;
        this.username = username;
        this.subject = subject;
        this.body = body;
        this.reply = reply;
    }

    minify() {
        return Object.fromEntries(properties.map(p => [p[0], this[p]]));
    }

    toTitle() {
        const tr = document.createElement("tr");
        tr.dataset.timestamp = this.timestamp;
        tr.innerHTML = `
        <td class="outbox--timestamp">${(new Date(this.timestamp)).toLocaleString(navigator.language, {dateStyle: "short", timeStyle: "short"})}</td>
        <td class="outbox--recipient">${this.nickname ? this.nickname + '<br>[' : ''}<a href="https://www.neopets.com/userlookup.phtml?user=${this.username}">${this.username}</a>${this.nickname ? ']' : ''}</td>
        <td class="outbox--subject">${this.subject}</td>
        `;
        tr.onclick = () => this.toggle(tr);
        return tr;
    }

    toHTML() {
        const table = document.createElement("table");
        table.classList.add("outbox--full", "inactive");
        setTimeout(() => table.classList.remove("inactive"), 10);
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        tbody.innerHTML = `
        <tr><td>To:</td><td>[<a href="https://www.neopets.com/userlookup.phtml?user=${this.username}">${this.username}</a>] ${this.nickname ?? ''}</td></tr>
        <tr><td>Sent:</td><td>${(new Date(this.timestamp)).toLocaleString(navigator.language, {dateStyle: "short", timeStyle: "short"})}</td></tr>
        <tr><td>Subject:</td><td>${this.subject}</td>
        ${this.reply ? '<tr><td>' + this.username + ' wrote:</td><td>' + this.reply + '</td></tr>' : ''}
        <tr><td>Message:</td><td>${this.body.replaceAll("\n", "<br>")}</td></tr>
        `;
        return table;
    }

    toggle(tr) {
        tr.classList.toggle("active");
        if(tr.classList.contains("active")) this.expand(tr);
        else this.collapse(tr);
    }

    expand(tr) {
        const row = document.createElement("tr");
        tr.insertAdjacentElement("afterEnd", row);
        const cell = document.createElement("td");
        row.appendChild(cell);
        cell.colSpan = 3;
        cell.appendChild(this.toHTML());
    }

    collapse(tr) {
        const row = tr.nextElementSibling;
        row.getElementsByClassName("outbox--full")[0].classList.add("inactive");
        setTimeout(() => row.remove(), 250);
    }
}

class UI {
    constructor(outbox) {
        this.anchor = document.createElement("a");
        this.anchor.href = "#";
        this.anchor.onclick = () => this.open(outbox);
        this.anchor.textContent = "Outbox";
    }

    appendAnchor() {
        const lastLink = document.querySelector("div.medText a:first-child");
        lastLink.insertAdjacentElement("afterEnd", this.anchor);
        lastLink.insertAdjacentText("afterEnd", " | ");
    }

    makeMessageList(outbox) {
        const table = document.createElement("table");
        table.classList.add("outbox--list");
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        outbox.messages.forEach(msg => tbody.prepend(msg.toTitle()));
        tbody.insertAdjacentHTML("afterBegin", '<tr class="outbox--list-header"><th class="neomail-outbox-date">Date Sent</th><th class="neomail-outbox-recipient">To</th><th class="neomail-outbox-subject">Subject</th></tr>');
        return table;
    }

    open(outbox) {
        const links = document.querySelector("div.medText");
        document.getElementsByClassName("content")[0].style.display = "none";
        const parent = document.createElement("td");
        document.getElementsByClassName("content")[0].insertAdjacentElement("beforeBegin", parent);
        parent.classList.add("content");
        parent.appendChild(links);
        const messageList = this.makeMessageList(outbox);
        parent.appendChild(messageList);
    }
}

const css = `<style>
.outbox--list {
  width: 100%;
  border: 1px solid #000000;
  border-collapse: collapse;
  margin-top: 50px;
}
.outbox--list-header th {
  font-weight: bolder;
  background-color: #687DAA;
  color: #FFFFFF;
  height: 22px;
  font-size: 9pt;
  font-weight: bold;
  text-align: left;
  padding-left: 3px;
}
.outbox--list td, .outbox--list th {
  padding: 3px;
}
.outbox--timestamp {
  line-height: 2.5;
}
.neomail-outbox-date {
  width: 130px;
}
.neomail-outbox-recipient {
  width: 200px;
}
.outbox--list tr {
  border: 1px solid black;
  cursor: pointer;
}
.outbox--list tr:nth-child(2n+1) {
  background: #EDEDED;
}
.outbox--list td {
  font-size: 8pt;
}
.outbox--full {
  width: 100%;
  transform: scaleY(100%);
  transform-origin: top;
  transition: transform 250ms ease-in-out;
}
.outbox--full.inactive {
  transform: scaleY(0);
  transition: transform 250ms ease-in-out;
}
.outbox--full, .outbox--full tr:nth-child(2n+1), .outbox--full tr:nth-child(2n) {
  background: white;
}
.outbox--full td {
  padding: 6px;
  font-size: 9pt;
}
.outbox--full td:first-child {
  width: 100px;
  background-color: #C8E3FF;
  font-size: 8pt;
  font-weight: bolder;
}
</style>`;

(async function() {
    'use strict';
<<<<<<< HEAD
    const canBuy = fillLotteryNumbers();
    changeHTML(canBuy);
=======
const rand = (n) => Math.floor(Math.random() * n);

const scoreTickets = (tickets) => {
  const sets = tickets.map((ticket) => new Set(ticket));
  let total = 0;
  for (let i = 0; i < tickets.length; i++) {
    for (let j = i + 1; j < tickets.length; j++) {
      total += Array.from(sets[i]).filter((number) =>
        sets[j].has(number),
      ).length;
    }
  }
  return { total, sets };
};

const trySwap = (tickets, sets, score, fixedCount) => {
  const ticketIndex = rand(tickets.length - fixedCount) + fixedCount;
  const currentTicket = tickets[ticketIndex];
  const numberIndex = rand(6);
  let delta = 0;

  const candidates = [];
  for (let number = 1; number <= 30; number++)
    if (!sets[ticketIndex].has(number)) candidates.push(number);
  if (candidates.length === 0) return;
  const currentCandidate = candidates[rand(candidates.length)];

  for (let j = 0; j < tickets.length; j++)
    if (j !== ticketIndex)
      delta +=
        sets[j].has(currentCandidate) - sets[j].has(currentTicket[numberIndex]);

  // You can have a worse score. As a treat
  if (delta < 0 || Math.random() < 0.001) {
    currentTicket[numberIndex] = currentCandidate;
    currentTicket.sort((a, b) => a - b);
    sets[ticketIndex].delete(currentTicket[numberIndex]);
    sets[ticketIndex].add(currentCandidate);
    return score + delta;
  }
};

function generateTickets(fixedTickets) {
  let tickets = fixedTickets.map((t) => t.slice());
  for (let i = 0; i < 20 - fixedTickets.length; i++)
    tickets.push(getRandomTicketNumbers(fixedTickets));
  let { total, sets } = scoreTickets(tickets);
  for (let step = 0; step < 8000; step++) {
    const newScore = trySwap(tickets, sets, total, fixedTickets.length);
    if (newScore || newScore === 0) total = newScore;
  }
  tickets = tickets.map((t) => t.slice());
  if (verbose)
    console.log(
      "Final overlap score:",
      total,
      ". All chosen tickets:",
      tickets,
    );
  return tickets[fixedTickets.length];
}

const getCurrentTickets = () =>
  [...document.querySelector(".content p:nth-of-type(3)").childNodes]
    .filter((e, i) => i % 4 === 2)
    .map((txt) =>
      txt.textContent
        .match(/\d+/g)
        .map((num) => parseInt(num))
        .sort((a, b) => a - b),
    );

const getRandomTicketNumbers = (disallowedList, currentNumbers = []) => {
  if (currentNumbers.length === 6) {
    if (
      disallowedList.some(
        (ticket) =>
          ticket.filter((number) => currentNumbers.includes(number)).length >=
          6,
      )
    )
      return getRandomTicketNumbers(disallowedList);
    return currentNumbers;
  }
  const newNumber = Math.ceil(Math.random() * 30);
  return getRandomTicketNumbers(
    disallowedList,
    currentNumbers.includes(newNumber)
      ? currentNumbers
      : currentNumbers.concat([newNumber]),
  );
};

const fillTicket = (numbers) => {
  const sorted = numbers.sort((a, b) => a - b);
  inputNames.forEach((name, index) => {
    document.querySelector(`input[name="${name}"]`).value = sorted[index];
  });
};

const fillLotteryNumbers = () => {
  const currentTickets = getCurrentTickets();
  if (currentTickets.length >= 20) return false;
  try {
    const numbers = generateTickets(currentTickets);
    fillTicket(numbers);
  } catch (e) {
    console.error(e);
    document
      .querySelector(".content p:nth-of-type(2)")
      .insertAdjacentHTML(
        "beforeBegin",
        `<p style="color:darkred">Something went wrong! You can buy non-optimized numbers like usual or refresh the page.</p><p style="color:red;">${e}</p>`,
      );
    fillTicket(getRandomTicketNumbers(currentTickets));
  }
  return true;
};

const addLuckyButton = (form) => {
  if (!enableLuckyButton) return;
  const orderedLucky = luckyNumbers.sort((a, b) => a - b);
  const alreadyPlayed = [
    ...document.querySelector(".content p:nth-of-type(3)").childNodes,
  ]
    .filter((e, i) => i % 4 === 2)
    .some(
      (t) => t.textContent.replace(":", "").trim() === orderedLucky.join(" "),
    );
  if (alreadyPlayed) return;
  const luckyButton = document.createElement("input");
  luckyButton.type = "button";
  luckyButton.value = "Buy Your Lucky Ticket!";
  luckyButton.style = "padding: 1em;";
  document
    .querySelector('input[form="lottery"]')
    .insertAdjacentElement("afterEnd", luckyButton);
  luckyButton.addEventListener("click", () => {
    luckyNumbers.forEach(
      (n, i) =>
        (document.querySelector(`input[name="${inputNames[i]}"]`).value = n),
    );
    form.submit();
  });
  return luckyButton;
};

const moveButton = (form) => {
  const button = form.querySelector('input[type="submit"]');
  document
    .querySelector(".content p:nth-of-type(2)")
    .insertAdjacentElement("beforeBegin", button);
  form.id = "lottery";
  button.setAttribute("form", "lottery");
  button.style = "padding: 1em;";
  return button;
};

const changeHTML = (canBuy) => {
  const form = document.querySelector('form[action="process_lottery.phtml"]');
  const buyButton = moveButton(form);
  if (canBuy) {
    const luckyButton = addLuckyButton(form);
    form.addEventListener("submit", () => {
      buyButton.disabled = true;
      luckyButton.disabled = true;
    });
  } else {
    buyButton.disabled = true;
    buyButton.value = "All 20 tickets have been bought!";
    document
      .querySelectorAll('input[size="2"]')
      .forEach((input) => (input.disabled = true));
  }
};

(function () {
  "use strict";
  const canBuy = fillLotteryNumbers();
  changeHTML(canBuy);
>>>>>>> parent of 0fda26a... Fix query for input instead of textarea
=======
    document.head.insertAdjacentHTML("beforeEnd", css);
    const outbox = new Outbox(await GM.getValue("neopets-outbox", "[]"));
    const ui = new UI(outbox);
    ui.appendAnchor();
    document.querySelector(".content input[type='submit']")?.addEventListener("click", () => {
        outbox.add();
    });
>>>>>>> main
})();
