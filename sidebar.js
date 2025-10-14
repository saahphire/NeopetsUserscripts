// ==UserScript==
// @name         Neopets: Sidebar
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      0.1.0
// @description  Adds a very customizable sidebar with icons and links of your choice to every page in Neopets
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/testing/sidebar.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/testing/sidebar.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://cdn.jsdelivr.net/npm/lil-gui@0.20
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds a sidebar to every page in Neopets that has a header (so, excluding pet pages, error pages, and glitch pages)
    - Adds a Settings button to the sidebar, allowing you to customize its appearance and add buttons to it
    - Allows you to choose any url or valid CSS image as the background image, as well as your Neopets theme's image
    - Allows you to use multiple background images (or their sources), separated by a comma and space (", "). The first
      image is at the bottom layer, the last image is at the top. The background at the very bottom comes from your
      Neopets theme. If you want it to be the only background, leave Background Images empty.
    - Validates your URL, adding "https://www.neopets.com/" in front of your relative URLs. You shouldn't be using them!
      They break in the NC mall and premium pages! This attempts to convert them to absolute URLs.
    - Allows you to leave the URL blank to make the "button" act as a divider instead. It'll no longer link anywhere,
      and can have a different color and opacity.
    - Allows you to pick an Iconify icon for each button. You can browse their collection of over 200,000 open source
      icons here: https://icon-sets.iconify.design/ (FontAwesome is obsolete paywalled bloatware)
    - Allows you to pick the maximum icon size for icons, but note that since evrything, including icon spacing, is
      based on that size, increasing it when you have too many icons will make the icons smaller (!)
    - Allows you to drag and drop buttons in the Settings window to adjust their order in real time

    In the beta layout, the sidebar is behind the header. When you open the settings, the sidebar moves to the front.
    This is not a bug. I wanted the settings backdrop to be in front of the header, but I also wanted the sidebar to be
    in front of the settings backdrop, so I had to pick and I was like, no! I want both!

    This requires two external libraries. I'm sorry, but I didn't want to reinvent the wheel when making a GUI, and you
    can't pay me to create a drag-and-drop feature from scratch. But you can pay them!
      https://opencollective.com/Sortable

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// First value is the minimum allowed amount, second is the maximum, and third is by how much the slider can increase.
// These are highly opinionated and you can change them as you see fit.
const widthValues = {
  em: [0.1, 10, 0.1],
  rem: [0.1, 10, 0.1],
  px: [24, 250, 1],
  vh: [4, 20, 1],
  vw: [2, 20, 1]
}

const getDefaultSettings = () => {
  const defaultSettings = {};
  settings.forEach(setting => defaultSettings[setting.key] = setting.defaultValue);
  return defaultSettings;
}

const saveSettings = (savedGui) => {
  const settingsToSave = {};
  settings.forEach(setting => {
    settingsToSave[setting.key] = savedGui.folders[setting.folder].controllers[setting.name];
  });
  GM.setValue("settings", settingsToSave);
};

const createController = (controllerData, currentSettings, folder) => {
  if(controllerData.key === "width") {
      const [min, max, step] = widthValues[currentSettings.unit];
      return folder.add(currentSettings, "width", min, max, step).name(controllerData.name);
  }
  const controller = (controllerData.kind === "Color") ?
    folder.addColor(currentSettings, controllerData.key).name(controllerData.name) :
    folder.add(currentSettings, controllerData.key).options(controllerData.options).min(controllerData.min).max(controllerData.max).step(controllerData.step);
  return controller.name(controllerData.name);
}

const onUnitChange = (v, widthController) => {
  const [min, max, step] = widthValues[v];
  const newWidth = Math.min(Math.max(Math.round(widthController.getValue() / step) * step, min), max);
  widthController.setValue(newWidth).min(min).max(max).step(step);
}

const createSettingsFolder = (folderName, folder, currentSettings) => {
  const controls = {};
  settings.filter(setting => setting.folder === folderName).forEach(setting => {
    controls[setting.key] = createController(setting, currentSettings, folder);
  });
  controls.unit?.onChange((v) => onUnitChange(v, controls.width));
  return controls;
}

