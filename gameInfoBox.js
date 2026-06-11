// ==UserScript==
// @name         Neopets: Game Info Box
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a box below the high score box with: Avatar, cheats, link to its JellyNeo guide, and link to is TheDailyNeopets guide. Also fixes CSS for games.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/gameInfoBox.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/gameInfoBox.js
// @match        *://*.neopets.com/games/game.phtml?game_id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Only games from the Games Room with a High Scores box have been added to this script. I could add others but it's a
    lot of work and I'm not sure anyone wants it. If I'm missing any, please let me know through a GreasyFork comment or
    GitHub issue.
    https://greasyfork.org/en/scripts/582217-neopets-game-info-box/feedback
    https://github.com/saahphire/NeopetsUserscripts/issues

    This will display a box under High Scores with:
    - The game's avatar and its requirements, or "No known avatar" if there isn't one
    - The game's cheats and what they do, or "No known cheats" if there aren't any
    - A link to the game's JellyNeo guide
    - A link to the game's The Daily Neopets guide, if it exists

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const create = (tagName, attributes, textContent) => {
  const element = document.createElement(tagName);
  if(attributes) Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if(textContent) element.textContent = textContent;
  return element;
}

const avatarBox = (avatar) => {
  const container = create('div', {'class': 'avatar'});
  container.appendChild(create('img', {src: avatar.img}));
  container.appendChild(create('h3', {}, avatar.title));
  container.appendChild(create('p', {}, avatar.desc));
  return container;
}

const cheatsList = (cheats) => {
  const ul = create('ul', {'class': 'cheats'});
  for (const cheat of cheats) {
    const strong = create('strong', {}, `${cheat.code}: `);
    const li = create('li', {}, cheat.desc);
    li.prepend(strong);
    ul.appendChild(li);
  }
  return ul;
}

const guideLinks = (jellyNeo, dailyNeopets) => {
  const p = create('p');
  if(jellyNeo && dailyNeopets) p.textContent = ' | ';
  if(jellyNeo) p.prepend(create('a', {href: jellyNeo}, 'JellyNeo'));
  if(dailyNeopets) p.appendChild(create('a', {href: dailyNeopets}, 'The Daily Neopets'));
  return p;
}

const buildBox = (gameInfo) => {
  const module = create('div', {'class': 'module saahphire-game-info'});
  module.appendChild(gameInfo.avatar ? avatarBox(gameInfo.avatar) : create('p', {}, 'No known avatar'));
  console.log(5);
  module.appendChild(create('hr'));
  module.appendChild(gameInfo.cheats && gameInfo.cheats.length ? cheatsList(gameInfo.cheats) : create('p', {}, 'No known cheats'));
  console.log(6);
  module.appendChild(create('hr'));
  if(gameInfo.jellyNeo || gameInfo.dailyNeopets)
    module.appendChild(guideLinks(gameInfo.jellyNeo, gameInfo.dailyNeopets));
  console.log(7);
  return module;
}

const init = () => {
  if(!document.getElementById('gr-ctp-hiscores')) return;
  document.head.insertAdjacentHTML('beforeend', css);
  const gameId = window.location.href.match(/id=(\d+)/)[1];
  const gameInfo = gameData[gameId];
  if(!gameInfo) return;
  const title = create('div', {'class': 'saahphire-game-info-title'});
  document.getElementById('gr-ctp-hiscores').insertAdjacentElement('afterend', title);
  title.insertAdjacentElement('afterend', buildBox(gameInfo));
}

const css = `<style>
.container {
  min-height: auto;
}

.module .header {
  z-index: 2!important;
}

#gr-ctp-premium-featured:not(:has(a)) {
  display: none;
  & + .module {
    top: 0;
  }
}

.saahphire-game-info-title {
  background: url(https://images.neopets.com/games/pages/headers/game-information.png) no-repeat;
  height: 37px;
  width: 200px;
  text-indent: -4000px;
  z-index: 2;
  position: absolute;
  margin-top: 11px;
}

.saahphire-game-info {
  margin-top: 41px;
  background: url(https://images.neopets.com/games/pages/frame-hdr.png) no-repeat -55px 0px;
  position: relative;
  min-height: 132px;
  padding: 10px 38px;
  text-align: center;

  .avatar {
    display: grid;
    grid-template-columns: 50px 1fr;
    align-items: center;
    gap: 0.5em;
    margin-top: 1em;

    h3 {
      font-size: 1.1em;
    }

    p {
      grid-column: span 2;
      margin: 0;
    }
  }

  .cheats {
    padding: 0;

    li {
      margin: 0.5em 0;
    }
  }

  &::before, &::after {
    content: "";
    background: url(https://images.neopets.com/games/pages/frame-hdr.png) no-repeat;
    position: absolute;
    top: 0px;
    width: 38px;
    height: 100%;
    z-index: 1;
  }

  &::before {
    background-position-x: -10px;
    left: -1px;
  }

  &::after {
    background-position-x: -49px;
    right: -1px;
  }
}
</style>`;

