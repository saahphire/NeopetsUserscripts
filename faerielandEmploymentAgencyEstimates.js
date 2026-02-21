// ==UserScript==
// @name         Neopets: Faerieland Employment Agency Estimates
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.1
// @description  Gives price estimates for each job that doesn't require a coupon, and calculates your profit.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/faerielandEmploymentAgencyEstimates.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/faerielandEmploymentAgencyEstimates.js
// @match        *://*.neopets.com/faerieland/employ/employment.phtml*voucher=basic*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @require      https://update.greasyfork.org/scripts/567036/1759045/itemDB%20Fetch%20Lib.js
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following to BASIC jobs:
    - Uses itemDB to retrieve the approximate price of each item being asked for
    - Adds a price estimate to each job's items (already multiplied by their quantity) next to their names
    - Adds the estimated profit (reward - price) of each job next to their reward
    - Reorders all jobs from highest to lowest profit

    I'm not sure if this is cheaty or not. I don't use the Employment Agency. Just in case, I limited it to basic jobs
    because I think maybe the super jobs are competitive? And this could give you an edge? If you don't think it's a big
    deal, remove "voucher=basic*" from @match above, but I can't vouch for the safety of doing that.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getItemsFromitemDB = async (orderedJobs) => (await fetchItemDb(`https://itemdb.com.br/api/v1/items/many?image_id[]=${orderedJobs.map(job => job.image).join("&image_id[]=")}`, 'Faerieland Employment Agency Estimates'));

const addCommasToNumber = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const calculatePricesAndSort = (orderedJobs, items) => orderedJobs.map(job => {
        const price = items[job.image].price.value;
        job.individual = price;
        job.price = job.individual * job.quantity;
        job.profit = job.reward - job.price;
        return job;
    }).sort((a, b) => b.profit - a.profit);

const getInfoFromJob = (elements) => {
    const [jobFirstRow, jobSecondRow] = elements;
    return {
        elements,
        image: jobFirstRow.getElementsByTagName('img')[0].src.match(/items\/([^.]+)/)[1],
        quantity: parseInt(jobSecondRow.getElementsByTagName('b')[0].textContent.match(/\d+/)[0]),
        reward: parseInt(jobSecondRow.textContent.match(/Reward: (\d*,?\d+)/)[1].replace(',', ''))
    }
}

const reflectInfo = (parent, job) => {
    job.elements[1].querySelector('p, br').insertAdjacentHTML('beforeBegin', ` (<strong>${addCommasToNumber(job.price)} NP</strong>, ${addCommasToNumber(job.individual)} NP each)`);
    job.elements[1].getElementsByTagName('td')[0].insertAdjacentHTML('beforeEnd', ` (Profit: <strong>${addCommasToNumber(job.profit)} NP</strong>)`);
    job.elements.forEach(element => parent.appendChild(element));
}

(async function() {
    'use strict';
    if(!document.querySelector('[rowspan="2"]')) return;
    const originalJobs = [...document.querySelectorAll('br + [cellpadding="2"] tr')];
    const jobs = Array.from({ length: Math.ceil(originalJobs.length / 3) }, (_, i) => originalJobs.slice(i * 3, i * 3 + 3)).map(trio => getInfoFromJob(trio))
    const orderedJobs = calculatePricesAndSort(jobs, await getItemsFromitemDB(jobs));
    const parent = document.querySelector('br + [cellpadding="2"] tbody');
    orderedJobs.forEach(job => reflectInfo(parent, job));
})();