const createSettings = async (currentSettings) => {
  document.body.insertAdjacentHTML("beforeEnd", modal);
  // eslint-disable-next-line no-undef
  const gui = new lil.GUI({
    container: document.getElementsByClassName("sb544h-modal-wrapper")[0],
    closeFolders: true
  });
  const folders = {};
  ["Appearance", "Behavior"].forEach(folder => {
    folders[folder] = createSettingsFolder(folder, gui.addFolder(folder), currentSettings)
  });
  gui.onChange(() => {
    saveSettings(gui.save());
    createSidebar();
  });
  saveSettings(gui.save());
  createButtonSettings(gui);
};

const saveButtons = async (gui) => {
  const buttonData = gui.save().folders.Buttons.folders;
  const buttonsDom = [...gui.folders[2].domElement.querySelectorAll(".children > .lil-gui")];
  console.log(buttonData);
  console.log(buttonsDom);
  const buttons = [];
  Object.entries(buttonData).forEach(([title, btn]) => {
    const button = btn.controllers;
    const position = buttonsDom.find(b => b.getElementsByTagName("button")[0].textContent === title).dataset.sb544hposition;
    buttons.push({
      id: button.id,
      name: button.Name,
      url: button.URL,
      icon: button["Iconify Icon Name"],
      pos: parseInt(position),
      newTab: button["Open in new tab"],
    });
  });
  GM.setValue("buttons", buttons.sort((a, b) => a.pos - b.pos)).then(() => createSidebar());
};

const generateButtonName = async (name, id) => {
  const allButtons = await GM.getValue("buttons", []);
  if(!allButtons.find(btn => btn.name === name && btn.id !== id)) return name;
  let suffix = 1;
  while (allButtons.find((btn) => btn.name === `${name} ${suffix}`)) {
    suffix++;
  }
  return `${name} ${suffix}`;
}

const createNewButtonData = async (name, position) => {
  const id = (await GM.getValue("id", -1)) + 1;
  GM.setValue("id", id);
  return {
    id: id,
    name: name,
    url: "https://www.neopets.com/home",
    icon: "famicons:paw-outline",
    pos: position,
    newTab: (await GM.getValue("settings", getDefaultSettings())).newTabIsDefault
  };
}

const validateUrl = (url, control) => {
  if(url.startsWith("https://")) return;
  control.setValue(url.replace(/^\/(.+)/, "https://www.neopets.com/$1"));
}

const makeButtonsDraggable = (buttonFolder, gui) => {
// eslint-disable-next-line no-undef
  Sortable.create(buttonFolder.domElement.querySelector(".children"), {
    draggable: ".lil-gui",
    direction: "vertical",
    onChange: () => {
      for(let i = 0; i < buttonFolder.domElement.querySelectorAll(".children > .lil-gui").length; i++) {
        buttonFolder.domElement.querySelector(`.children > .lil-gui:nth-child(${i + 4})`).dataset.sb544hposition = i;
      }
      saveButtons(gui);
      createSidebar();
    }
  });
}

const createButtonInSettings = (buttonData, parentFolder, gui) => {
  const buttonFolder = parentFolder.addFolder(buttonData.name);
  buttonFolder.add(buttonData, "id").disable().hide();
  const button = buttonFolder
    .add(buttonData, "name")
    .name("Name")
    .onFinishChange(async (value) => {
      const newValue = await generateButtonName(value, buttonData.id);
      if(newValue !== value) button.setValue(newValue);
      buttonFolder.title(newValue);
    });
  const url = buttonFolder.add(buttonData, "url").name("URL").onChange(v => validateUrl(v, url));
  buttonFolder.add(buttonData, "icon").name("Iconify Icon Name");
  buttonFolder.add(buttonData, "newTab").name("Open in new tab");
  buttonFolder.domElement.dataset.sb544hposition = buttonData.pos;
    const del = {
      delete: () => deleteButton(buttonData.id, buttonData.name, gui, parentFolder),
    };
    buttonFolder.add(del, "delete").name("🗑️").domElement.classList.add("sb544h-delete-question");
  return buttonFolder;
}

