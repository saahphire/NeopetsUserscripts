/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This is not a script and does nothing on its own. It was created to be @required by userscripts.
    This allows an userscript to send a query to itemDB, showing an error message if the user is unauthenticated.
    To use it, asynchronously call the function fetchItemDb(url, scriptName), using the URL you would use for a fetch
    (example: https://itemdb.com.br/api/v1/items/negg) as url, your script's name for UI purposes in case
    authorization fails, and your request's stringified body IF it's a POST request.

    Version: 1.1.0

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
    p.textContent = `Your itemDB authorization has expired! You need to visit it every 24 hours (logged-in) or 14 days (logged in) so the script ${scriptName} can work. Once you do, please refresh this page.`;
    return p;
}

const createItemDBUnauthorizedButton = (text, callback) => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = text;
    button.addEventListener('click', callback);
    return button;
}

const fillItemDBUnauthorizedDialog = (scriptName, dialog) => {
    dialog.appendChild(createItemDBUnauthorizedDialogText(scriptName));
    dialog.appendChild(createItemDBUnauthorizedButton('✖️ Close', () => {
        dialog.close();
    }));
    dialog.appendChild(createItemDBUnauthorizedButton('🔗 Go to itemDB', () => {
        dialog.close();
        window.open('https://itemdb.com.br', '_blank').focus();
    }));
}

const onUnauthorized = (scriptName) => {
    if (!hasCreatedItemDBUnauthorizedDialog) {
        hasCreatedItemDBUnauthorizedDialog = true;
        document.head.insertAdjacentHTML('beforeend', itemDBCSS);
        const dialog = createItemDBUnauthorizedDialog();
        fillItemDBUnauthorizedDialog(scriptName, dialog);
        document.body.appendChild(dialog);
    }
    document.getElementsByClassName('itemDB-rejection-modal')[0].showModal();
}

const fetchItemDb = (url, scriptName, body) => new Promise((res, rej) => {
    const headers = { 'Content-Type': 'application/json' };
    fetch(url, { credentials: 'include', method: body ? 'POST' : 'GET', body, headers })
        .then(response => {
            if (response.status === 200) return response.json();
            if (response.status === 401) {
                onUnauthorized(scriptName);
                throw new Error('Unauthorized by itemDB');
            }
            else throw new Error(response.status, response.json().error);
        })
        .then(json => res(json))
        .catch(e => {
            if (e instanceof TypeError && e.message === "Failed to fetch") {
                console.log('Possible CORS issue detected. If you didn\'t get a CORS error, please report this to https://github.com/saahphire/NeopetsUserscripts/issues or https://greasyfork.org/en/scripts/567036-itemdb-fetch-lib/feedback');
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    headers,
                    onload: (response) => (response.status === 200) ? res(JSON.parse(response.responseText)) : rej(res)
                });
            }
            else {
                console.error(e);
                rej(e);
            }
        });
});

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
