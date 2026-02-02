// ==UserScript==
// @name         Neopets: Quicker Fishing Vortex Pet Change
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
// @description  Adds links to quickly switch between pets while fishing
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/quickerFishingPetChange.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/quickerFishingPetChange.js
// @match        *://*.neopets.com/water/fishing.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds buttons to quickly change pets at Ye Olde Fishing Vortex.
    - You can change pets from the item reward page. The page will reload and you'll have fished with the new pet. That
      means you only need one click per pet to fish.
    - Updates your list of pets automatically when you visit the Vortex, but not when you re-fish. Because of that, it
      takes no time at all to show your buttons on re-fishing.
    - Adds a nice spinner while changing pets.
    - Makes it clear which pet is your active right now.

    Inspired by Fishing Vortex Quick Change:
      https://github.com/conceptoto/UserScripts/blob/main/YeOldeVortexQuickChange.user.js
      But it only adds pet change buttons to the first fishing screen, and reloads the pet list each time.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const updatePets = async () => {
    const response = await fetch("https://www.neopets.com/quickref.phtml");
    const quickRefPage = await response.text();
    const petNames = quickRefPage.match(/(?<=\/abilities\.phtml\?pet_name=)\w+/g);
    GM.setValue("pets", petNames);
}

const onButtonClick = e => {
  const target = e.target.tagName === "IMG" ? e.target.parentElement : e.target;
  target.classList.add("loading");
  fetch(`https://www.neopets.com/process_changepet.phtml?new_active_pet=${target.dataset.pet}`).then(() => {
      document.querySelectorAll(".quicker-fishing-pet-change .active").forEach(noLongerActive => noLongerActive.classList.remove("active"));
      target.classList.remove("loading");
      target.classList.add("active");
      window.location.reload();
  })
}

const createContainer = () => {
    const div = document.createElement("div");
    div.classList.add("quicker-fishing-pet-change", "loading");
    div.insertAdjacentHTML("afterBegin", css);
    document.getElementsByClassName('btn-single__2020')[0].parentElement.insertAdjacentElement("afterEnd", div);
    return div;
}

const addButton = async (petName, activePet) => {
    const button = document.createElement('button');
    button.role = 'button';
    button.dataset.pet = petName;
    if(petName === activePet) button.classList.add('active');
    button.addEventListener("click", onButtonClick);
    let img;
    await new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = `https://pets.neopets.com/cpn/${petName}/1/1.png`;
    });
    button.appendChild(img);
    return button;
  }

const fillPets = async (div) => {
    const petNames = await GM.getValue("pets", []);
    const activePet = document.getElementsByClassName("profile-dropdown-link")[0].href.split("=")[1].toLowerCase();
    Promise.all(petNames.map(pet => addButton(pet, activePet))).then(buttons => {
      buttons.forEach(button => div.appendChild(button));
      div.classList.remove('loading');
    });
}

const css = `<style>
.quicker-fishing-pet-change {
  display: flex;
  margin: auto;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;
}

.quicker-fishing-pet-change button {
  appearance: none;
  padding: 0;
  border: 0;
  height: 50px;
  filter: grayscale(1);
  cursor: pointer;
  background: none;
}

.quicker-fishing-pet-change button:hover, .quicker-fishing-pet-change button:active {
  filter: grayscale(0.75);
}

.quicker-fishing-pet-change button.active {
  filter: none;
}

.quicker-fishing-pet-change button.loading {
  filter: greyscale(0.5);
}

.quicker-fishing-pet-change.loading {
  height: 0;
}

.quicker-fishing-pet-change button.loading::before, .quicker-fishing-pet-change.loading::before {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26px' height='26px' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z' stroke-width='0.5' stroke='%23fff'%3E%3CanimateTransform attributeName='transform' dur='0.75s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E");
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.quicker-fishing-pet-change.loading::before {
  filter: invert(1);
  top: auto;
  margin-top: 25px;
}

.quicker-fishing-pet-change img {
  border-radius: 50%;
}
</style>`;

(async function() {
    'use strict';
    if(!document.querySelector('input.btn-single__2020')) return;
    const div = createContainer();
    updatePets().then(() => fillPets(div));
})();