const deleteButton = async (id, buttonName, gui, folder) => {
  const confirm = (await GM.getValue("settings", getDefaultSettings())).confirmOnDeletion;
  if(confirm) window.confirm(`Are you sure you want to delete "${buttonName}"?`);
  const allButtons = (await GM.getValue("buttons", [])).filter(
    (btn) => btn.id !== id,
  );
  GM.setValue("buttons", allButtons.sort((a, b) => a.pos - b.pos));
  createButtonSettings(gui, folder);
};

const addButton = async (button, folder, gui) => {
  const allButtons = await GM.getValue("buttons", []);
  const position = button?.pos ?? allButtons[allButtons.length - 1].pos + 1;
  const name = await generateButtonName(button?.name ?? "New Button");
  const buttonData = button ?? await createNewButtonData(name, position);
  const btn = createButtonInSettings(buttonData, folder, gui);
  if(button) btn.close();
  if(!button) saveButtons(gui);
};

const createButtonSettings = async (gui, buttonsFolder) => {
  if (buttonsFolder) buttonsFolder.destroy();
  const folder = gui.addFolder("Buttons");
  const add = { addButton: () => addButton(null, folder, gui) };
  folder.add(add, "addButton").name("➕ Add Button");
  folder.add(add, "addButton").name("➕ Add Button").domElement.classList.add("sb544h-flex-last");
  folder.domElement.getElementsByClassName("children")[0].insertAdjacentHTML("afterBegin", iconifyText);
  const buttons = await GM.getValue("buttons", []);
  buttons.forEach((button) => addButton(button, folder, gui));
  folder.onChange(() => saveButtons(gui));
  makeButtonsDraggable(folder, gui);
};

const createButton = async (buttonData) => {
  const button = document.createElement(buttonData.url && buttonData.url !== "" ? "a" : "hr");
  const split = buttonData.icon.split(":");
  if (split.length === 2)
    button.classList.add(
      `sb544h-${split[0]}-${split[1]}`,
      `sb544h-${split[0]}`,
    );
  else console.warn(`${button.icon} isn't a valid Iconify icon!`);
  if(buttonData.url && buttonData.url !== "") button.href = buttonData.url;
  button.title = buttonData.name;
  if (buttonData.newTab) button.target = "_blank";
  return button;
};

const addSettingsButton = () => {
  const open = document.createElement("label");
  open.for = "sb544h-toggle-settings";
  open.classList.add("sb544h-open-settings");
  open.ariaLabel = "Open settings";
  open.htmlFor = "sb544h-toggle-settings";
  return open;
};

const createSidebar = async () => {
  const backgroundElement = getElement(
    "#navtop__2020",
    "#ban"
  );
  if(!backgroundElement) return false;
  getIcons();
  applyStyle(backgroundElement);
  document.getElementsByClassName("sb544h-sidebar")[0]?.remove();
  document.getElementsByClassName("sb544h-sidebar-bg")[0]?.remove();
  const bg = document.createElement("div");
  bg.ariaHidden = true;
  bg.classList.add("sb544h-sidebar-bg");
  const sidebar = document.createElement("aside");
  sidebar.classList.add("sb544h-sidebar");
  document.body.prepend(sidebar);
  document.body.prepend(bg);
  const buttons = await GM.getValue("buttons", []);
  buttons
    .sort((a, b) => a.pos - b.pos)
    .forEach(async (buttonData) => sidebar.appendChild(await createButton(buttonData)));
  sidebar.appendChild(addSettingsButton());
  return true;
};

const getElement = (...names) => {
  for (let i = 0; i < names.length; i++) {
    const element = document.querySelector(names[i]);
    if (element) return element;
  }
};

