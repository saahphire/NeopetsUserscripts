/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This is not a script and does nothing on its own. It was created to be @required by userscripts.
    This allows an userscript to send a query to itemDB, showing an error message if the user is unauthenticated.
    To use it, asynchronously call the function fetchItemDb(url, scriptName), using the URL you would use for a fetch
    (example: https://itemdb.com.br/api/v1/items/negg) as url, your script's name for UI purposes in case
    authorization fails, and your request's stringified body IF it's a POST request.

    Version: 1.0.0

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

let hasCreatedItemDBUnauthorizedDialog = false;

const createItemDBUnauthorizedDialog = () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    dialog.classList.add('itemDB-rejection-modal');
    return dialog;
}

const createItemDBUnauthorizedDialogText = (scriptName) => {
    const p = document.createElement('p');
    p.textContent = `Your itemDB authorization has expired! You need to visit it every 24 hours (logged-in) or 14 days (logged in) so the script ${scriptName} can work.`;
    return p;
}

const createItemDBUnauthorizedButton = (text, callback) => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = text;
    button.addEventListener('click', callback);
    return button;
}

const fillItemDBUnauthorizedDialog = (scriptName, dialog, body) => {
    dialog.appendChild(createItemDBUnauthorizedDialogText(scriptName));
    dialog.appendChild(createItemDBUnauthorizedButton('✖️ Close', () => {
        dialog.close();
    }));
    const goToItemDB = 
    dialog.appendChild(createItemDBUnauthorizedButton('🔗 Go to itemDB', () => {
        dialog.close();
        window.open('https://itemdb.com.br', '_blank').focus();
        setTimeout(() => fetchItemDb(url, scriptName, body), 2000);
    }));
}

const onUnauthorized = (scriptName, url, body) => {
    if(!hasCreatedItemDBUnauthorizedDialog) {
        hasCreatedItemDBUnauthorizedDialog = true;
        document.head.insertAdjacentHTML('beforeend', itemDBCSS);
        const dialog = createItemDBUnauthorizedDialog();
        fillItemDBUnauthorizedDialog(scriptName, dialog, body);
        document.body.appendChild(dialog);
    }
    document.getElementsByClassName('itemDB-rejection-modal')[0].showModal();
}

const fetchItemDb = (url, scriptName, body) => {
    return new Promise((res, rej) => {
        fetch(url, {credentials: 'include', method: body ? 'POST' : 'GET', body})
            .then(response => {
                if(response.status === 200) return response.json();
                if(response.status === 401) onUnauthorized(scriptName, url, body);
                else throw new Error(response.status);
            })
            .then(json => res(json))
            .catch(e => console.error(e));
            })
    });
}

const itemDBCSS = `<style>
.itemDB-rejection-modal {
    display: flex;
    justify-content: space-between;
    width: 30%;
    flex-wrap: wrap;

    & p {
        width: 100%;
    }
}
</style>`;
