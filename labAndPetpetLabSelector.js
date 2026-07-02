// ==UserScript==
// @name         Neopets: Lab and Petpet Lab Selector
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
// @description  Allows you to favorite pets and petpets and displays them separately. Optionally hides unfavorited and removes Lab prompt. Updated for new Lab!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/labAndPetpetLabSelector.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/labAndPetpetLabSelector.js
// @match        *://*.neopets.com/lab.phtml*
// @match        *://*.neopets.com/petpetlab.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Changes the Petpet Lab selector so it has images instead of being a dropdown
    - Adds owner name to each petpet
    - Adds a heart icon to each pet and petpet. Clicking it will toggle that pet/petpet as a favorite
    - Displays favorites separately from other pets/petpets
    - Optionally hides all other pets/petpets
    - Optionally bypasses the need to press "Yes!  I want to try the ray! (and I am aware of the consequences)"

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Set to false if you don't want this script to bypass the "Yes!  I want to try the ray!(and I am aware of the consequences)" button.
const bypassLabPrompt = true;

const addShowAllButton = async () => {
    const isPetpet = !window.location.href.endsWith('lab.phtml');
    const showAll = await GM.getValue(`${isPetpet ? 'pet' : ''}pet-show-all`, true);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'saahphire-lab-show-all';
    input.checked = showAll;
    input.addEventListener('click', () => GM.setValue(`${isPetpet ? 'pet' : ''}pet-show-all`, input.checked));
    const label = document.createElement('label');
    label.textContent = `Show All Pet${isPetpet ? 'pet' : ''}s`;
    label.prepend(input);
    document.getElementsByClassName('saahphire-favorite-lab-list')[0].insertAdjacentElement('beforebegin', label);
}

const createPetFigure = petName => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = `https://pets.neopets.com/cpn/${petName}/2/2.png`;
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = petName;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    return figure;
}

const onPetRadioChange = (e) => {
    const petName = e.target.value;
    const select = document.getElementsByClassName('lab-select')[0];
    select.selectedIndex = [...select.options].findIndex(opt => opt.value === petName);
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
}

const createRadio = (individualName, callback) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'saahphire-lab-select';
    radio.value = individualName;
    radio.addEventListener('change', callback);
    label.appendChild(radio);
    return label;
}

const onChangeFavorite = (individual, isChecked) => {
    const li = document.querySelector(`li:has([data-saahphire-lab="${individual}"])`);
    const order = parseInt(li.dataset.order);
    const listItems = [...document.querySelectorAll(`.saahphire-lab-${isChecked ? '' : 'un'}favorites li`)];
    const next = listItems.findIndex(f => parseInt(f.dataset.order) > order);
    if(next !== -1) listItems[next].insertAdjacentElement('beforebegin', li);
    else document.getElementsByClassName(`saahphire-lab-${isChecked ? '' : 'un'}favorites`)[0].appendChild(li);
}

const onPressFavoriteButton = async (e, isPetpet) => {
    const toggle = e.target;
    const individual = toggle.dataset.saahphireLab;
    document.querySelectorAll(`[data-saahphire-lab="${individual}"]`).forEach(input => {
        if(input.checked !== toggle.checked) input.checked = toggle.checked;
    });
    const favoritesKey = `${isPetpet ? 'pet' : ''}pet-favorites`;
    const favorites = await GM.getValue(favoritesKey, []);
    if(toggle.checked) {
        GM.setValue(favoritesKey, favorites.concat([individual]));
        onChangeFavorite(individual, true);
    }
    else {
        GM.setValue(favoritesKey, favorites.filter(f => f !== individual));
        onChangeFavorite(individual, false);
    }
}

const createButton = (individual, isPetpet) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add('saahphire-favorite-lab-toggle');
    input.dataset.saahphireLab = individual;
    input.addEventListener('click', e => onPressFavoriteButton(e, isPetpet));
    const label = document.createElement('label');
    label.classList.add('saahphire-favorite-lab-button');
    label.textContent = `Favorite ${individual}`;
    label.appendChild(input);
    return label;
}