const fetchIconSet = async (iconSet, icons) => {
  const response = await fetch(`https://api.iconify.design/${iconSet}.css?selector=.sb544h-{prefix}-{name}&common=.sb544h-{prefix}&mode=mask&format=compressed&icons=${icons.join(",")}`);
  const css = await response.text();
  return css;
}

const getFetchableIconSets = async () => {
  const buttons = await GM.getValue("buttons", []);
  return buttons.map((button) => button.icon.split(":"))
    .reduce((agg, curr) => {
      if (curr.length !== 2) return agg;
      agg[curr[0]] = agg[curr[0]] ? agg[curr[0]].concat([curr[1]]) : [curr[1]];
      return agg;
    }, {});
}

const buildIconCache = async () => {
  const iconSets = await getFetchableIconSets();
  const cache = await GM.getValue("cached", {});
  Object.keys(cache)
    .filter((set) => !Object.keys(iconSets).includes(set))
    .forEach((key) => delete cache[key]);
  const results = await Promise.all(
    Object.entries(iconSets)
      .filter(([set, icons]) => {
        const found = cache[set];
        return !found || icons.some((icon) => !found.iconList.includes(icon));
      })
      .map(
        ([set, icons]) =>
          new Promise((resolve) => {
            fetchIconSet(set, icons).then(css => resolve([set, {iconList: icons, css: css}]));
          }),
      ),
  );
  const newCache = { ...cache, ...Object.fromEntries(results) };
  GM.setValue("cached", newCache);
  return newCache;
};

const getIcons = async () => {
  const newCache = await buildIconCache();
  if (!newCache || Object.values(newCache).length === 0) return;
  const style = document.createElement("style");
  style.innerHTML = Object.values(newCache)
    .map((v) => v.css)
    .join("");
  document.getElementById("sb544h-style-icons")?.remove();
  style.id = "sb544h-style-icons";
  document.head.appendChild(style);
}

const getUserBackgroundImage = (bg) => {
  if(bg === "") return [];
  const regex = new RegExp(/((?:(?:url|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient|element|image|cross-fade|image-set)\([^)]+\))|(?:[^(, ]+))/, "g");
  return bg.match(regex).map(b => b.includes("(") ? b : `url('${b}')`).reverse();
}

const getNeoBackgroundImage = (backgroundElement) => {
  const themeBackgroundImage = window.getComputedStyle(backgroundElement).backgroundImage;
  const themePattern = [...document.getElementsByClassName("nav-top-pattern__2020")].map(pattern => window.getComputedStyle(pattern).backgroundImage);
  return [themeBackgroundImage].concat(themePattern).reverse();
}

const applyStyle = async (backgroundElement) => {
  const style = await GM.getValue("settings", getDefaultSettings());
  const topBar = window.getComputedStyle(backgroundElement).height;
  document.head.querySelectorAll(".sb544h-sidebar-style").forEach(oldStyle => oldStyle.remove());
  const el = document.createElement("style");
  const userBackground = getUserBackgroundImage(style.bg).join(", ");
  document.head.appendChild(el);
  el.classList.add("sb544h-sidebar-style");
  const autoProps = settings.map(setting => setting.css ? Object.entries(setting.css).map(([propName, valFunc]) => `--sb544h-${propName}: ${valFunc(style[setting.key])};`).join("\n") : "").join("\n");
  const cssVars = `
  :root {
    --sb544h-top-bar: ${topBar};
    --sb544h-width: ${style.width}${style.unit};
    --sb544h-neo-bg-image: ${getNeoBackgroundImage(backgroundElement).join(", ")};
    --sb544h-user-bg-image: ${userBackground === "" ? "none" : userBackground};
    --sb544h-border: 2px solid oklch(from var(--sb544h-border-color) l c h / var(--sb544h-border-opacity));
    --sb544h-modal-margin: calc(var(--sb544h-width) * ${style.iconSize}px);
    ${autoProps}
  }
  `;
  
  el.innerHTML = `${cssVars}
  ${css}`;
};

