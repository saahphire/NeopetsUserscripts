// ==UserScript==
// @name         Neopets: Game Avatar Infobox
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a little box above your high score in a game telling you how many points you'd have to score to get its avatar
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/gameAvatarInfobox.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/gameAvatarInfobox.js
// @match        *://*.neopets.com/games/game.phtml?game_id=*&*
// @match        *://*.neopets.com/settings/neoboards*
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
    - Adds a section on the box to the right of a game (the one that has trophy info) with information about that game's
      avatar: name, image, requirement, and a link to its JellyNeo guide
    - Doesn't add that box if you already have that avatar unlocked. You'll need to visit the Neoboards Preferences page
      to update that.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const findGameInfo = () => avatars[Object.keys(avatars).find(game => window.location.href.match(/game_id=(\d+)/)[1] === game)]

const getAvatarDescription = (requirement) => requirement.startsWith('top') ?
    `Reach ${requirement} on the high score table when trophies are awarded daily` :
    `Get at least ${requirement} points`;

const shouldSaveAvatar = (avatar) => [...document.querySelectorAll('.settings-av img')].find(img => img.alt === avatar.name);

const saveAvatars = (avatars) => GM.setValue('unlocked-avatars', avatars);

const isSavedAvatar = async (avatar) => (await GM.getValue('unlocked-avatars', [])).find(avatarId => avatarId === avatar.id);

const updateSavedAvatars = () => {
    const avatarsToSave = Object.values(avatars).filter(shouldSaveAvatar).map(avatarInfo => avatarInfo.id);
    saveAvatars(avatarsToSave);
}

const createAvatarBox = (gameInfo) => `<tr>
    <td class="saahphire-game-avatar">
        <h3>Game Avatar</h3>
        <img src="${gameInfo.image}">
        <div class="saahphire-game-avatar-text">
            <p><strong>${gameInfo.name}</strong></p>
            <p>${getAvatarDescription(gameInfo.requirement)}</p>
            <p><a href="${gameInfo.guide}">JellyNeo Guide</a></p>
        </div>
        <hr>
    </td>
</tr>`;

const onGamePage = async () => {
    const gameInfo = findGameInfo();
    console.log(gameInfo);
    if(!gameInfo || await isSavedAvatar(gameInfo)) return;
    console.log(5);
    document.head.insertAdjacentHTML('beforeend', css);
    const parent = document.querySelector('[width="230"] tbody');
    parent.insertAdjacentHTML('afterbegin', createAvatarBox(gameInfo));
}

