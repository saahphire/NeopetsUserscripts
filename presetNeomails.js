// ==UserScript==
// @name         Neopets: Preset Neomails
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Allows you to save a neomail as a preset that you can fill and send easily (by menu or automatically by recipient)
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/presetNeomails.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/presetNeomails.js
// @match        *://*.neopets.com/neomessages.phtml?type=send*
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
    - Adds a "💾" button to the neomail compose screen that saves that neomail as a preset
        - You'll be asked whether you want to save only the subject, only the body, or both. Blank fields will never be
          saved, regardless of what you choose.
        - You can add a name to that preset to tell it apart from others
        - You can set usernames to which the preset will be autofilled IF there's nothing in the field yet
            (for example: the subject is "hi" and the body is "how are you". You set it to autofill for "user". If you
            write "hey" as the subject, nothing in the body, and then choose "user" as a neomail's recipient, the body
            of your neomail will be autofilled with "how are you", but the subject will remain "hey")
    - Adds a "📝" button to the neomail compose screen that opens a preset modal with a list of your presets
        - Each preset in the list has the following buttons:
            - "Fill": Replaces the content of your neomail (subject and/or body) with that preset's
            - "Edit": Edits that preset's settings, including subject, body, and autofill usernames
            - "Delete": Deletes that preset
        - Also has a "➕" button to add a new preset without using the save button

    Please note that only the oldest preset saved for an username will be used to autofill it. Two presets may only be
    used if one is subject-only and another is body-only.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const addButtonNextToSubmit = (button) => document.querySelector(':is(div[align="center"], span):has(input)').insertAdjacentElement('afterend', button);

const getAllPresets = () => GM.getValue('presets', []);

const deletePreset = async (timestamp) => GM.setValue('presets', (await getAllPresets()).filter(preset => preset.timestamp !== timestamp));

const savePreset = async (name, subject, body, commaSeparatedUsernames, timestamp) => {
    if([name, subject, body, commaSeparatedUsernames].every(field => !field || !field.length)) return;
    const allPresets = await getAllPresets();
    const newPreset = {
        name: name === '' ? '(blank)' : name,
        subject,
        body,
        usernames: commaSeparatedUsernames.split(/, */).filter(txt => txt.length),
        timestamp: timestamp ?? Date.now()
    };
    if(timestamp) Object.assign(allPresets.find(preset => preset.timestamp === timestamp), newPreset);
    else allPresets.push(newPreset);
    GM.setValue('presets', allPresets);
    return newPreset;
}

const findPresetForAutofill = async (username) => {
    const allAutofills = (await getAllPresets()).filter(preset => preset.usernames.includes(username));
    if(!allAutofills.length) return;
    const mainAutoFill = allAutofills[0];
    if(mainAutoFill.subject && mainAutoFill.body) return mainAutoFill;
    const altAutoFill = mainAutoFill.subject ? allAutofills.find(preset => preset.body && !preset.subject) : allAutofills.find(preset => preset.subject && !preset.subject);
    if(altAutoFill) {
        mainAutoFill.subject ??= altAutoFill.subject;
        mainAutoFill.body ??= altAutoFill.body;
    }
    return mainAutoFill;
}

const createButton = (text, callback) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('saahphire-preset-neomails-button');
    button.textContent = text;
    button.addEventListener('click', callback);
    return button;
}

const createInput = (inputData, presetObject) => {
    const input = document.createElement(inputData.type);
    if(inputData.type === 'input') input.type = 'text';
    input.id = `saahphire-preset-neomails-${inputData.title.toLowerCase()}`;
    if(presetObject && presetObject[inputData.title.toLowerCase()]) input.value = presetObject[inputData.title.toLowerCase()];
    if(inputData.max) input.maxlength = inputData.max;
    input.placeholder = inputData.placeholder;
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = inputData.title;
    label.appendChild(input);
    return label;
}

const getModalValue = (inputData) => document.getElementById(`saahphire-preset-neomails-${inputData.title.toLowerCase()}`).value.slice(0, inputData.max);

const destroyModal = (modal) => {
    modal.close();
    modal.previousElementSibling.remove();
    modal.remove();
}

const createModal = (title, id) => {
    const dialog = document.createElement('dialog');
    dialog.id = `saahphire-preset-neomails-${id}`;
    document.body.appendChild(dialog);
    const header = document.createElement('h3');
    header.textContent = title;
    dialog.appendChild(header);
    return dialog;
}