const css = `
  body:has(#navtop__2020) .sb544h-sidebar {
    margin-top: var(--sb544h-top-bar);
    height: calc(100vh - var(--sb544h-top-bar));
    z-index: 96;
  }

  body:has(#navtop__2020) .sb544h-sidebar-bg {
    z-index: 96;
  }

  body:has(#sb544h-toggle-settings:checked) {
    overflow: hidden;
  }

  .lil-gui .children {
    display: flex;
    flex-direction: column;
    overscroll-behavior: none;
  }

  .sb544h-flex-last {
    order: 9999999;
  }

  .sb544h-delete-question::before {
    min-width: var(--name-width);
    display: inline-block;
    content: "Delete?";
  }
  
  .sb544h-sidebar {
    font-size: var(--sb544h-icon-size);
    width: var(--sb544h-width);
    height: 100vh;
    padding: 3.5em 0 1em;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: var(--sb544h-left);
    right: var(--sb544h-right);
    display: flex;
    flex-direction: column;
    justify-content: var(--sb544h-justify);
    align-items: center;
    gap: 1em;
    z-index: 101;
    border-left: var(--sb544h-border-left);
    border-right: var(--sb544h-border-right);
  }

  body:has(#sb544h-toggle-settings:checked) :is(.sb544h-sidebar, .sb544h-sidebar-bg) {
    z-index: 9001;
  }

  .sb544h-sidebar-bg {
    position: fixed;
    top: 0;
    z-index: 101;
    width: var(--sb544h-width);
    height: 100vh;
    right: var(--sb544h-right);
    left: var(--sb544h-left);
    font-size: var(--sb544h-icon-size);
  }

  .sb544h-sidebar-bg::before {
    content: '';
    display: block;
    position: relative;
    top: 0;
    background: var(--sb544h-neo-bg-image);
    height: var(--sb544h-width);
    width: 100vh;
    transform: rotate(-90deg) translate(calc((var(--sb544h-width) - 100vh) / 2), calc((var(--sb544h-width) - 100vh) / 2));
    background-repeat: repeat;
  }

  .sb544h-sidebar-bg::after {
    content: '';
    display: block;
    position: relative;
    top: calc(-1 * var(--sb544h-width));
    height: 100vh;
    width: var(--sb544h-width);
    background: var(--sb544h-user-bg-image);
    background-size: var(--sb544h-bg-size);
    background-repeat: var(--sb544h-bg-repeat);
  }

  .sb544h-sidebar :is(a, label, hr) {
    width: 1.5em;
    height: 1.5em;
    margin: 0;
  }

  .sb544h-sidebar :is(a, label) {
    color: oklch(from var(--sb544h-icon-color) l c h / var(--sb544h-icon-opacity));
  }

  .sb544h-sidebar hr {
    color: oklch(from var(--sb544h-hr-color) l c h / var(--sb544h-hr-opacity));
  }

  .sb544h-sidebar label {
    position: absolute;
    top: 1em;
  }

  .sb544h-sidebar :is(a, label):hover {
    color: oklch(from var(--sb544h-icon-hover-color) l c h / var(--sb544h-icon-hover-opacity));
  }

  .sb544h-open-settings {
    display: inline-block;
    width: 24px;
    height: 24px;
    --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M11 10.27L7 3.34m4 10.39l-4 6.93M12 22v-2m0-18v2m2 8h8m-5 8.66l-1-1.73m1-15.59l-1 1.73M2 12h2m16.66 5l-1.73-1m1.73-9l-1.73 1M3.34 17l1.73-1M3.34 7l1.73 1'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/g%3E%3C/svg%3E");
    background-color: currentColor;
    -webkit-mask-image: var(--svg);
    mask-image: var(--svg);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    cursor: pointer;
  }

  .sb544h-modal-wrapper {
    display: none;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    align-items: center;
    justify-content: center;
    z-index: 9000;
  }

  .lil-gui.root {
    border-radius: 30px;
    position: fixed;
    width: 40%;
    height: 70%;
    box-sizing: border-box;
    padding: 2em;
  }

  .sb544h-modal-wrapper .lil-gui {
    --background-color: white;
    --width: 100%;
    --text-color: currentColor;
    --title-background-color: #ffcc00;
    --title-text-color: black;
    --widget-color: #ffeb9d;
    --widget-height: 2em;
    --hover-color: navajowhite;
    --focus-color: #ffcc00;
    --number-color: black;
    --string-color: black;
    --font-size: 16px;
    --input-font-size: 14px;
  }

  .lil-gui .widget .display {
  border: 2px solid #ffeb9d;
  width: 30%;
  }

  .lil-gui .children {
    border-radius: 15px;
  }

  .lil-gui.root > .title {
    display: none;
  }

  #sb544h-toggle-settings:checked ~ .sb544h-modal-wrapper {
    display: flex;
  }

  .sb544h-bg-close {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    background: var(--sb544h-backdrop);
  }

  .navsub-nc-meter__2020 {
    margin-right: var(--sb544h-right-margin);
  }

  .navsub-left__2020 {
    margin-left: var(--sb544h-left-margin);
  }

  .lil-gui p {
    margin: 1em;
  }

  .lil-gui input[type=checkbox]:checked:before {
    top: 0;
    position: absolute;
    left: 0;
  }

  .lil-gui .controller.number input {
    text-align: center;
  }
  `;

