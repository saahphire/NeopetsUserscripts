// ==UserScript==
// @name         Neopets: No-Reload Safety Deposit Box
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Allows you to take one, a number, or all of an item without reloading the SDB page
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/noReloadSafetyDepositBox.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/noReloadSafetyDepositBox.js
// @match        *://*.neopets.com/safetydeposit.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds a button to fill all items with their max quantities
    - Adds a second 'Move Selected Items' button to the top of your SDB¹
    - Stops the SDB page from reloading whenever you remove items from it
    - Adds two buttons to each item:
      - All: take all of the items to your inventory
      - Move: Take the number you wrote to your inventory

    ¹ itemDB's Safety Deposit Box Pricer breaks the SDB's footer if I added the additional 'Move Selected Buttons' button
    before the item table. That's because they (needlessly) use a (0, 3, 5) selector with multiple nth-child selectors.
    The only way to circumvent that was to add the button to the bottom of the table and change its visual order.
    Unfortunately, that means the button is useless to anyone not using their mouse/touchscreen. I'm really sorry.
    If that script's authors are reading this, all you have to do to select the item table is use [cellpadding="4"].

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const encodeForNeo = name => encodeURI(name).replaceAll('%20', '+');

const addLoading = (cell) => {
  cell.classList.add('loading');
  cell.querySelectorAll('input').forEach(child => child.disabled = true);
  cell.querySelectorAll('a').forEach(a => {
    a.dataset.href = a.href;
    a.removeAttribute('href');
  });
}

const removeLoading = (cell) => {
  cell.classList.remove('loading');
  cell.querySelectorAll('input').forEach(child => child.disabled = false);
  cell.querySelectorAll('a').forEach(a => a.setAttribute('href', a.dataset.href));
}

const removeOne = (event) => {
  event.preventDefault();
  const cell = event.target.parentElement;
  addLoading(cell);
  const [offset, itemId, query, category] = event.target.dataset.sdbsaahvals.split('&');
  const pin = document.getElementById('pin_field')?.value ?? '';
  fetch(`https://www.neopets.com/process_safetydeposit.phtml?offset=${offset}&remove_one_object=${itemId}&obj_name=${query}&category=${category}&pin=${pin}`, {
    method: 'GET'
  }).then(() => {
    adjustQuantities(cell, 1);
    removeLoading(cell);
  });
}

const adjustQuantities = (cell, removed = null) => {
    const quantityCell = cell.parentElement.querySelector('td[align="center"]:not([width="150px"]) b');
    const quantityInput = cell.querySelector('input[type="text"]');
    const formerQuantity = parseInt(quantityCell.textContent);
    const difference = removed ?? formerQuantity;
    const newQuantity = Math.max(0, formerQuantity - difference);
    quantityInput.value = 0;
    if(newQuantity === 0) {
      cell.parentElement.style.display = 'none';
      return;
    }
    quantityCell.textContent = newQuantity;
}

const onSubmitIndividual = (event) => {
  event.preventDefault();
  document.getElementById('pin_field')?.setAttribute('form', event.target.id);
  event.target.parentElement.parentElement.getElementsByClassName('remove_safety_deposit')[0].setAttribute('form', event.target.id);
  const formData = new FormData(event.target);
  const cell = event.target.parentElement;
  addLoading(cell);
  fetch('https://www.neopets.com/process_safetydeposit.phtml?checksub=scan', {method: 'POST', body: formData}).then(() => {
    adjustQuantities(cell, parseInt(cell.querySelector('input[type="text"]').value));
    removeLoading(cell);
    document.getElementById('pin_field')?.removeAttribute('form');
    document.getElementsByClassName('remove_safety_deposit')[0].removeAttribute('form');
  });
}

const onSubmitForm = (e) => onSubmitIndividual(e);

const addForm = (cell, id) => {
  const name = cell.parentElement.querySelector('td[align="left"] b, .sdb-saah-item-name').textContent;
  const form = document.createElement('form');
  form.id = `sdb-saah-${id}`;
  form.classList.add('sdb-saah-move-form');
  form.onsubmit = onSubmitForm;
  form.insertAdjacentHTML('afterBegin', `<input type='hidden' name='obj_name' value='${encodeForNeo(name)}'><input type='hidden' name='category' value='0'><input type='hidden' name='offset' value='0'>`);
  cell.querySelector('input').insertAdjacentElement('afterEnd', form);
  return form;
}

const removeAll = (event) => {
    const cell = event.target.parentElement.parentElement;
    const quantityCell = cell.parentElement.querySelector('td[align="center"]:not([width="150px"]) b');
    cell.querySelector('input[type="text"]').value = parseInt(quantityCell.textContent);
}

const createSubmitButton = (title, cb = null) => {
  const button = document.createElement('input');
  button.type = 'submit';
  button.value = title;
  if(cb) button.onclick = cb;
  return button;
}

