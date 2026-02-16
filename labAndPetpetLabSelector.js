// ==UserScript==
// @name         Neopets: Lab and Petpet Lab Selector
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  I tried a bunch of scripts that said they did this but none worked. Allows you to favorite pets and petpets and displays them separately. Optionally hides all other pets.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/labAndPetpetLabSelector.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/labAndPetpetLabSelector.js
// @match        *://*.neopets.com/lab2.phtml*
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

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const addShowAllButton = async () => {
    const isPetpet = !window.location.href.endsWith('lab2.phtml');
    const showAll = await GM.getValue(`${isPetpet ? 'pet' : ''}pet-show-all`, true);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = showAll;
    input.id = 'saahphire-lab-show-all';
    input.addEventListener('click', () => GM.setValue(`${isPetpet ? 'pet' : ''}pet-show-all`, input.checked));
    const label = document.createElement('label');
    label.textContent = `Show All Pet${isPetpet ? 'pet' : ''}s`;
    label.htmlFor = input.id;
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
    const petName = e.target.id.split('-')[3];
    document.querySelector(`[name="chosen"][value="${petName}"]`).checked = true;
}

const createRadio = (individualName, callback) => {
    const label = document.createElement('label');
    label.htmlFor = `saahphire-lab-select-${individualName}`;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = label.htmlFor;
    radio.name = 'saahphire-lab-select';
    radio.addEventListener('change', callback);
    label.appendChild(radio);
    return label;
}

const addPetToFavoriteList = (petName) => {
    const container = document.getElementsByClassName('saahphire-favorite-lab-list')[0];
    const li = document.createElement('li');
    const button = createButton(petName, false, addPetToFavoriteList, onUncheckPetFavorite);
    button.querySelector('input').checked = true;
    const label = createRadio(petName, onPetRadioChange);
    label.appendChild(createPetFigure(petName));
    li.appendChild(label);
    li.appendChild(button);
    container.appendChild(li);
}

const onUncheckPetFavorite = (petName) => document.querySelector(`.saahphire-favorite-lab-list li:has([data-saahphire-lab="${petName}"])`).remove();

const onPressFavoriteButton = async (e, isPetpet, cbChecked, cbUnchecked) => {
    const toggle = e.target;
    const individual = toggle.dataset.saahphireLab;
    document.querySelectorAll(`[data-saahphire-lab="${individual}"]`).forEach(input => {
        if(input.checked !== toggle.checked) input.checked = toggle.checked;
    });
    const favoritesKey = `${isPetpet ? 'pet' : ''}pet-favorites`;
    const favorites = await GM.getValue(favoritesKey, []);
    if(toggle.checked) {
        GM.setValue(favoritesKey, favorites.concat([individual]));
        cbChecked(individual);
    }
    else {
        GM.setValue(favoritesKey, favorites.filter(f => f !== individual));
        cbUnchecked(individual);
    }
}

const createFavorites = async () => {
    const container = document.createElement('ul');
    container.classList.add('saahphire-favorite-lab-list');
    document.querySelector('form[action="process_lab2.phtml"]').insertAdjacentElement('beforebegin', container);
    const favorites = await GM.getValue('pet-favorites', []);
    favorites.forEach(favorite => addPetToFavoriteList(favorite));
}

const createButton = (individual, isPetpet, callbackOnChecked, callbackOnUnchecked) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add('saahphire-favorite-lab-toggle');
    input.dataset.saahphireLab = individual;
    input.id = `saahphire-favorite-lab-toggle-${individual}-${Math.floor(Math.random() * 100)}`;
    input.addEventListener('click', e => onPressFavoriteButton(e, isPetpet, callbackOnChecked, callbackOnUnchecked));
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.classList.add('saahphire-favorite-lab-button');
    label.textContent = `Favorite ${individual}`;
    label.appendChild(input);
    return label;
}

