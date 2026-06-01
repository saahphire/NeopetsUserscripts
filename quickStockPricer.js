// ==UserScript==
// @name         Neopets: Quick Stock Pricer (Sortable)
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.4.2
// @description  Adds itemDB prices to your Quick Stock page. Updated to bypass third-party cookie blocking and adds sorting.
// @author       saahphire (modded by valkyrie1248)
// @match        *://*.neopets.com/quickstock.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM_xmlhttpRequest
// @connect      itemdb.com.br
// ==/UserScript==

const getItemName = (cell) => cell.childNodes[0].childNodes[0].textContent;

const addInfoToCell = (info) => {
    const p = document.createElement('p');
    if(info && info.price?.value) {
        p.textContent = `${info.price.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NP`;
        p.dataset.price = info.price.value;
        p.title = new Date(info.price.addedAt).toLocaleString();
        if(info.price.inflated) p.classList.add('saahphire-quickstockpricer-inflated');
    }
    else {
        p.textContent = 'No price found';
        p.dataset.price = 0; // Ensures items without prices sort to the bottom
    }
    if(info && info.saleStatus) p.classList.add(`saahphire-quickstockpricer-${info.saleStatus.status}`);
    return p;
}

const css = `<style id="saahphire-styles">
.saahphire-quickstockpricer-hts, .saahphire-quickstockpricer-ets, .saahphire-quickstockpricer-regular {
    margin: 0;
    &::after {
        font-weight: 600;
        font-size: 0.8em;
        margin-left: 1em;
    }
}
.saahphire-quickstockpricer-hts::after {
    content: "HTS";
    color: red;
}
.saahphire-quickstockpricer-ets::after {
    content: "ETS";
    color: green;
}
.gemini-sort-btn {
    margin-bottom: 15px;
    padding: 8px 16px;
    background-color: #4f46e5;
    color: white;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: background-color 0.2s;
}
.gemini-sort-btn:hover {
    background-color: #4338ca;
}
</style>`;

let sortDescending = true;

const addSortButton = () => {
    const table = document.querySelector('.quickstock-table');
    if (!table || document.getElementById('gemini-sort-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'gemini-sort-btn';
    btn.className = 'gemini-sort-btn';
    btn.innerHTML = '💰 Sort by Market Price (High to Low)';

    btn.onclick = (e) => {
        e.preventDefault(); // Prevent form submission
        const tbody = table.querySelector('tbody');

        // Grab all rows except the final submit row
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.querySelector('td.text-left'));

        rows.sort((a, b) => {
            const priceP_A = a.querySelector('p[data-price]');
            const priceP_B = b.querySelector('p[data-price]');

            const priceA = priceP_A ? parseInt(priceP_A.dataset.price, 10) : 0;
            const priceB = priceP_B ? parseInt(priceP_B.dataset.price, 10) : 0;

            return sortDescending ? priceB - priceA : priceA - priceB;
        });

        // Re-append sorted rows to the DOM
        rows.forEach(row => tbody.appendChild(row));

        sortDescending = !sortDescending;
        btn.innerHTML = sortDescending ? '💰 Sort by Market Price (High to Low)' : '💰 Sort by Market Price (Low to High)';
    };

    // Insert the button just above the table container
    table.parentNode.insertBefore(btn, table);
}

const init = () => {
    const cells = document.querySelectorAll('tr:not(:last-child) td.text-left:first-child');
    const unassignedCells = Array.from(cells).filter(cell => !cell.querySelector('p'));

    if(!unassignedCells.length) return;

    const names = unassignedCells.map(getItemName);
    const url = `https://itemdb.com.br/api/v1/items/many?name[]=${names.join('&name[]=')}`;

    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            if (response.status === 200) {
                try {
                    const items = JSON.parse(response.responseText);
                    unassignedCells.forEach(cell => cell.appendChild(addInfoToCell(items[getItemName(cell)])));

                    if (!document.getElementById('saahphire-styles')) {
                        document.head.insertAdjacentHTML('beforeend', css);
                    }

                    // Inject the sort button after prices are populated
                    addSortButton();

                } catch (e) {
                    console.error("Quick Stock Pricer: Failed to parse itemDB response.", e);
                }
            } else {
                console.error("Quick Stock Pricer: itemDB API returned an error:", response.status);
            }
        },
        onerror: function(err) {
            console.error("Quick Stock Pricer: Network request failed completely.", err);
        }
    });
}

(function() {
    'use strict';
    const observer = new MutationObserver(init);
    const checkExist = setInterval(function() {
       const appDiv = document.querySelector('#quickstock-app > div');
       if (appDiv) {
          clearInterval(checkExist);
          observer.observe(appDiv, {childList: true});
       }
    }, 100);
})();