const createPetpetFigure = (image, petpetName, owner) => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = image.src;
    figure.appendChild(img);
    const figcaption = document.createElement('figcaption');
    figcaption.textContent = `${petpetName} (${owner})`;
    figure.appendChild(figcaption);
    return figure;
}

const onPetpetRadioChange = (e) => {
    const ownerName = e.target.value;
    const select = document.getElementsByClassName('h5-input')[0];
    const index = [...select.querySelectorAll('option')].findIndex(o => o.value === ownerName);
    select.selectedIndex = index;
// eslint-disable-next-line no-undef
    selectPetpet(select);
}

const createIndividual = (individual, isFavorite, i, label, figure, ownerImg) => {
    const li = document.createElement('li');
    li.appendChild(label);
    label.appendChild(figure);
    if(ownerImg) label.appendChild(ownerImg);
    const button = createButton(individual, ownerImg !== undefined);
    if(isFavorite) button.querySelector('input').checked = true;
    li.appendChild(button);
    li.dataset.order = i;
    return li;
}

const createPetpet = (petpetDiv, owner, isFavorite, i)  => {
    const image = petpetDiv.getElementsByTagName('img')[0];
    const petpetName = image.alt;
    const label = createRadio(owner, onPetpetRadioChange);
    const figure = createPetpetFigure(image, petpetName, owner);
    const ownerImg = document.createElement('img');
    ownerImg.src = `https://pets.neopets.com/cpn/${owner}/1/1.png`;
    ownerImg.classList.add('saahphire-lab-owner');
    return createIndividual(owner, isFavorite, i, label, figure, ownerImg);
}

const createPet = (petName, isFavorite, i)  => {
    const label = createRadio(petName, onPetRadioChange);
    const figure = createPetFigure(petName);
    return createIndividual(petName, isFavorite, i, label, figure);
}

const createPetpetLists = (favorites, favContainer, unfavContainer) => {
    document.querySelectorAll('.ppl-petpet').forEach((petpet, i) => {
        const owner = petpet.id.slice(3);
        const isFavorite = favorites.includes(owner);
        const element = createPetpet(petpet, owner, isFavorite, i);
        (isFavorite ? favContainer : unfavContainer).appendChild(element);
    });
}

const createPetLists = (favorites, favContainer, unfavContainer) => {
    [...document.getElementsByClassName('lab-select')[0].options].forEach((opt, i) => {
        if(!opt.value?.length) return;
        const isFavorite = favorites.includes(opt.value);
        const element = createPet(opt.value, isFavorite, i);
        (isFavorite ? favContainer : unfavContainer).appendChild(element);
    });
}

const createLists = async (mutationRecords) => {
    if(mutationRecords && mutationRecords.length < 7) return;
    const pageType = mutationRecords ? 'pet' : 'petpet';
    const container = document.createElement('div');
    container.classList.add('saahphire-favorite-lab-list', pageType);
    const sibling = mutationRecords ? 'lab-as' : 'ppl-petpet';
    document.getElementsByClassName(sibling)[0].insertAdjacentElement('beforebegin', container);
    const favContainer = document.createElement('ul');
    favContainer.classList.add('saahphire-lab-favorites');
    container.appendChild(favContainer);
    const unfavContainer = document.createElement('ul');
    unfavContainer.classList.add('saahphire-lab-unfavorites');
    container.appendChild(unfavContainer);
    const favorites = await GM.getValue(`${pageType}-favorites`, []);
    mutationRecords ? createPetLists(favorites, favContainer, unfavContainer) : createPetpetLists(favorites, favContainer, unfavContainer);
    addShowAllButton();
}

const init = () => {
    document.head.insertAdjacentHTML('beforeend', css);
    const isPet = window.location.href.match('/lab.phtml');
    if(isPet) {
        const introButton = document.getElementsByClassName('lab-intro-btn')[0];
        const observer = new MutationObserver(createLists);
        observer.observe(document.getElementsByClassName('lab-content')[0], {childList: true});
        if(introButton && bypassLabPrompt) introButton.click();
    }
    else createLists();
}

