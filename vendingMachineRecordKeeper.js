// ==UserScript==
// @name         Neopets: Vending Machine Record Keeper
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Records your Nerkmid Runs at the Vending Machine for you
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/vendingMachineRecordKeeper.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/vendingMachineRecordKeeper.js
// @match        *://*.neopets.com/vending.phtml*
// @match        *://*.neopets.com/vending2.phtml*
// @match        *://*.neopets.com/vending3.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script remembers the prize and NPs you get every time you use a Nerkmid in the Alien Aisha Vending Machine.
    It adds a "Format" box where you can write how each record should be exported, then exports it to the big text box
    below it.

    You can use these placeholders to get things in your Format replaced:
    \n will add a new line
    {{nerkmid}} will be replaced with the name of the Nerkmid you used
    {{prize}} will be replaced with the name of the prize you got
    {{np}} will be replaced with the quantity of NPs you got, without separators
    {{np,}} will be replaced with the quantity of NPs you got, with commas separating thousands
    {{np.}} will be replaced with the quantity of NPs you got, with periods separating thousands

    {{nerkmid}}: {{prize}} - {{np,}} NP\n
    becomes
    Copper Nerkmid: Biscuit Paint Brush - 1,879 NP
    Void Nerkmid: Anchovy Loaf - 12,987 NP

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const fields = ['nerkmid', 'prize', 'np'];

const formatNumberWithSeparator = (number, separator) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

const create = (tagName, attributes, textContent) => {
    const element = document.createElement(tagName);
    if(attributes) Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if(textContent) element.textContent = textContent;
    return element;
}

const regexer = (str) => new RegExp(`{{${str}}}`, 'i');

const formatRecord = (format, record) => fields
    .reduce((agg, curr) => agg.replaceAll(regexer(curr), record[curr]), format)
    .replaceAll('\\n', '\n')
    .replaceAll(regexer('np,'), formatNumberWithSeparator(record.np, ','))
    .replaceAll(regexer('np.'), formatNumberWithSeparator(record.np, '.'));

const formatRecords = async (format) => {
    const runs = await GM.getValue('runs', []);
    if(!runs.length) return '';
    return runs.reduce((agg, curr) => `${agg}${formatRecord(format, curr)}`, '');
}

const updateRecords = async (format) => {
    document.getElementById('saahphire-vending-machine-record').textContent = await formatRecords(format ?? document.getElementById('saahphire-vending-machine-format').value);
}

const updateFormat = async (event) => {
    const currentFormat = event.target.value;
    GM.setValue('format', currentFormat);
    updateRecords(currentFormat);
}

const createFormatInput = (format) => {
    const input = create('input', {
        type: 'text',
        placeholder: 'Vending Machine Record Format',
        value: format,
        id: 'saahphire-vending-machine-format'
    });
    input.addEventListener('input', updateFormat);
    return input;
}

const createCopyButton = () => {
    const button = create('button', {}, 'Copy Records');
    button.addEventListener('click', (e) => {
        navigator.clipboard.writeText(document.getElementById('saahphire-vending-machine-record').textContent);
        e.target.textContent = '✔️';
        setTimeout(() => {
            e.target.textContent = 'Copy Records';
        }, 350);
    });
    return button;
}

const createResetButton = () => {
    const button = create('button', {}, 'Reset All Records');
    button.addEventListener('click', () => {
        const confirmed = window.confirm('Are you sure you want to delete every Vending Machine record? This is irreversible!');
        if(confirmed) {
            GM.setValue('runs', []);
            updateRecords();
        }
    });
    return button;
}

const addRecordToPage = async () => {
    const format = await GM.getValue('format', '{{nerkmid}}: {{prize}} - {{np,}} NP\\n');
    const wrapper = create('div', {'class': 'saahphire-vending-machine-record-keeper'});
    document.getElementsByClassName('content')[0].appendChild(wrapper);
    const label = create('label', {'for': 'saahphire-vending-machine-format'}, 'Format:');
    wrapper.appendChild(label);
    label.appendChild(createFormatInput(format));
    wrapper.appendChild(create('textarea', {id: 'saahphire-vending-machine-record'}, await formatRecords(format)));
    const row = create('div');
    wrapper.appendChild(row);
    row.appendChild(createCopyButton());
    row.appendChild(createResetButton());
}

const saveToRecord = async () => {
    const record = {
        nerkmid: await GM.getValue('last-nerkmid'),
        prize: document.querySelector('img + br + b').textContent,
        np: parseInt(document.querySelector('p b b').textContent.replaceAll(',', ''))
    };
    const allRecords = await GM.getValue('runs', []);
    allRecords.push(record);
    return GM.setValue('runs', allRecords);
}

const watchNerkmid = (nerkmidSelect) => {
    if(!nerkmidSelect) return;
    const submitButton = document.querySelector('input[type="submit"][value="GO!!!"]');
    submitButton.addEventListener('click', () => GM.setValue('last-nerkmid', nerkmidSelect.selectedOptions[0].textContent));
}

const css = `<style>
.saahphire-vending-machine-record-keeper {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
    text-align: center;
    margin: 0 10%;
}

.saahphire-vending-machine-record-keeper label {
    display: flex;
    gap: 0.5em;
    align-items: center;
}

.saahphire-vending-machine-record-keeper input {
    flex: 1;
}

.saahphire-vending-machine-record-keeper textarea {
    height: 7em;
}

.saahphire-vending-machine-record-keeper button:first-of-type {
    margin-right: 0.5em;
}
</style>`;

(async function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    watchNerkmid(document.getElementsByName('nerkmid_id')[0]);
    if(window.location.href.match('vending3')) await saveToRecord();
    addRecordToPage();
})();