const addButtonsToPets = async () => {
    const favorites = await GM.getValue('pet-favorites', []);
    document.querySelectorAll('#bxlist li div').forEach((pet) => {
        const petName = pet.getElementsByTagName('img')[0].src.match(/\/cpn\/(\w+)\//)[1];
        const button = createButton(petName, false, addPetToFavoriteList, onUncheckPetFavorite);
        pet.getElementsByTagName('input')[0].insertAdjacentElement('afterEnd', button);
        if(favorites.find(f => f === petName)) button.querySelector('input').checked = true;
    })
    
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
    const ownerName = e.target.id.split('-')[3];
    const select = document.getElementsByClassName('h5-input')[0];
    const index = [...select.querySelectorAll('option')].findIndex(o => o.value === ownerName);
    select.selectedIndex = index;
// eslint-disable-next-line no-undef
    selectPetpet(select);
}

const onChangePetpetFavorite = (owner, isChecked) => {
    console.log(`${isChecked}, ${owner}`);
    const li = document.querySelector(`li:has([data-saahphire-lab="${owner}"])`);
    const order = parseInt(li.dataset.order);
    const listItems = [...document.querySelectorAll(`.saahphire-lab-${isChecked ? '' : 'un'}favorites li`)];
    const next = listItems.findIndex(f => parseInt(f.dataset.order) > order);
    if(next !== -1) listItems[next].insertAdjacentElement('beforebegin', li);
    else document.getElementsByClassName(`saahphire-lab-${isChecked ? '' : 'un'}favorites`)[0].appendChild(li);
}

const createPetpet = (petpetDiv, owner, isFavorite, i)  => {
    const image = petpetDiv.getElementsByTagName('img')[0];
    const petpetName = image.alt;
    const li = document.createElement('li');
    const label = createRadio(owner, onPetpetRadioChange);
    li.appendChild(label);
    label.appendChild(createPetpetFigure(image, petpetName, owner));
    const ownerImg = document.createElement('img');
    ownerImg.src = `https://pets.neopets.com/cpn/${owner}/1/1.png`;
    ownerImg.classList.add('saahphire-lab-owner');
    label.appendChild(ownerImg);
    const button = createButton(owner, true, (owner) => onChangePetpetFavorite(owner, true), (owner) => onChangePetpetFavorite(owner, false));
    if(isFavorite) button.querySelector('input').checked = true;
    li.appendChild(button);
    li.dataset.order = i;
    return li;
}

const createPetpets = async () => {
    const container = document.createElement('div');
    container.classList.add('saahphire-favorite-lab-list', 'petpet');
    document.getElementsByClassName('ppl-petpet')[0].insertAdjacentElement('beforebegin', container);
    const favContainer = document.createElement('ul');
    favContainer.classList.add('saahphire-lab-favorites');
    container.appendChild(favContainer);
    const unfavContainer = document.createElement('ul');
    unfavContainer.classList.add('saahphire-lab-unfavorites');
    container.appendChild(unfavContainer);
    const favorites = await GM.getValue('petpet-favorites', []);
    document.querySelectorAll('.ppl-petpet').forEach((petpet, i) => {
        const owner = petpet.id.slice(3);
        const isFavorite = favorites.find(f => f === owner);
        const element = createPetpet(petpet, owner, isFavorite, i);
        (isFavorite ? favContainer : unfavContainer).appendChild(element);
    })
}

const init = () => {
    document.head.insertAdjacentHTML('beforeend', css);
    const isPetpet = !window.location.href.endsWith('lab2.phtml');
    if(!isPetpet) {
        addButtonsToPets();
        createFavorites();
    }
    else {
        createPetpets();
    }
    addShowAllButton();
}

const css = `<style>
#bxlist div {
    position: relative;
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

#bxwrap {
    transform: scaleY(0);
    transition: transform 0.2s ease-in-out;
    transform-origin: top;
}

label:has(#saahphire-lab-show-all:checked) ~ form #bxwrap, label:has(#saahphire-lab-show-all:checked) ~ .petpet .saahphire-lab-unfavorites {
    transform: scaleY(100%);
    max-height: 100vh;
}

label:has(#saahphire-lab-show-all:checked) ~ .petpet .saahphire-lab-favorites {
    border-radius: 0.75em 0.75em 0 0;
}

.saahphire-lab-owner {
    position: absolute;
    top: 0;
    left: 0;
}

.saahphire-favorite-lab-list.petpet {
    & ul {
        margin: 0;
        padding: 1em;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
        justify-content: center;
        width: 100%;
    }
    & figure {
        align-items: center;
        width: 120px;

        & img {
            width: 80px;
        }
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