const css = `<style>
.lab-select-row {
    flex-direction: column;
    max-width: none!important;
    & select {
        max-width: 320px;
        margin: auto;
    }
}

label[for="saahphire-lab-show-all"] {
    display: flex;
    margin: -2.4em 0 2.4em;
    justify-content: center;
    align-items: center;
}

div:has(.ppl-petpet) label[for="saahphire-lab-show-all"] {
    margin: 0;
}

label:has(#saahphire-lab-show-all:checked) ~ .saahphire-favorite-lab-list .saahphire-lab-unfavorites {
    transform: scaleY(100%);
    max-height: 100vh;
}

label:has(#saahphire-lab-show-all:checked) ~ .saahphire-favorite-lab-list .saahphire-lab-favorites {
    border-radius: 0.75em 0.75em 0 0;
}

.saahphire-lab-owner {
    position: absolute;
    top: 0;
    left: 0;
}

.saahphire-favorite-lab-list.petpet figure {
    align-items: center;
    width: 120px;

    & img {
        width: 80px;
    }
}

.saahphire-favorite-lab-list {
    display: flex;
    justify-content: center;
    padding: 0;
    margin: 1em 0;
    flex-wrap: wrap;
    gap: 0.5em;
    border: 1px solid red;
    border-radius: 1em;
    padding: 0.5em;
}

.saahphire-favorite-lab-list:has(.saahphire-lab-favorites) {
    border: 0;
    gap: 0;
}

.saahphire-favorite-lab-list ul {
    margin: 0;
    padding: 1em;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    justify-content: center;
    width: 100%;
}

.saahphire-lab-favorites {
    border: 1px solid red;
    border-radius: 0.75em;
    transition: border-radius 0.2s ease-in-out;
}

.saahphire-lab-unfavorites {
    border: 1px solid grey;
    border-radius: 0 0 0.75em 0.75em;
    border-top: 0;
    transform: scaleY(0);
    transition: transform 0.2s ease-in-out;
    transform-origin: top;
    max-height: 0;
}

:is(.saahphire-favorite-lab-list, .saahphire-lab-favorites):not(:has(li)) {
    display: none!important;

    & + .saahphire-lab-unfavorites {
        border-radius: 0.75em 0.75em;
        border-top: 1px solid grey;
    }
}

.saahphire-favorite-lab-list li {
    position: relative;
    list-style: none;
    cursor: pointer;
    padding: 0.5em;
    border: 1px solid black;
    border-radius: 0.5em;
}

.saahphire-favorite-lab-list input {
    display: none;
}

.saahphire-favorite-lab-list figure {
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0.5em;
    margin: 0;

    &:hover img, &:hover + img {
        filter: grayscale(0.5);
    }
}

.saahphire-favorite-lab-list img {
    filter: grayscale(1);
    transition: filter 0.5s ease-in-out;
}

.saahphire-favorite-lab-list li:has(input[type="radio"]:checked) {
    background: lightseagreen;
    color: white;


    & img {
        filter: grayscale(0);
    }
}

.saahphire-favorite-lab-button {
    display: block;
    appearance: none;
    height: 15px;
    width: 17px;
    border: 0;
    cursor: pointer;
    opacity: 1;
    font-size: 0;
    position: absolute;
    top: 5px;
    right: 5px;
    background-image: url('https://images.neopets.com/themes/h5/basic/images/fav-icon-false.svg');
    transition: opacity 0.2s ease-in-out;

    &:hover {
        background-image: url('https://images.neopets.com/themes/h5/basic/images/fav-icon-true.svg');
    }
}

.saahphire-favorite-lab-toggle {
    display: none;
}

.saahphire-favorite-lab-button:has(.saahphire-favorite-lab-toggle:checked) {
    background-image: url('https://images.neopets.com/themes/h5/basic/images/fav-icon-true.svg');
    &:hover {
        background-image: url('https://images.neopets.com/themes/h5/basic/images/fav-icon-false.svg');
    }
}
</style>`;

(function() {
    'use strict';
    init();
})();
