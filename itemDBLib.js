/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This is not a script and does nothing on its own. It was created to be @required by userscripts.
    This allows an userscript to send a query to itemDB, showing an error message if the user is unauthenticated.

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

const onUnauthorized = (scriptName, channel) => {
    if(!hasCreatedItemDBUnauthorizedDialog) {
        hasCreatedItemDBUnauthorizedDialog = true;
        document.head.insertAdjacentHTML('beforeend', itemDBCSS);
        const dialog = createItemDBUnauthorizedDialog();
        fillItemDBUnauthorizedDialog(scriptName, dialog, channel);
        document.body.appendChild(dialog);
    }
    document.getElementsByClassName('itemDB-rejection-modal')[0].showModal();
}

const fetchItemDb = (url, scriptName) => {
    return new Promise((res, rej) => {
        fetch(url, {credentials: 'include'})
            .then(response => response.json())
            .then(json => res(json))
            .catch(e => {
                if(e.name !== 'TypeError') throw(e);
                console.log(`[${scriptName}] You just saw two scary red errors in the console! Don't worry, they're normal until March.`);
                fetch(url)
                    .then(response => {
                        if(response.status === 401) {
                            onUnauthorized(scriptName);
                            document.querySelectorAll('.itemDB-rejection-modal button').forEach(button => 
                                button.addEventListener('click', (e) => {
                                    if(e.target.textContent === '✖️ Close') rej('Canceled');
                                    else setTimeout(async () => res(await fetchItemDb(url, scriptName)), 2000);
                                }), {once: true});
                        } else res(response.json());
                    }).catch(e => console.error(e));
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