const avatars = {
    '75': {
        'guide': 'https://www.jellyneo.net/?go=braintree',
        'id': '75',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/554.gif',
        'name': 'Brain Tree Quest',
        'requirement': 'top 50'
    },
    '159': {
        'guide': 'https://www.jellyneo.net/index.php?go=gadgadsgame',
        'id': '159',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/83.gif',
        'name': 'Gadsgadsgame',
        'requirement': '1,000'
    },
    '197': {
        'guide': 'https://www.jellyneo.net/?go=escape_from_meridell_castle',
        'id': '197',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/23.gif',
        'name': 'Draik - Escape from Meridell Castle',
        'requirement': 'top 50'
    },
    '198': {
        'guide': 'https://www.jellyneo.net/?go=tnt_staff_smasher',
        'id': '198',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/273.gif',
        'name': 'Revenge is Sweet',
        'requirement': '2,250'
    },
    '204': {
        'guide': 'https://www.jellyneo.net/?go=advert_attack',
        'id': '204',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/195.gif',
        'name': 'Ace Zafara',
        'requirement': '700'
    },
    '212': {
        'guide': 'https://www.jellyneo.net/?go=grand_theft_ummagine',
        'id': '212',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/263.gif',
        'name': 'Grand Theft Ummagine',
        'requirement': '1,100'
    },
    '228': {
        'guide': 'https://www.jellyneo.net/index.php?go=petpet_rescue',
        'id': '228',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/233.gif',
        'name': 'Petpet Rescue',
        'requirement': '250'
    },
    '230': {
        'guide': 'https://www.jellyneo.net/?go=castle_of_eliv_thade',
        'id': '230',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/84.gif',
        'name': 'Evil Eliv Thade',
        'requirement': '1,200'
    },
    '306': {
        'guide': 'https://www.jellyneo.net/?go=suteks_tomb',
        'id': '306',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/62.gif',
        'name': 'Suteks Tomb',
        'requirement': '2,000'
    },
    '307': {
        'guide': 'https://www.jellyneo.net/?go=the_buzzer_game',
        'id': '307',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/160.gif',
        'name': 'Techo - The Buzzer Game',
        'requirement': '300'
    },
    '315': {
        'guide': 'https://www.jellyneo.net/?go=mynci_beach_volleyball',
        'id': '315',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/203.gif',
        'name': 'Spike It!',
        'requirement': '800'
    },
    '330': {
        'guide': 'https://www.jellyneo.net/?go=gourmet_club_bowls',
        'id': '330',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/93.gif',
        'name': 'Dr. Grumps',
        'requirement': '900'
    },
    '349': {
        'guide': 'https://www.jellyneo.net/?go=hannah_and_the_pirate_caves',
        'id': '349',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/169.gif',
        'name': 'Hannah and the Pirate Caves',
        'requirement': '150,000'
    },
    '356': {
        'guide': 'https://www.jellyneo.net/?go=dice_escape',
        'id': '356',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/176.gif',
        'name': 'Dice Escape',
        'requirement': '1,000'
    },
    '358': {
        'guide': 'https://www.jellyneo.net/?go=faerie_bubbles',
        'id': '358',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/297.gif',
        'name': 'Faerie Bubbles',
        'requirement': '2,000'
    },
    '379': {
        'guide': 'https://www.jellyneo.net/index.php?go=meepit_juice_break',
        'id': '379',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/214.gif',
        'name': 'A Meepit! Run!',
        'requirement': '3,500'
    },
    '381': {
        'guide': 'https://www.jellyneo.net/?go=kass_basher_flash',
        'id': '381',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/133.gif',
        'name': 'Whack-A-Kass',
        'requirement': '850'
    },
    '386': {
        'guide': 'https://www.jellyneo.net/?go=attack_of_the_slorgs',
        'id': '386',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/174.gif',
        'name': 'Attack of the Slorgs',
        'requirement': '1,000'
    },
    '390': {
        'guide': 'https://www.jellyneo.net/?go=freaky_factory',
        'id': '390',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/154.gif',
        'name': 'Freaky Factory - Yoinked',
        'requirement': '1,250'
    },
    '412': {
        'guide': 'https://www.jellyneo.net/index.php?go=snowmuncher',
        'id': '412',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/139.gif',
        'name': 'Snowmuncher',
        'requirement': '5,000'
    },
    '500': {
        'guide': 'https://www.jellyneo.net/?go=meerca_chase_2',
        'id': '500',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/152.gif',
        'name': 'Meerca - Chase',
        'requirement': '1,250'
    },
    '507': {
        'guide': 'https://www.jellyneo.net/?go=ice_cream_machine',
        'id': '507',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/201.gif',
        'name': 'Ice Cream Machine',
        'requirement': '14,500'
    },
    '538': {
        'guide': 'https://www.jellyneo.net/?go=hungry_skeith',
        'id': '538',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/166.gif',
        'name': 'Skeith - Jelly Processing Plant',
        'requirement': '1,000'
    },
    '539': {
        'guide': 'https://www.jellyneo.net/?go=chia_bomber_2',
        'id': '539',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/76.gif',
        'name': 'Chia Bomber',
        'requirement': '1,300'
    },
    '540': {
        'guide': 'https://www.jellyneo.net/?go=meepit_vs_feepit',
        'id': '540',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/221.gif',
        'name': 'Meepit Vs Feepit',
        'requirement': '3,000'
    },
    '544': {
        'guide': 'https://www.jellyneo.net/?go=snow_wars_2',
        'id': '544',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/12.gif',
        'name': 'Grundo - Snowthrow!',
        'requirement': '10,000'
    },
    '574': {
        'guide': 'https://www.jellyneo.net/?go=typing_terror',
        'id': '574',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/262.gif',
        'name': 'Typing Terror',
        'requirement': '3,600'
    },
    '645': {
        'guide': 'https://www.jellyneo.net/?go=feed_florg',
        'id': '645',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/298.gif',
        'name': 'Chia - Florg',
        'requirement': '250'
    },
    '761': {
        'guide': 'https://www.jellyneo.net/?go=volcano_run_ii',
        'id': '761',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/264.gif',
        'name': 'Volcano Run',
        'requirement': '1,500'
    },
    '763': {
        'guide': 'https://www.jellyneo.net/?go=magax_destroyer_2',
        'id': '763',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/71.gif',
        'name': 'Magax: Destroyer',
        'requirement': '3,500'
    },
    '852': {
        'guide': 'https://www.jellyneo.net/?go=stowaway_sting',
        'id': '852',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/149.gif',
        'name': 'Deckswabber',
        'requirement': '1,200'
    },
    '885': {
        'guide': 'https://www.jellyneo.net/?go=maths_nightmare',
        'id': '885',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/2.gif',
        'name': 'Babaa - Maths Nightmare',
        'requirement': 'top 50'
    },
    '887': {
        'guide': 'https://www.jellyneo.net/?go=goparokko',
        'id': '887',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/490.gif',
        'name': 'Goparokko',
        'requirement': '8,500'
    },
    '902': {
        'guide': 'https://www.jellyneo.net/?go=carnival_of_terror',
        'id': '902',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/390.gif',
        'name': 'Carnival of Terror',
        'requirement': '725'
    },
    '964': {
        'guide': 'https://www.jellyneo.net/?go=spacerocked',
        'id': '964',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/487.gif',
        'name': 'Spacerocked!',
        'requirement': '13,500'
    },
    '999': {
        'guide': 'https://www.jellyneo.net/?go=destruct_o_match_3',
        'id': '999',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/207.gif',
        'name': 'Destruct-O-Match II',
        'requirement': '2,500'
    },
    '1042': {
        'guide': 'https://www.jellyneo.net/?go=mutant_graveyard_of_doom_ii',
        'id': '1042',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/393.gif',
        'name': 'Mutant Graveyard of Doom II',
        'requirement': '2,250'
    },
    '1048': {
        'guide': 'https://www.jellyneo.net/?go=nimmos_pond',
        'id': '1048',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/386.gif',
        'name': 'Nimmos Pond',
        'requirement': '4,000'
    },
    '1076': {
        'guide': 'https://www.jellyneo.net/?go=snow_roller',
        'id': '1076',
        'image': 'https://www.jellyneo.net/assets/imgs/avatars/491.gif',
        'name': 'Snowroller',
        'requirement': '6,500'
    }
};

const css = `<style>
.saahphire-game-avatar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
}

#gr-ctp-hiscores .saahphire-game-avatar h3 {
    font-size: 1.05rem;
    width: 100%;
    margin: 0;
}

.saahphire-game-avatar img {
    height: 50px;
    width: 50px;
}

.saahphire-game-avatar p {
    margin: 0;
}
</style>`;

(function() {
    'use strict';
    if(window.location.href.match('neoboards')) updateSavedAvatars();
    else onGamePage();
})();