const adjustRemoveOneLink = (link, id, name) => {
  link.dataset.sdbsaahvals = `0&${id}&${encodeForNeo(name)}&0`;
  link.href = '';
  link.onclick = removeOne;
}

const addButtons = (row) => {
  const cell = row.querySelector('td:has(input[type="text"])');
  const link = cell.querySelector('input[type="text"] ~ a.medText');
  const id = row.querySelector('.remove_safety_deposit').name.match(/\d+/)[0];
  const form = addForm(cell, id);
  form.appendChild(createSubmitButton('Move'));
  form.appendChild(createSubmitButton('All', removeAll));
  adjustRemoveOneLink(link, id, row.querySelector('td[align="left"] b, .sdb-saah-name').childNodes[0].textContent);
}

const onSubmitAllClick = (e) => {
  e.preventDefault();
  const formData = new FormData(document.getElementById('boxform'));
  document.querySelectorAll('script ~ tr:not(:last-child) td:last-child').forEach(cell => {
    addLoading(cell);
  });
  fetch('https://www.neopets.com/process_safetydeposit.phtml?checksub=scan', {method: 'POST', body: formData}).then(() => {
    document.querySelectorAll('script ~ tr:not(:last-child) td:last-child').forEach(cell => {
      removeLoading(cell);
      adjustQuantities(cell, parseInt(cell.querySelector('input[type="text"]').value));
    });
  });
}

const adjustSubmitAllButton = () => {
  const oldButton = document.getElementsByClassName('submit_data')[0];
  const button = oldButton.cloneNode();
  oldButton.insertAdjacentElement('afterEnd', button);
  oldButton.remove();
  button.onclick = onSubmitAllClick;
}

const removeAllItems = e => {
  document.querySelectorAll('.remove_safety_deposit').forEach(item => {
    item.focus();
    item.value = item.parentElement.parentElement.querySelector('td[align="center"]:not([width="150px"]) b').textContent;
  });
  e.target.focus();
}

const addControlButton = (title, onclick) => {
  const button = document.createElement('input');
  button.type = 'button';
  button.value = title;
  button.addEventListener('click', onclick);
  return button;
}

const addRemoveAllButton = () => addControlButton('✔️ Select all', removeAllItems);

const addTopButtons = () => {
    const div = document.createElement('div');
    div.appendChild(addRemoveAllButton());
    div.appendChild(document.getElementsByClassName('submit_data')[0].cloneNode(true));
    document.querySelector('form br + table').insertAdjacentElement('afterend', div);
    div.classList.add('saahphire-move-button');
    div.getElementsByClassName('submit_data')[0].addEventListener('click', onSubmitAllClick);
}

const init = () => {
  document.head.insertAdjacentHTML('beforeEnd', `<style>${css}</style>`);
  adjustSubmitAllButton();
  document.querySelectorAll('script ~ tr:not(:last-child)').forEach(row => addButtons(row));
  addTopButtons();
}

const css = `
script ~ tr td:last-child {
  position: relative;
}

.loading:after {
  box-sizing: border-box;
}

.loading:after {
  content: '';
  color: #444;
  display: block;
  border-radius: 50%;
  width: 0;
  height: 0;
  margin: 8px;
  box-sizing: border-box;
  border: 32px solid currentColor;
  border-color: currentColor transparent currentColor transparent;
  animation: lds-hourglass 1.2s infinite;
  position: absolute;
  top: 0;
}

.contentModuleHeaderAlt {
  text-align: center;
}

.contentModuleHeaderAlt[data-state] {
  cursor: pointer;
  position: relative;
  height: 3.5em;
}

.contentModuleHeaderAlt[data-state]:hover {
  text-decoration: underline;
}

.contentModuleHeaderAlt::before {
  display: inline-block;
  position: absolute;
  top: 0.25em;
  left: 0;
  width: 100%;
  text-align: center;
}

.contentModuleHeaderAlt[data-state='off']::before {
  content: '-';
}

.contentModuleHeaderAlt[data-state='asc']::before {
  content: '▲';
}

.contentModuleHeaderAlt[data-state='desc']::before {
  content: '▼';
}

.sdb-saah-move {
  text-align: center;
}

.sdb-saah-move-form {
  display: flex;
  gap: 0.25em;
  margin: 0.5em 0 0.25em;
  justify-content: center;
}

.sdb-saah-move-form + br {
  display: none;
}

.saahphire-move-button {
    display: flex;
    background-color: #E4E4E4;
    justify-content: end;
    gap: 1em;
    padding: 0.25em;
    box-sizing: border-box;
    order: -1;
    width: 100%;
}

form:has([cellpadding='4']) {
    display: flex;
    flex-wrap: wrap;
}

form table:first-of-type {
    order: -1;
}

@keyframes lds-hourglass {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(900deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(1800deg);
  }
}
`;

(function() {
    'use strict';
    init();
})();