const gameData = {
  "10": {
    "avatar": {
      "desc": "Win the jackpot in Dice-A-Roo.",
      "title": "Dice-A-Roo"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=dice_a_roo"
  },
  "29": {
    "avatar": {
      "desc": "Lose a game of Cliffhanger.",
      "title": "Cliffhanger - Game Over"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=cliffhanger"
  },
  "81": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/splat-a-sloth",
    "jellyNeo": "https://www.jellyneo.net/?go=splat_a_sloth"
  },
  "82": {
    "jellyNeo": "https://www.jellyneo.net/?go=deckball"
  },
  "109": {
    "avatar": {
      "desc": "Randomly awarded when you catch Capara cheating and win the first round in Cheat!",
      "title": "Capara"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=cheat"
  },
  "149": {
    "avatar": {
      "desc": "Send a score of 250+ points in Extreme Herder.This avatar was originally named \"Extreme Herder\".",
      "img": "https://images.neopets.com/neoboards/avatars/kacheek06.gif",
      "title": "Kacheek - Herder"
    },
    "cheats": [
      {
        "code": "freeze",
        "desc": "Type during gameplay to freeze Balthazar. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/extreme-herder-2",
    "jellyNeo": "https://www.jellyneo.net/?go=extreme_herder"
  },
  "155": {
    "avatar": {
      "desc": "Random when you cross the finish line in 60 seconds or less on Cheeseroller.",
      "img": "https://images.neopets.com/neoboards/avatars/cheeseroller.gif",
      "title": "Techo - Cheesy"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/cheeseroller",
    "jellyNeo": "https://www.jellyneo.net/?go=cheeseroller"
  },
  "159": {
    "avatar": {
      "desc": "Send a score of 1,000+ points in Gadgadsgame.",
      "img": "https://images.neopets.com/neoboards/avatars/gadsgadsgame.gif",
      "title": "Gadgadsgame"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/gadgadsgame",
    "jellyNeo": "https://www.jellyneo.net/?go=gadgadsgame"
  },
  "178": {
    "avatar": {
      "desc": "Collect your winnings when you reach 320 NP on Double or Nothing.",
      "img": "https://images.neopets.com/neoboards/avatars/snargan.gif",
      "title": "Skeith - Snargan"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/double-or-nothing",
    "jellyNeo": "https://www.jellyneo.net/?go=double_or_nothing"
  },
  "197": {
    "avatar": {
      "desc": "Awarded if you are in the top 50 on the high score table of Escape from Meridell Castle when trophies are awarded daily.",
      "img": "https://images.neopets.com/neoboards/avatars/efmcdraik.gif",
      "title": "Draik - Escape from Meridell Castle"
    },
    "cheats": [
      {
        "code": "valrigard",
        "desc": "Type during gameplay to reset the clock. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/escape-from-meridell-castle",
    "jellyNeo": "https://www.jellyneo.net/?go=escape_from_meridell_castle"
  },
  "198": {
    "avatar": {
      "desc": "Send a score of 2,250+ points in TNT Staff Smasher.",
      "img": "https://images.neopets.com/neoboards/avatars/donna_wasm.gif",
      "title": "Revenge is Sweet"
    },
    "cheats": [
      {
        "code": "a5paragu5",
        "desc": "Type during gameplay for a bigger mallet. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/tnt-staff-smasher",
    "jellyNeo": "https://www.jellyneo.net/?go=tnt_staff_smasher"
  },
  "201": {
    "jellyNeo": "https://www.jellyneo.net/?go=attack_of_the_marblemen"
  },
  "202": {
    "cheats": [
      {
        "code": "channyhungry",
        "desc": "Type during gameplay for an extra 30 seconds. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/spell-or-starve",
    "jellyNeo": "https://www.jellyneo.net/?go=spell_or_starve"
  },
  "204": {
    "avatar": {
      "desc": "Send a score of 700+ points in Advert Attack.",
      "title": "Ace Zafara"
    },
    "cheats": [
      {
        "code": "nopopups",
        "desc": "Type during gameplay to clear all pop-ups. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=advert_attack"
  },
  "207": {
    "cheats": [
      {
        "code": "Click the \"N\" on the spinning Grundo's suit.",
        "desc": "Access the secret ball."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/zurroball",
    "jellyNeo": "https://www.jellyneo.net/?go=zurroball"
  },
  "212": {
    "avatar": {
      "desc": "Send a score of 1,100+ points in Grand Theft Ummagine.",
      "img": "https://images.neopets.com/neoboards/avatars/gtu.gif",
      "title": "Grand Theft Ummagine"
    },
    "cheats": [
      {
        "code": "ummaginethief",
        "desc": "Type during gameplay to skip the current level. Your score will decrease the first time you use this code. Repeated uses will either increase or decrease your score, but your total score will remain relatively low. Unlimited use."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/grand-theft-ummagine",
    "jellyNeo": "https://www.jellyneo.net/?go=grand_theft_ummagine"
  },
  "216": {
    "avatar": {
      "desc": "Awarded after playing a total of 300 games of Cellblock. The 300 games may be wins, losses, or draws. (So in other words, if you're on an advanced level, you may continue to lose and still advance towards the avatar.) These games must have been played after the release of the avatar; games played prior to the avatar's release do not count. Starting from the beginning, the latest this could happen (if you win every single game) would be after Match 1 of Level 2 in Tournament 12.",
      "title": "Master Vex"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=cellblock"
  },
  "220": {
    "cheats": [
      {
        "code": "happyvalley",
        "desc": "Type during gameplay to remove all ice cracks for the duration of the level. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/rink-runner",
    "jellyNeo": "https://www.jellyneo.net/?go=rink_runner"
  },
  "226": {
    "avatar": {
      "desc": "Send a score of 200+ points in Extreme Potato Counter.",
      "img": "https://images.neopets.com/neoboards/avatars/extremepotato.gif",
      "title": "Extreme Potato Counter"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/extreme-potato-counter",
    "jellyNeo": "https://www.jellyneo.net/?go=extreme_potato_counter"
  },
  "228": {
    "avatar": {
      "desc": "Send a score of 250+ points in Petpet Rescue.",
      "img": "https://images.neopets.com/neoboards/avatars/petpetrescue.gif",
      "title": "Petpet Rescue"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/petpet-rescue",
    "jellyNeo": "https://www.jellyneo.net/?go=petpet_rescue"
  },
  "229": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/word-poker",
    "jellyNeo": "https://www.jellyneo.net/?go=word_poker"
  },
  "230": {
    "avatar": {
      "desc": "Send a score of 1,200+ points in The Castle of Eliv Thade.",
      "title": "Evil Eliv Thade"
    },
    "cheats": [
      {
        "code": "rehaxtint",
        "desc": "Type during gameplay for an extra hint. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=castle_of_eliv_thade"
  },
  "239": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/chemistry-for-beginners",
    "jellyNeo": "https://www.jellyneo.net/?go=chemistry_for_beginners"
  },
  "248": {
    "avatar": {
      "desc": "Send a score of 800+ points in Raiders of Maraqua.",
      "title": "Raider of Maraqua"
    },
    "cheats": [
      {
        "code": "1morekarpohplease",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=raiders_of_maraqua"
  },
  "258": {
    "jellyNeo": "https://www.jellyneo.net/?go=defender_trainer"
  },
  "305": {
    "cheats": [
      {
        "code": "trappedkadoaties",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/warf-rescue-team",
    "jellyNeo": "https://www.jellyneo.net/?go=warf_rescue_team"
  },
  "306": {
    "avatar": {
      "desc": "Send a score of 2,000+ points in Sutek's Tomb.",
      "img": "https://images.neopets.com/neoboards/avatars/sutekstomb.gif",
      "title": "Suteks Tomb"
    },
    "cheats": [
      {
        "code": "pyramibread",
        "desc": "Type during gameplay to show the next available combo. Unlimited use."
      },
      {
        "code": "plzsutekcanihavemoretime",
        "desc": "Type during gameplay for an extra 30 seconds. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/suteks-tomb",
    "jellyNeo": "https://www.jellyneo.net/?go=suteks_tomb"
  },
  "307": {
    "avatar": {
      "desc": "Send a score of 300+ points in The Buzzer Game.",
      "title": "Techo - The Buzzer Game"
    },
    "cheats": [
      {
        "code": "cheese",
        "desc": "Type at the beginning of the game to show the cursor."
      },
      {
        "code": "salamander",
        "desc": "Type while the timer is ticking to skip a level. You will not receive any points, however. Unlimited use."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=the_buzzer_game"
  },
  "313": {
    "cheats": [
      {
        "code": "kougra",
        "desc": "Type when the level is beginning to skip that level. Your points will be reset to 0. Unlimited use."
      },
      {
        "code": "frumball",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/frumball",
    "jellyNeo": "https://www.jellyneo.net/?go=frumball"
  },
  "314": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hubrids-hero-heist",
    "jellyNeo": "https://www.jellyneo.net/?go=hubrids_hero_heist"
  },
  "315": {
    "avatar": {
      "desc": "Send a score of 800+ points in Mynci Beach Volleyball.",
      "img": "https://images.neopets.com/neoboards/avatars/myncispike.gif",
      "title": "Spike It!"
    },
    "cheats": [
      {
        "code": "dirigibles",
        "desc": "Type during gameplay to make a Kiko balloon fly across the screen. Unlimited use."
      },
      {
        "code": "turdle",
        "desc": "Type during gameplay to get a Turdle on your opponent's side. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/mynci-beach-volleyball",
    "jellyNeo": "https://www.jellyneo.net/?go=mynci_beach_volleyball"
  },
  "330": {
    "avatar": {
      "desc": "Send a score of 900+ points in Gourmet Club Bowls.",
      "img": "https://images.neopets.com/neoboards/avatars/drgrumps.gif",
      "title": "Dr. Grumps"
    },
    "cheats": [
      {
        "code": "shepherd",
        "desc": "Type on the main screen for double the points. Once per game."
      },
      {
        "code": "superbowl",
        "desc": "Type during gameplay to skip the level. Your points will be reset to 0. Unlimited use."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/gourmet-club-bowls",
    "jellyNeo": "https://www.jellyneo.net/?go=gourmet_club_bowls"
  },
  "340": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/skies-over-meridell",
    "jellyNeo": "https://www.jellyneo.net/?go=skies_over_meridell"
  },
  "349": {
    "avatar": {
      "desc": "Send a score of 150,000+ points in Hannah and the Pirate Caves.",
      "img": "https://images.neopets.com/neoboards/avatars/hatpc.gif",
      "title": "Hannah and the Pirate Caves"
    },
    "cheats": [
      {
        "code": "r",
        "desc": "Type during gameplay to restart the level. This also uses up a life (so serves the same function as the restart option)."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hannah-pirate-caves",
    "jellyNeo": "https://www.jellyneo.net/?go=hannah_and_the_pirate_caves"
  },
  "353": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/web-of-vernax",
    "jellyNeo": "https://www.jellyneo.net/?go=web_of_vernax"
  },
  "356": {
    "avatar": {
      "desc": "Send a score of 1,000+ points in Dice Escape.",
      "title": "Dice Escape"
    },
    "cheats": [
      {
        "code": "topdown",
        "desc": "Type during gameplay for a bird's-eye view of the game. (Type again to undo this view.)"
      },
      {
        "code": "moretimeruki",
        "desc": "Type during gameplay to reset the timer. Once per game."
      },
      {
        "code": "helpmeplease",
        "desc": "Type during gameplay to reset the timer. Once per game."
      },
      {
        "code": "flybywire",
        "desc": "Type during gameplay for a \"wire\" view of the game. (Type again to undo this view.)"
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=dice_escape"
  },
  "358": {
    "avatar": {
      "desc": "Send a score of 2,000+ points in Faerie Bubbles.",
      "img": "https://images.neopets.com/neoboards/avatars/faeriebubbles.gif",
      "title": "Faerie Bubbles"
    },
    "cheats": [
      {
        "code": "bubbles",
        "desc": "Type during gameplay to turn all bubbles into one type. Once per game."
      },
      {
        "code": "faerieland",
        "desc": "Type during gameplay to turn the bubble in the cannon into a Rainbow Bubble. Once per game."
      },
      {
        "code": "slumberberry",
        "desc": "Type during gameplay to push the bar up to the top. Once per game."
      },
      {
        "code": "stardust",
        "desc": "Type during gameplay to turn the bubble in the cannon into a Nova Bubble. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/faerie-bubbles",
    "jellyNeo": "https://www.jellyneo.net/?go=faerie_bubbles_flash"
  },
  "359": {
    "cheats": [
      {
        "code": "rainbownegg",
        "desc": "Type during gameplay for a 20 point Rainbow Negg. Once per game."
      },
      {
        "code": "fishnegg",
        "desc": "Type during gameplay for a 50 point Fish Negg. Once per game."
      },
      {
        "code": "marissa",
        "desc": "Type on the screen with \"Press the spacebar to play\" and the text \"Now are you happy?\" will appear. "
      },
      {
        "code": "random letters",
        "desc": "Typing random letters will generate massive blue blobs of jelly."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/jelly-blobs-of-doom",
    "jellyNeo": "https://www.jellyneo.net/?go=jelly_blobs_of_doom"
  },
  "366": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/turmac-roll",
    "jellyNeo": "https://www.jellyneo.net/?go=turmac_roll_flash"
  },
  "367": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/toybox-escape",
    "jellyNeo": "https://www.jellyneo.net/?go=toy_box_escape"
  },
  "368": {
    "cheats": [
      {
        "code": "doughnutfruit",
        "desc": "Type during gameplay to reset the clock. Once per game."
      },
      {
        "code": "pleasegivemeonemillionneopointsthankyouhasees",
        "desc": "Type during game play for a little Easter egg. (It doesn't actually do anything, but \"+1000000\" flashes up on the screen and counts down to zero while Jimmi and Woogi fly around all over the place.)"
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hasee-bounce",
    "jellyNeo": "https://www.jellyneo.net/?go=hasee_bounce_flash"
  },
  "371": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/trouble-national-neopian",
    "jellyNeo": "https://www.jellyneo.net/?go=trouble_at_the_neopian_bank"
  },
  "379": {
    "avatar": {
      "desc": "Send a score of 3,500+ points in Meepit Juice Break.",
      "img": "https://images.neopets.com/neoboards/avatars/ahhhhmeepit.gif",
      "title": "A Meepit! Run!"
    },
    "cheats": [
      {
        "code": "juice-o-matic",
        "desc": "Type during gameplay to reset all of the Meepits' timers. Once per game."
      },
      {
        "code": "meepits",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/meepit-juice-break",
    "jellyNeo": "https://www.jellyneo.net/?go=meepit_juice_break"
  },
  "381": {
    "avatar": {
      "desc": "Send a score of 850+ points in Kass Basher.",
      "img": "https://images.neopets.com/neoboards/avatars/whackedkass.gif",
      "title": "Whack-A-Kass"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/whack-a-kass",
    "jellyNeo": "https://www.jellyneo.net/?go=kass_basher_flash"
  },
  "386": {
    "avatar": {
      "desc": "Send a score of 1,000+ points in Attack of the Slorgs.",
      "title": "Attack of the Slorgs"
    },
    "cheats": [
      {
        "code": "marrow",
        "desc": "Type during gameplay for an extra life. Once per game."
      },
      {
        "code": "chargex4",
        "desc": "Type during gameplay to show the laser. Unlimited use."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=attack_of_the_slorgs"
  },
  "390": {
    "avatar": {
      "desc": "Send a score of 1,250+ points in Freaky Factory.",
      "img": "https://images.neopets.com/neoboards/avatars/ff_yoinked.gif",
      "title": "Freaky Factory - Yoinked"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/freaky-factory",
    "jellyNeo": "https://www.jellyneo.net/?go=freaky_factory"
  },
  "396": {
    "cheats": [
      {
        "code": "To enable cheat codes...",
        "desc": "After selecting the mission's difficulty, press \"up,\" \"right,\" \"up,\" \"right,\" \"up\" using your keyboard arrow keys. Use the \"left\" and \"down\" arrow keys to change the symbols in each of the three spaces. Possible combinations and effects are listed in the \"Codes\" section of our guide."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/mootix-drop",
    "jellyNeo": "https://www.jellyneo.net/?go=mootix_drop"
  },
  "400": {
    "cheats": [
      {
        "code": "empulse",
        "desc": "Type during gameplay to destroy all enemies in a 1-square radius around you. This counts as one turn. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/escape-to-kreludor",
    "jellyNeo": "https://www.jellyneo.net/?go=escape_to_kreludor"
  },
  "404": {
    "cheats": [
      {
        "code": "kreludor",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/kreludan-mining",
    "jellyNeo": "https://www.jellyneo.net/?go=kreludan_mining_corp"
  },
  "412": {
    "avatar": {
      "desc": "Send a score of 5,000+ points in Snowmuncher.",
      "img": "https://images.neopets.com/neoboards/avatars/snowmuncher.gif",
      "title": "Snowmuncher"
    },
    "cheats": [
      {
        "code": "buuuurrrrrrrrp",
        "desc": "(1 B, 4 U's, 8 R's, & 1 P) Type during gameplay to gain 50% health back. Once per game."
      },
      {
        "code": "dieter",
        "desc": "Typing this will multiply your score by 100, but it will not send that amount when you submit your score. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snowmuncher",
    "jellyNeo": "https://www.jellyneo.net/?go=snowmuncher"
  },
  "428": {
    "avatar": {
      "desc": "Send a score of 2,500+ points in Petpetsitter.",
      "img": "https://images.neopets.com/neoboards/avatars/petpetsitter.gif",
      "title": "Petpetsitter"
    },
    "cheats": [
      {
        "code": "oscillabot",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/petpetsitter",
    "jellyNeo": "https://www.jellyneo.net/?go=petpetsitter"
  },
  "430": {
    "cheats": [
      {
        "code": "supercannonball",
        "desc": "Type during gameplay for a massive cannonball. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=castle_battles"
  },
  "444": {
    "cheats": [
      {
        "code": "rampage",
        "desc": "Type during gameplay for an extra life. Once per game."
      },
      {
        "code": "superlaser",
        "desc": "Type during gameplay for double laser range on that level. Once per game."
      },
      {
        "code": "novisitors",
        "desc": "Type during gameplay for an extra 30 seconds. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/moon-rock-rampage",
    "jellyNeo": "https://www.jellyneo.net/?go=moon_rock_rampage"
  },
  "473": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hannah-ice-caves",
    "jellyNeo": "https://www.jellyneo.net/?go=hannah_and_the_ice_caves"
  },
  "489": {
    "cheats": [
      {
        "code": "quaglor",
        "desc": "Type during gameplay to skip to the next level. Your points will be reset to 0. Unlimited use."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/faerie-caves-2",
    "jellyNeo": "https://www.jellyneo.net/?go=faerie_caves_2"
  },
  "500": {
    "avatar": {
      "desc": "Send a score of 1,250+ points in Meerca Chase 2.",
      "img": "https://images.neopets.com/neoboards/avatars/meercachase.gif",
      "title": "Meerca Chase"
    },
    "cheats": [
      {
        "code": "superextrahypergravitymode",
        "desc": "Type on the main screen or during gameplay to unlock a secret mode."
      },
      {
        "code": "ferociousneggsareontheloose",
        "desc": "Type on the main screen to enter ferocious mode. You must have selected \"Hard\" Difficulty first."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/meerca-chase-2",
    "jellyNeo": "https://www.jellyneo.net/?go=meerca_chase_2"
  },
  "507": {
    "avatar": {
      "desc": "Send a score of 14,500+ points in Ice Cream Machine.",
      "img": "https://images.neopets.com/neoboards/avatars/icecreammachine.gif",
      "title": "Ice Cream Machine"
    },
    "cheats": [
      {
        "code": "strawberryvanillachocolate",
        "desc": "Type during the level breaks for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ice-cream-machine",
    "jellyNeo": "https://www.jellyneo.net/?go=ice_cream_machine_flash"
  },
  "519": {
    "cheats": [
      {
        "code": "ineedmoretime",
        "desc": "Type during gameplay for an extra 15 seconds. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/kiko-match-ii",
    "jellyNeo": "https://www.jellyneo.net/?go=kiko_match_2"
  },
  "527": {
    "cheats": [
      {
        "code": "blackpawkeet",
        "desc": "Type during gameplay after finishing level 2 to gain an extra life. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=attack_of_the_revenge"
  },
  "532": {
    "cheats": [
      {
        "code": "r",
        "desc": "Type during gameplay to turn the Pterodactyl radar tracker on or off."
      },
      {
        "code": "bouncebouncebounce",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=bouncy_supreme"
  },
  "536": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/time-tunnel",
    "jellyNeo": "https://www.jellyneo.net/?go=time_tunnel"
  },
  "538": {
    "avatar": {
      "desc": "Send a score of 1,000+ points in Hungry Skeith.",
      "img": "https://images.neopets.com/neoboards/avatars/jellyprocessing.gif",
      "title": "Skeith - Jelly Processing Plant"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hungry-skeith",
    "jellyNeo": "https://www.jellyneo.net/?go=hungry_skeith"
  },
  "539": {
    "avatar": {
      "desc": "Send a score of 1,300+ points in Chia Bomber 2.",
      "img": "https://images.neopets.com/neoboards/avatars/chiabomber.gif",
      "title": "Chia Bomber"
    },
    "cheats": [
      {
        "code": "geoffrey",
        "desc": "Type during gameplay or during level breaks for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/chia-bomber-2",
    "jellyNeo": "https://www.jellyneo.net/?go=chia_bomber_2"
  },
  "540": {
    "avatar": {
      "desc": "Send a score of 3,000+ points in Meepit vs. Feepit.",
      "img": "https://images.neopets.com/neoboards/avatars/meepvsfeep.gif",
      "title": "Meepit Vs Feepit"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/meepit-vs-feepit",
    "jellyNeo": "https://www.jellyneo.net/?go=meepit_vs_feepit"
  },
  "544": {
    "avatar": {
      "desc": "Send a score of 10,000+ points in Snow Wars II.",
      "img": "https://images.neopets.com/neoboards/avatars/grundo_snowthrow.gif",
      "title": "Grundo - Snowthrow!"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snow-wars-2",
    "jellyNeo": "https://www.jellyneo.net/?go=snow_wars_2"
  },
  "552": {
    "cheats": [
      {
        "code": "foreverandeverandever",
        "desc": "Type before you press space bar to begin game to get an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/neverending-boss-battle",
    "jellyNeo": "https://www.jellyneo.net/?go=neverending_boss_battle"
  },
  "553": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/petpet-cannonball",
    "jellyNeo": "https://www.jellyneo.net/?go=petpet_cannonball"
  },
  "562": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/swarm",
    "jellyNeo": "https://www.jellyneo.net/?go=swarm_2"
  },
  "570": {
    "cheats": [
      {
        "code": "deliciousflies",
        "desc": "Type during gameplay for a free life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/flycatcher",
    "jellyNeo": "https://www.jellyneo.net/?go=flycatcher"
  },
  "571": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/magma-blaster",
    "jellyNeo": "https://www.jellyneo.net/?go=magma_blaster"
  },
  "574": {
    "avatar": {
      "desc": "Send a score of 3,600+ points in Typing Terror.",
      "img": "https://images.neopets.com/neoboards/avatars/typingterror.gif",
      "title": "Typing Terror"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/typing-terror",
    "jellyNeo": "https://www.jellyneo.net/?go=typing_terror"
  },
  "575": {
    "cheats": [
      {
        "code": "thelostdesert",
        "desc": "Type during gameplay to reset the timer. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/word-pyramid",
    "jellyNeo": "https://www.jellyneo.net/?go=word_pyramid"
  },
  "585": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/evil-fuzzles",
    "jellyNeo": "https://www.jellyneo.net/?go=evil_fuzzles_from_beyond_the_stars"
  },
  "586": {
    "cheats": [
      {
        "code": "faerie",
        "desc": "Type during gameplay to clear all obstacles. Once per game. Note: If you type this on the 1-player character selection screen and wait a few seconds, you will automatically lose the game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/faerie-cloud-racers-2",
    "jellyNeo": "https://www.jellyneo.net/?go=faerie_cloud_racers"
  },
  "587": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/pterattack",
    "jellyNeo": "https://www.jellyneo.net/?go=pterattack"
  },
  "600": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ruins-rampage",
    "jellyNeo": "https://www.jellyneo.net/?go=ruins_rampage"
  },
  "606": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/tubular-kiko-racing",
    "jellyNeo": "https://www.jellyneo.net/?go=tubular_kiko_racing"
  },
  "614": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ghost-bopper",
    "jellyNeo": "https://www.jellyneo.net/?go=ghost_bopper"
  },
  "615": {
    "cheats": [
      {
        "code": "magicjugglingballs",
        "desc": "Type during gameplay for an extra life. Once per game. "
      },
      {
        "code": "Click on the Drackonack's eye",
        "desc": "Click on the Drackonack's eye to play the secret Drackonack Attack! level."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/jolly-jugglers",
    "jellyNeo": "https://www.jellyneo.net/?go=jolly_jugglers"
  },
  "619": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/jubble-bubble",
    "jellyNeo": "https://www.jellyneo.net/?go=jubble_bubble"
  },
  "627": {
    "cheats": [
      {
        "code": "freetime",
        "desc": "Type during gameplay to pause time. Once per game."
      },
      {
        "code": "gimmeabreak",
        "desc": "Type during gameplay to gain an extra life. Once per game."
      },
      {
        "code": "nomorerocks",
        "desc": "Type during game play to get rid of rocks. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=caves_and_corridors"
  },
  "633": {
    "cheats": [
      {
        "code": "snowghettiandmeatball",
        "desc": "Type during gameplay for 10 extra snowballs. (Most useful when you have less than 40 snowballs.) Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snowball-fight",
    "jellyNeo": "https://www.jellyneo.net/?go=snowball_fight"
  },
  "645": {
    "avatar": {
      "desc": "Send a score of 250+ points in Feed Florg.",
      "img": "https://images.neopets.com/neoboards/avatars/florg.gif",
      "title": "Chia - Florg"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/feed-florg",
    "jellyNeo": "https://www.jellyneo.net/?go=feed_florg"
  },
  "648": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/tyrannian-mini-golf",
    "jellyNeo": "https://www.jellyneo.net/?go=tyrannian_mini_golf"
  },
  "656": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/imperial-exam",
    "jellyNeo": "https://www.jellyneo.net/?go=imperial_exam"
  },
  "659": {
    "cheats": [
      {
        "code": "hungrymeowclops",
        "desc": "Type during gameplay for an extra life. Only works if you have 5 lives or fewer, otherwise it is wasted. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/sophies-stew",
    "jellyNeo": "https://www.jellyneo.net/?go=sophies_stew"
  },
  "660": {
    "cheats": [
      {
        "code": "caperiffic",
        "desc": "Type during gameplay for a time bonus. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/great-qasalan-caper",
    "jellyNeo": "https://www.jellyneo.net/?go=the_great_qasalan_caper"
  },
  "668": {
    "cheats": [
      {
        "code": "gwylsgreatestescapeever",
        "desc": "On the main screen, click 'Continue Game' and type in this phrase to play a secret level."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/gwyls-great-escape",
    "jellyNeo": "https://www.jellyneo.net/?go=gwyls_great_escape"
  },
  "676": {
    "cheats": [
      {
        "code": "frozensnowflake",
        "desc": "Type during gameplay to be able to drop 6 items instead of 5. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/igloo-sale",
    "jellyNeo": "https://www.jellyneo.net/?go=igloo_garage_sale_2_flash"
  },
  "685": {
    "cheats": [
      {
        "code": "delightful",
        "desc": "Type during gameplay to change the current dice into a morph dice. Once per game."
      },
      {
        "code": "explode",
        "desc": "Type during gameplay to change the current gummy dice into a bomb. Once per game."
      },
      {
        "code": "gummydice",
        "desc": "Type during gameplay to change the current gummy dice to a different random colour. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=attack_of_the_gummy_dice"
  },
  "707": {
    "cheats": [
      {
        "code": "cyodrake",
        "desc": "Type during gameplay for an extra hint. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/kou-jong",
    "jellyNeo": "https://www.jellyneo.net/?go=kou_jong"
  },
  "713": {
    "cheats": [
      {
        "code": "pest",
        "desc": "Type during gameplay to restore your Pest-B-Gone to full. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/itchy-invasion",
    "jellyNeo": "https://www.jellyneo.net/?go=itchy_invasion"
  },
  "720": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/eye-of-the-storm",
    "jellyNeo": "https://www.jellyneo.net/?go=eye_of_the_storm"
  },
  "726": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ugga-smash",
    "jellyNeo": "https://www.jellyneo.net/?go=ugga_smash"
  },
  "734": {
    "cheats": [
      {
        "code": "lookoutbruno",
        "desc": "Type during gameplay for an extra life. Once per game."
      },
      {
        "code": "monstermovie",
        "desc": "Type during gameplay to turn the game black and white. Type again to go back to colour."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=brunos_backwoods_breakaway"
  },
  "760": {
    "cheats": [
      {
        "code": "boomshaketheroom",
        "desc": "Type during gameplay to get extra bombs after your next move. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/lab-jellies",
    "jellyNeo": "https://www.jellyneo.net/?go=scourge_of_the_lab_jellies"
  },
  "761": {
    "avatar": {
      "desc": "Send a score of 1,500+ points in Volcano Run II.",
      "img": "https://images.neopets.com/neoboards/avatars/volcanorun.gif",
      "title": "Volcano Run"
    },
    "cheats": [
      {
        "code": "glubgar",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/volcano-run-2",
    "jellyNeo": "https://www.jellyneo.net/?go=volcano_run_ii"
  },
  "763": {
    "avatar": {
      "desc": "Send a score of 3,500+ points in MAGAX: Destroyer II.",
      "img": "https://images.neopets.com/neoboards/avatars/magax.gif",
      "title": "Magax: Destroyer"
    },
    "cheats": [
      {
        "code": "xagam",
        "desc": "Type during gameplay to gain full health. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/magax-destroyer-2",
    "jellyNeo": "https://www.jellyneo.net/?go=magax_destroyer_2"
  },
  "771": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/wingoball-1",
    "jellyNeo": "https://www.jellyneo.net/?go=wingoball"
  },
  "772": {
    "avatar": {
      "desc": "Send a score of 2,500+ points in Dubloon Disaster.",
      "img": "https://images.neopets.com/neoboards/avatars/smuggleddubloon.gif",
      "title": "Smuggler's Dubloon"
    },
    "cheats": [
      {
        "code": "jboogie",
        "desc": "Type on title screen to view the original game's intro."
      },
      {
        "code": "pooltoy",
        "desc": "Type in multiplayer to increase rebound on contact with other players."
      },
      {
        "code": "scallywags",
        "desc": "Type during gameplay to create a whirlpool. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/dubloon-disaster-2",
    "jellyNeo": "https://www.jellyneo.net/?go=dubloon_disaster_2"
  },
  "773": {
    "cheats": [
      {
        "code": "kingaltador",
        "desc": "Type during gameplay for an extra life. Once per game."
      },
      {
        "code": "Click the little, black window in the bottom left corner of the title screen",
        "desc": "Will load a level with structures that spell out \"Weepit was here.\" (It's not much of a level, though.)"
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=crisis_courier"
  },
  "774": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/lost-in-space-fungus",
    "jellyNeo": "https://www.jellyneo.net/?go=lost_in_space_fungus"
  },
  "786": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/shenkuu-warrior",
    "jellyNeo": "https://www.jellyneo.net/?go=shenkuu_warrior"
  },
  "789": {
    "cheats": [
      {
        "code": "lumiwatergun",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/usul-suspects",
    "jellyNeo": "https://www.jellyneo.net/?go=the_usul_suspects"
  },
  "794": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/revel-roundup",
    "jellyNeo": "https://www.jellyneo.net/?go=revel_roundup"
  },
  "796": {
    "jellyNeo": "https://www.jellyneo.net/?go=cooty_wars"
  },
  "799": {
    "jellyNeo": "https://www.jellyneo.net/?go=bumble_beams"
  },
  "801": {
    "avatar": {
      "desc": "Awarded if you are in the top 50 on the high score table for Korbat's Lab when trophies are awarded daily.",
      "img": "https://images.neopets.com/neoboards/avatars/freakedkorbat.gif",
      "title": "Freaked Korbat"
    },
    "cheats": [
      {
        "code": "spiderbite",
        "desc": "Type during gameplay for an extra life. Once per game."
      },
      {
        "code": "skip",
        "desc": "Type during gameplay to skip a level. You will keep any points you have obtained so far. Unlimited use."
      },
      {
        "code": "destroy",
        "desc": "Type during gameplay to launch multiple balls. Once per game."
      },
      {
        "code": "monstermovie",
        "desc": "Type during gameplay to turn the game black and white. Type again to go back to colour."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/korbats-lab",
    "jellyNeo": "https://www.jellyneo.net/?go=korbats_lab"
  },
  "805": {
    "jellyNeo": "https://www.jellyneo.net/?go=fashion_fever_flash"
  },
  "818": {
    "cheats": [
      {
        "code": "gogobananas",
        "desc": "Type during gameplay to hear some creepy, maniacal laughter. No effect on gameplay. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snowbeast-snackrifice",
    "jellyNeo": "https://www.jellyneo.net/?go=snowbeast_snackrifice"
  },
  "820": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/roodoku-user",
    "jellyNeo": "https://www.jellyneo.net/?go=roodoku"
  },
  "821": {
    "cheats": [
      {
        "code": "edmoretime",
        "desc": "Type during gameplay to add 25 seconds to the timer. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ednas-shadow",
    "jellyNeo": "https://www.jellyneo.net/?go=ednas_shadow"
  },
  "830": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/the-great-desert-race",
    "jellyNeo": "https://www.jellyneo.net/?go=great_desert_race"
  },
  "831": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/neoquest-3d",
    "jellyNeo": "https://www.jellyneo.net/?go=neoquest_3d"
  },
  "852": {
    "avatar": {
      "desc": "Send a score of 1,200+ points in Stowaway Sting.",
      "img": "https://images.neopets.com/neoboards/avatars/deckswabber.gif",
      "title": "Deckswabber"
    },
    "cheats": [
      {
        "code": "scrap",
        "desc": "Type during gameplay to gain full health. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/stowaway-sting",
    "jellyNeo": "https://www.jellyneo.net/?go=stowaway_sting"
  },
  "874": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/the-search-for-princess-lunara",
    "jellyNeo": "https://www.jellyneo.net/?go=search_for_lunara"
  },
  "881": {
    "cheats": [
      {
        "code": "wocky",
        "desc": "Type during gameplay when you have at least four items and a Buzzer will drop down and freeze your stack for a few seconds, provided he lands on your stack. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/wicked-wocky-wobble",
    "jellyNeo": "https://www.jellyneo.net/?go=wicked_wocky_wobble"
  },
  "884": {
    "cheats": [
      {
        "code": "Navigate to the top right corner room and move in front of the computer. While holding down on the up arrow key, press the space bar.",
        "desc": "A Ballerina Usuki will appear somewhere randomly in the room. Worth 16 points if you collect it. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/usuki-frenzy-2",
    "jellyNeo": "https://www.jellyneo.net/?go=usuki_frenzy_2"
  },
  "885": {
    "avatar": {
      "desc": "Awarded if you are in the top 50 on the high score table for Maths Nightmare when trophies are awarded daily.",
      "img": "https://images.neopets.com/neoboards/avatars/mathsbabaa.gif",
      "title": "Babaa - Maths Nightmare"
    },
    "cheats": [
      {
        "code": "letimiyasleep",
        "desc": "Type during gameplay to reset the clock. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/maths-nightmare",
    "jellyNeo": "https://www.jellyneo.net/?go=maths_nightmare"
  },
  "887": {
    "avatar": {
      "desc": "Send a score of 8,500+ points in Goparokko.",
      "img": "https://images.neopets.com/neoboards/avatars/goparokko.gif",
      "title": "Goparokko"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/goparokko",
    "jellyNeo": "https://www.jellyneo.net/?go=goparokko"
  },
  "895": {
    "jellyNeo": "https://www.jellyneo.net/?go=darblat"
  },
  "902": {
    "avatar": {
      "desc": "Send a score of 725+ points in Carnival of Terror.",
      "title": "Carnival of Terror"
    },
    "cheats": [
      {
        "code": "piecrust",
        "desc": "Type during gameplay to fully restore ammo. Once per game."
      },
      {
        "code": "custard",
        "desc": "Type during gameplay to fully restore health. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=carnival_of_terror"
  },
  "903": {
    "avatar": {
      "desc": "Send a score of 100+ points in Ultimate Bullseye II.",
      "img": "https://images.neopets.com/neoboards/avatars/bullseye.gif",
      "title": "Turtum"
    },
    "cheats": [
      {
        "code": "catapult",
        "desc": "Type during gameplay for a free power up. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ultimate-bullseye-2",
    "jellyNeo": "https://www.jellyneo.net/?go=ultimate_bullseye_2"
  },
  "904": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/mop-n-bop",
    "jellyNeo": "https://www.jellyneo.net/?go=mop_n_bop"
  },
  "909": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/tug-o-war",
    "jellyNeo": "https://www.jellyneo.net/?go=tug_o_war_2"
  },
  "927": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/whirlpool",
    "jellyNeo": "https://www.jellyneo.net/?go=whirlpool"
  },
  "933": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/smug-bug-smite",
    "jellyNeo": "https://www.jellyneo.net/?go=smug_bug_smite"
  },
  "934": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ready-to-roll",
    "jellyNeo": "https://www.jellyneo.net/?go=ready_to_roll"
  },
  "941": {
    "cheats": [
      {
        "code": "recon",
        "desc": "Type during gameplay to reveal the attack path. Unlimited use."
      },
      {
        "code": "retreat",
        "desc": "Type during gameplay to reveal the return path. Unlimited use."
      },
      {
        "code": "removedebris",
        "desc": "Type during gameplay to remove the debris on the field. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=biscuit_brigade"
  },
  "962": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/dungeon-dash",
    "jellyNeo": "https://www.jellyneo.net/?go=dungeon_dash"
  },
  "964": {
    "avatar": {
      "desc": "Send a score of 13,500+ points in Spacerocked!.",
      "img": "https://images.neopets.com/neoboards/avatars/spacerocked.gif",
      "title": "Spacerocked!"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/spacerocked",
    "jellyNeo": "https://www.jellyneo.net/?go=spacerocked"
  },
  "965": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hotdog-hero",
    "jellyNeo": "https://www.jellyneo.net/?go=hot_dog_hero"
  },
  "968": {
    "jellyNeo": "https://www.jellyneo.net/?go=berry_bash"
  },
  "970": {
    "cheats": [
      {
        "code": "stalactites",
        "desc": "Type during gameplay for an extra life. Once per game."
      }
    ],
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/let-it-slide",
    "jellyNeo": "https://www.jellyneo.net/?go=let_it_slide"
  },
  "973": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/piper-panic",
    "jellyNeo": "https://www.jellyneo.net/?go=piper_panic"
  },
  "987": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/200m-peanut-dash-2",
    "jellyNeo": "https://www.jellyneo.net/?go=200m_peanut_dash"
  },
  "999": {
    "avatar": {
      "desc": "Send a score of 2,500+ points in Destruct-O-Match III.",
      "title": "Destruct-O-Match II"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=destruct_o_match_3_flash"
  },
  "1000": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/techo-says",
    "jellyNeo": "https://www.jellyneo.net/?go=techo_says"
  },
  "1026": {
    "jellyNeo": "https://www.jellyneo.net/?go=barf_boat"
  },
  "1031": {
    "cheats": [
      {
        "code": "ineedmoretime",
        "desc": "Type during gameplay for an extra 15 seconds. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=petpet_pair_up"
  },
  "1034": {
    "jellyNeo": "https://www.jellyneo.net/?go=catch_the_petpet"
  },
  "1042": {
    "avatar": {
      "desc": "Send a score of 2,250+ points in Mutant Graveyard of Doom II.",
      "img": "https://images.neopets.com/neoboards/avatars/mutantgravedoom.gif",
      "title": "Mutant Graveyard of Doom II"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/mutant-graveyard-doom",
    "jellyNeo": "https://www.jellyneo.net/?go=mutant_graveyard_of_doom_ii"
  },
  "1048": {
    "avatar": {
      "desc": "Send a score of 4,000+ points in Nimmos Pond.",
      "img": "https://images.neopets.com/neoboards/avatars/nimmospond.gif",
      "title": "Nimmos Pond"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/nimmos-pond-2",
    "jellyNeo": "https://www.jellyneo.net/?go=nimmos_pond"
  },
  "1061": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/super-hasee-bounce",
    "jellyNeo": "https://www.jellyneo.net/?go=super_hasee_bounce"
  },
  "1064": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/jungle-raiders",
    "jellyNeo": "https://www.jellyneo.net/?go=jungle_raiders"
  },
  "1069": {
    "jellyNeo": "https://www.jellyneo.net/?go=nc_shopping_race"
  },
  "1075": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/shenkuu-tangram",
    "jellyNeo": "https://www.jellyneo.net/?go=shenkuu_tangram"
  },
  "1076": {
    "avatar": {
      "desc": "Send a score of 6,500+ points in Snow Roller.",
      "img": "https://images.neopets.com/neoboards/avatars/snowroller.gif",
      "title": "Snowroller"
    },
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snow-roller",
    "jellyNeo": "https://www.jellyneo.net/?go=snow_roller"
  },
  "1078": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/petpet-plunge",
    "jellyNeo": "https://www.jellyneo.net/?go=petpet_plunge"
  },
  "1080": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/wheelers-ride",
    "jellyNeo": "https://www.jellyneo.net/?go=wheelers_wild_ride"
  },
  "1095": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/top-chop",
    "jellyNeo": "https://www.jellyneo.net/?go=top_chop"
  },
  "1099": {
    "jellyNeo": "https://www.jellyneo.net/?go=black_pawkeet_slots"
  },
  "1100": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/snot-splatter",
    "jellyNeo": "https://www.jellyneo.net/?go=snot_splatter"
  },
  "1108": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/lost-city-lanes",
    "jellyNeo": "https://www.jellyneo.net/?go=lost_city_lanes"
  },
  "1117": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/extreme-herder-two",
    "jellyNeo": "https://www.jellyneo.net/?go=extreme_herder_2"
  },
  "1118": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/legendsofpinball",
    "jellyNeo": "https://www.jellyneo.net/?go=legends_of_pinball"
  },
  "1121": {
    "jellyNeo": "https://www.jellyneo.net/?go=brucey_b_slots"
  },
  "1126": {
    "jellyNeo": "https://www.jellyneo.net/?go=dice_of_destiny"
  },
  "1134": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/spinacles",
    "jellyNeo": "https://www.jellyneo.net/?go=spinacles"
  },
  "1139": {
    "jellyNeo": "https://www.jellyneo.net/?go=darigan_dodgeball"
  },
  "1146": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/slorgs-in-space",
    "jellyNeo": "https://www.jellyneo.net/?go=slorgs_in_space"
  },
  "1148": {
    "jellyNeo": "https://www.jellyneo.net/?go=chariot_chase"
  },
  "1149": {
    "jellyNeo": "https://www.jellyneo.net/?go=cloud_raiders"
  },
  "1155": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/extreme-faerie-cloud-racers",
    "jellyNeo": "https://www.jellyneo.net/?go=extreme_faerie_cloud_racers"
  },
  "1156": {
    "jellyNeo": "https://www.jellyneo.net/?go=cave_glider"
  },
  "1157": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/spellseeker",
    "jellyNeo": "https://www.jellyneo.net/?go=spellseeker"
  },
  "1172": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/clara-on-ice",
    "jellyNeo": "https://www.jellyneo.net/?go=clara_on_ice"
  },
  "1173": {
    "jellyNeo": "https://www.jellyneo.net/?go=clockwork_codebreaker"
  },
  "1175": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/tunnel-tumble",
    "jellyNeo": "https://www.jellyneo.net/?go=tunnel_tumble"
  },
  "1177": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/moltara-run",
    "jellyNeo": "https://www.jellyneo.net/?go=moltara_run"
  },
  "1182": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/dueling-decks",
    "jellyNeo": "https://www.jellyneo.net/?go=dueling_decks"
  },
  "1189": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/kookia",
    "jellyNeo": "https://www.jellyneo.net/?go=kookia"
  },
  "1191": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/jumpin-gem-heist",
    "jellyNeo": "https://www.jellyneo.net/?go=jumpin_gem_heist"
  },
  "1202": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/sorcerers-skirmish",
    "jellyNeo": "https://www.jellyneo.net/?go=sorcerers_skirmish"
  },
  "1204": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/ugga-drop",
    "jellyNeo": "https://www.jellyneo.net/?go=ugga_drop"
  },
  "1205": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/chef-academy",
    "jellyNeo": "https://www.jellyneo.net/?go=island_chef_academy"
  },
  "1221": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/battlefield-legends",
    "jellyNeo": "https://www.jellyneo.net/?go=neopian_battlefield_legends"
  },
  "1223": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/nova-defender",
    "jellyNeo": "https://www.jellyneo.net/?go=nova_defender"
  },
  "1229": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hannah-wardrobe-adventure",
    "jellyNeo": "https://www.jellyneo.net/?go=hannah_and_the_wardrobe_of_adventure"
  },
  "1252": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/hannah-kreludor-caves",
    "jellyNeo": "https://www.jellyneo.net/?go=hannah_and_the_kreludor_caves"
  },
  "1266": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/shenkuu-warrior-ii",
    "jellyNeo": "https://www.jellyneo.net/?go=shenkuu_warrior_2"
  },
  "1269": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/wrath-snowager",
    "jellyNeo": "https://www.jellyneo.net/?go=wrath_of_the_snowager"
  },
  "1292": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/smelt",
    "jellyNeo": "https://www.jellyneo.net/?go=smelt"
  },
  "1310": {
    "jellyNeo": "https://www.jellyneo.net/?go=kass_basher"
  },
  "1330": {
    "dailyNeopets": "https://thedailyneopets.com/neopets-games/invasion-blastoids",
    "jellyNeo": "https://www.jellyneo.net/?go=invasion_blastoids"
  },
  "1347": {
    "avatar": {
      "desc": "Send a score of 20,000+ points in Assignment 53.",
      "title": "A53 - LIKE A BOSS"
    },
    "cheats": [
      {
        "code": "Up, Up, Down, Down, Left, Right, Left, Right",
        "desc": "Input on the main menu using the arrow keys for an extra life."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=assignment_53"
  },
  "1370": {
    "jellyNeo": "https://www.jellyneo.net/?go=coal_war_tactics"
  },
  "1375": {
    "avatar": {
      "desc": "Send a score of 1,000+ points in AAA's Revenge. Note: This avatar is currently not being awarded.",
      "title": "Aaa's Revenge"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=aaa_revenge"
  },
  "1389": {
    "jellyNeo": "https://www.jellyneo.net/?go=igloo_garage_sale_2"
  },
  "1390": {
    "avatar": {
      "desc": "Send a score of 14,500+ points in Ice Cream Machine.",
      "title": "Ice Cream Machine"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=ice_cream_machine"
  },
  "1391": {
    "jellyNeo": "https://www.jellyneo.net/?go=fashion_fever"
  },
  "1392": {
    "jellyNeo": "https://www.jellyneo.net/?go=turmac_roll"
  },
  "1393": {
    "jellyNeo": "https://www.jellyneo.net/?go=hasee_bounce"
  },
  "1395": {
    "avatar": {
      "desc": "Send a score of 2,000+ points in Faerie Bubbles.",
      "title": "Faerie Bubbles"
    },
    "cheats": [
      {
        "code": "bubbles",
        "desc": "Type during gameplay to turn all bubbles into one type. Once per game."
      },
      {
        "code": "faerieland",
        "desc": "Type during gameplay to turn the bubble in the cannon into a Rainbow Bubble. Once per game."
      },
      {
        "code": "slumberberry",
        "desc": "Type during gameplay to push the bar up to the top. Once per game."
      },
      {
        "code": "stardust",
        "desc": "Type during gameplay to turn the bubble in the cannon into a Nova Bubble. Once per game."
      }
    ],
    "jellyNeo": "https://www.jellyneo.net/?go=faerie_bubbles"
  },
  "1397": {
    "avatar": {
      "desc": "Send a score of 2,500+ points in Destruct-O-Match III.",
      "title": "Destruct-O-Match II"
    },
    "jellyNeo": "https://www.jellyneo.net/?go=destruct_o_match_3"
  },
  "1399": {
    "jellyNeo": "https://www.jellyneo.net/?go=make_some_noise"
  },
  "1400": {
    "jellyNeo": "https://www.jellyneo.net/?go=shootout_showdown"
  },
  "1404": {
    "jellyNeo": "https://www.jellyneo.net/?go=slushie_slinger"
  },
  "1405": {
    "jellyNeo": "https://www.jellyneo.net/?go=yooyuball"
  }
};

(function() {
    'use strict';
    init();
})();