const inputs = [
    {
        type: 'input',
        title: 'Name',
        placeholder: 'A name identifying your preset'
    },
    {
        type: 'input',
        title: 'Subject',
        placeholder: 'The subject of your neomail',
        max: 30
    },
    {
        type: 'textarea',
        title: 'Body',
        placeholder: 'The body of your neomail',
        max: 1400
    },
    {
        type: 'input',
        title: 'Usernames',
        placeholder: 'Comma-separated usernames for which this preset should be autofilled'
    }
]

const createSaveModal = (presetObject, callback) => {
    const dialog = createModal('Save Neomail Preset', 'save-modal');
    const p = document.createElement('p');
    p.textContent = 'All fields can be left blank (but leaving them all blank won\'t do anything)';
    dialog.appendChild(p);
    inputs.forEach(inputData => dialog.appendChild(createInput(inputData, presetObject)));
    const buttonContainer = document.createElement('div');
    dialog.appendChild(buttonContainer);
    buttonContainer.appendChild(createButton('Save', async () => {
        const newPresetObject = await savePreset(...inputs.map(inputData => getModalValue(inputData)), presetObject.timestamp);
        if(callback) callback(newPresetObject);
        destroyModal(dialog);
    }));
    buttonContainer.appendChild(createButton('Cancel', () => destroyModal(dialog)));
    return dialog;
}

const fillPreset = (presetObject) => {
    if(!presetObject) return;
    [[presetObject.subject, 'subject'], [presetObject.body, 'message_body']].forEach(pair => {
        const input = document.getElementsByName(pair[1])[0];
        if(pair[0] && input.value === '') input.value = pair[0];
    });
}

const createPresetItem = (presetObject, modal) => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    p.textContent = presetObject.name;
    li.appendChild(p);
    li.appendChild(createButton('Fill', () => {
        fillPreset(presetObject);
        destroyModal(modal);
    }));
    li.appendChild(createButton('Edit', () => {
        const saveModal = createSaveModal(presetObject, (newPresetObject) => {
            Object.assign(presetObject, newPresetObject)
            li.insertAdjacentElement('afterend', createPresetItem(newPresetObject, modal));
            li.remove();
        });
        saveModal.showModal();
    }));
    li.appendChild(createButton('Delete', () => {
        deletePreset(presetObject.timestamp);
        li.remove();
    }));
    return li;
}

const createListModal = async () => {
    const dialog = createModal('Neomail Presets', 'neomail-presets');
    const presets = await getAllPresets();
    const ul = document.createElement('ul');
    dialog.appendChild(ul);
    presets.forEach(preset => ul.appendChild(createPresetItem(preset, dialog)));
    dialog.appendChild(createButton('Close', () => destroyModal(dialog)));
    return dialog;
}

const addSaveButton = () => {
    const subject = document.getElementsByName('subject')[0];
    const body = document.getElementsByName('message_body')[0];
    const button = createButton('💾', () => createSaveModal({ subject: subject.value, body: body.value }).showModal());
    addButtonNextToSubmit(button);
}

const addListButton = () => {
    const button = createButton('📝', async () => (await createListModal()).showModal());
    addButtonNextToSubmit(button);
}

const fillForRecipient = async (username) => {
    if(username !== '') fillPreset(await findPresetForAutofill(username));
}

const addRecipientListener = () => {
    const input = document.getElementsByName('recipient')[0];
    fillForRecipient(input.value);
    input.addEventListener('input', () => fillForRecipient(input.value));
    document.getElementsByName('neofriends')[0].addEventListener('change', () => fillForRecipient(input.value));
}

const init = () => {
    document.head.insertAdjacentHTML('beforeend', css);
    addListButton();
    addSaveButton();
    addRecipientListener();
}

const css = `<style>
span:has(input) ~ .saahphire-preset-neomails-button {
    float: right;
}

.saahphire-preset-neomails-button {
    margin: 0 0.5em;
}

#saahphire-preset-neomails-neomail-presets {
    width: 40%;
    & ul {
        margin: 0;
        padding: 0;
    }
    & li {
        list-style: none;
        display: flex;
        gap: 0.5em;
        padding: 0.5em;
    }
    & li:nth-child(2n) {
        background: oklch(0.65 0.17 250 / 0.25);
    }
    & p {
        text-align: left;
        margin: 0;
        display: inline-block;
        flex-grow: 1;
    }
    & button {
        margin: 0;
    }
}

#saahphire-preset-neomails-save-modal {
    width: 40%;
    display: flex;
    flex-direction: column;
    gap: 1.5em;
    & label {
        display: grid;
        gap: 1em;
        align-items: baseline;
        grid-template-columns: 7em 1fr;
        text-align: left;
        font-weight: 600;
    }
    & div {
        display: flex;
        gap: 1em;
        justify-content: center;
    }
}
</style>`;

(function() {
    'use strict';
    init();
})();