const modal = `
  <input type="checkbox" style="display:none" id="sb544h-toggle-settings">
  <div class="sb544h-modal-wrapper">
  <label for="sb544h-toggle-settings" class="sb544h-close-settings sb544h-bg-close" aria-hidden="true"></label>
  <label for="sb544h-toggle-settings" class="sb544h-close-settings" aria-label="Close settings">x</label>
  </div>
`;

// You don't need to change anything here. There's a settings button in your sidebar!
const settings = [
  {
    key: "bg",
    defaultValue: "linear-gradient(black, #222)",
    name: "Background Images",
    kind: "Text",
    folder: "Appearance"
  },
  {
    key: "bgSize",
    defaultValue: "Original",
    name: "Background Size",
    kind: "Enum",
    options: ["Original", "Fit", "Fill"],
    folder: "Appearance",
    css: {
      "bg-size": v => {
        return {
          "Original": "auto",
          "Fit": "contain",
          "Fill": "cover"
        }[v];
      }
    }
  },
  {
    key: "bgRepeat",
    defaultValue: true,
    name: "Repeat Background Image",
    kind: "Boolean",
    folder: "Appearance",
    css: {
      "bg-repeat": v => v ? "repeat" : "no-repeat"
    }
  },
  {
    key: "width",
    defaultValue: 3,
    name: "Sidebar Width",
    kind: "Number",
    folder: "Appearance"
  },
  {
    key: "unit",
    defaultValue: "em",
    name: "Width Unit",
    kind: "Enum",
    options: ["em", "rem", "px", "vw", "vh"],
    folder: "Appearance"
  },
  {
    key: "iconSize",
    defaultValue: 24,
    name: "Maximum Icon Size (px)",
    kind: "Number",
    min: 1,
    max: 30,
    step: 1,
    folder: "Appearance",
    css: {
      "icon-size": v => `${v}px`
    }
  },
  {
    key: "side",
    defaultValue: "Left",
    name: "Sidebar Side",
    kind: "Enum",
    options: ["Left", "Right"],
    folder: "Appearance",
    css: {
      side: v => v.toLowerCase(),
      "other-side": v => v === "Right" ? "left" : "right",
      left: v => v === "Left" ? 0 : "auto",
      right: v => v === "Right" ? 0 : "auto",
      "border-left": v => v === "Right" ? "var(--sb544h-border)" : 0,
      "border-right": v => v === "Left" ? "var(--sb544h-border)" : 0,
      "left-width": v => v === "Left" ? "var(--sb544h-modal-margin)" : "auto",
      "right-width": v => v === "Right" ? "var(--sb544h-modal-margin)" : "auto",
      "left-margin": v => v === "Left" ? "var(--sb544h-width)" : 0,
      "right-margin": v => v === "Right" ? "var(--sb544h-width)" : 0
    }
  },
  {
    key: "iconColor",
    defaultValue: "#ffffff",
    name: "Icon Color",
    kind: "Color",
    folder: "Appearance",
    css: {
      "icon-color": v => v
    }
  },
  {
    key: "iconOpacity",
    defaultValue: 100,
    name: "Icon Opacity",
    kind: "Number",
    min: 0,
    max: 100,
    step: 1,
    folder: "Appearance",
    css: {
      "icon-opacity": v => v / 100
    }
  },
  {
    key: "iconHoverColor",
    defaultValue: "#ffffff",
    name: "Icon Color on Hover",
    kind: "Color",
    folder: "Appearance",
    css: {
      "icon-hover-color": v => v
    }
  },
  {
    key: "iconHoverOpacity",
    defaultValue: 100,
    name: "Icon Opacity on Hover",
    kind: "Number",
    min: 0,
    max: 100,
    step: 1,
    folder: "Appearance",
    css: {
      "icon-hover-opacity": v => v / 100
    }
  },
  {
    key: "borderColor",
    defaultValue: "#ffffff",
    name: "Border Color",
    kind: "Color",
    folder: "Appearance",
    css: {
      "border-color": v => v
    }
  },
  {
    key: "borderOpacity",
    defaultValue: 100,
    name: "Border Opacity",
    kind: "Number",
    min: 0,
    max: 100,
    step: 1,
    folder: "Appearance",
    css: {
      "border-opacity": v => v / 100
    }
  },
  {
    key: "hrColor",
    defaultValue: "#ffffff",
    name: "Divider Color",
    kind: "Color",
    folder: "Appearance",
    css: {
      "hr-color": v => v
    }
  },
  {
    key: "hrOpacity",
    defaultValue: 100,
    name: "Divider Opacity",
    kind: "Number",
    min: 0,
    max: 100,
    step: 1,
    folder: "Appearance",
    css: {
      "hr-opacity": v => v / 100
    }
  },
  {
    key: "spacing",
    defaultValue: "Center",
    name: "Icon Position",
    kind: "Enum",
    options: ["Center", "Bottom", "Top", "Evenly Spaced", "Far from Each Other"],
    folder: "Appearance",
    css: {
      justify: v => { return {
    "Center": "center",
    "Bottom": "flex-end",
    "Top": "flex-start",
    "Evenly Spaced": "space-evenly",
    "Far from Each Other": "space-between"
  }[v]}
    }
  },
  {
    key: "newTabIsDefault",
    defaultValue: false,
    name: 'Turn "New Tab" on when creating buttons',
    kind: "Boolean",
    folder: "Behavior"
  },
  {
    key: "confirmOnDeletion",
    defaultValue: true,
    name: 'Ask for confirmation when deleting buttons',
    kind: "Boolean",
    folder: "Behavior"
  },
  {
    key: "modalBackdrop",
    defaultValue: true,
    name: "Enable black backdrop when settings are open",
    kind: "Boolean",
    folder: "Behavior",
    css: {
      backdrop: v => v ? "oklch(0 0 0 / 0.5)" : "none"
    }
  }
];

const defaultStorage = {
  buttons: [
    {
      name: "Your First Button",
      url: "https://www.neopets.com/winter/snowager.phtml",
      icon: "healthicons:animal-snake",
      pos: 0,
      id: -1,
      newTab: false,
    },
  ],
  id: -1,
  cached: {},
};

const iconifyText = '<p>Icon names should be copied from <a href="https://icon-sets.iconify.design/">Iconify\'s amazing collection of icons</a>. When you click on one, a bottom view of the icon should open with a bigger preview and a copy button. You want the name that looks like icon-pack:icon-name.</p>';

(async function () {
  "use strict";
  if(!(await createSidebar())) return;
  createSettings(
    await GM.getValue("settings", getDefaultSettings()),
    await GM.getValue("storage", defaultStorage),
  );
})();
