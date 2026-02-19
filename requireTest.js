/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does nothing on its own. It was created to be @required. It allows you to use:
        createSWLink(string itemName)
    To get an anchor element that opens the Shop Wizard in a new tab with a specific query if the user doesn't have
    Premium, or the SSW with identical search on if they do have premium.

    You don't need to install this. It's automatically used by other scripts.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const openOldSsw = (itemName, oldSsw) => {
    oldSsw.classList.toggle('panel_shown');
    oldSsw.classList.toggle('panel_hidden');
    oldSsw.style.display = '';
    document.getElementById('searchstr').value = itemName;
    document.getElementById('ssw-criteria').selectedIndex = 1;
}

const openNewSsw = (itemName, newSsw) => {
    newSsw.style.display = 'block';
    document.getElementById('searchstr').value = itemName;
    document.getElementById('ssw-criteria').selectedIndex = 0;
}

const addAction = (a, itemName) => {
    const oldSsw = document.getElementsByClassName('sswdrop')[0];
    const newSsw = document.getElementById('ssw__2020');
    if(oldSsw && newSsw) {
        const callback = oldSsw ? () => openOldSsw(itemName, oldSsw) : () => openNewSsw(itemName, newSsw);
        a.addEventListener('click', callback);
    }
    else {
        a.href = encodeURI(itemName).replaceAll('%20', '+');
        a.target = '_blank';
    }
}

const createSWLink = (itemName, children = []) => {
    const a = document.createElement('a');
    children.forEach(a.appendChild);
    if(!children.length) a.textContent = itemName;
    addAction(a, itemName);
    return a;
}

module.exports = {createSWLink};
