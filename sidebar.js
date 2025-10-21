// ==UserScript==
// @name         Neopets: Sidebar
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a very customizable sidebar with icons and links of your choice to every page in Neopets, a settings page, and notebooks
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/sidebar.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/sidebar.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://cdn.jsdelivr.net/npm/lil-gui@0.20
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// ==/UserScript==

// Looks stable enough. TODO optimize

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
    - Allows you to pick the maximum icon size for icons, but note that since everything, including icon spacing, is
      based on that size, increasing it when you have too many icons will make the icons smaller (!)
    - Allows you to drag and drop buttons in the Settings window to adjust their order in real time
    - Adds a notebook feature so you can write notes for the entire website or just specific Neopets pages. Available
      URL matching modes are:
      - Exact: URL must be exactly the same as your input
      - Starts With: URL must start with your input, and nothing to the left of it. Anything after that does not matter.
      - Ends With: URL must end with your input, and nothing to the right of it. Anything before that does not matter.
      - Regular Expression: URL must match your regular expression, and can have anything to the left or right.
      - Glob: URL must match your glob, which means there must be nothing to the left or right of it.
      A notebook matching the entire website is already provided.

    In the beta layout, the sidebar is behind the header. When you open the settings, the sidebar moves to the front.
    As weird as it looks, this is intended behavior.

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
};

const getDefaultSettings = () => {
  const defaultSettings = {};
  settings.forEach(
    setting => (defaultSettings[setting.key] = setting.defaultValue)
  );
  return defaultSettings;
};

const saveSettings = savedGui => {
  const settingsToSave = settings.reduce((agg, setting) => {
    agg[setting.key] = savedGui.folders[setting.folder].controllers[setting.name];
    return agg;
  }, {});
  GM.setValue('settings', settingsToSave);
};

const createController = (controllerData, currentSettings, folder) => {
  if (controllerData.key === 'width') {
    const [min, max, step] = widthValues[currentSettings.unit];
    return folder
      .add(currentSettings, 'width', min, max, step)
      .name(controllerData.name);
  }
  const controller =
    controllerData.kind === 'Color'
      ? folder
          .addColor(currentSettings, controllerData.key)
          .name(controllerData.name)
      : folder
          .add(currentSettings, controllerData.key)
          .options(controllerData.options)
          .min(controllerData.min)
          .max(controllerData.max)
          .step(controllerData.step);
  return controller.name(controllerData.name);
};

const onUnitChange = (v, widthController) => {
  const [min, max, step] = widthValues[v];
  const newWidth = Math.min(
    Math.max(Math.round(widthController.getValue() / step) * step, min),
    max
  );
  widthController.setValue(newWidth).min(min).max(max).step(step);
};

const createSettingsFolder = (folderName, folder, currentSettings) => {
  const controls = {};
  settings
    .filter(setting => setting.folder === folderName)
    .forEach(setting => {
      controls[setting.key] = createController(
        setting,
        currentSettings,
        folder
      );
    });
  controls.unit?.onChange(v => onUnitChange(v, controls.width));
  return controls;
};

const initModalGUI = async title => {
  document.body.insertAdjacentHTML('beforeEnd', modal(title));
  // eslint-disable-next-line no-undef
  return new lil.GUI({
    container: document.querySelector(
      `#sphsb-toggle-${title} + .sphsb-modal-wrapper`
    ),
    closeFolders: true
  });
};

const matchNotebookURL = notepad =>
  urlMatchers[notepad.mode](window.location.href, notepad.matcher);

const updateNotepad = async (index, folder, changes) => {
  const notebooks = await GM.getValue('notebooks', defaultNotebooks);
  notebooks[index] = {
    matcher: changes.matcher ?? notebooks[index].matcher,
    mode: changes.mode ?? notebooks[index].mode,
    name: changes.name ?? notebooks[index].name,
    value: changes.value ?? notebooks[index].value
  };
  GM.setValue('notebooks', notebooks);
  folder.title(getNotepadTitle(notebooks[index]));
};

const getNotepadTitle = notepad => `${notepad.name} | ${notepad.matcher}`;

const addNotepadTextarea = (folder, notepad, index) => {
  folder.domElement.getElementsByClassName('children')[0].insertAdjacentHTML(
    'beforeEnd',
    `
    <div class="controller string">
    <div class="name" id="lil-gui-name-notepad-${index}">${notepad.name}</div>
    <div class="widget"><textarea spellcheck="false" aria-labelledby="lil-gui-name-notepad-${index}"></textarea></div>
    </div>`
  );
  const textarea = folder.domElement.getElementsByTagName('textarea')[0];
  textarea.value = notepad.value;
  textarea.addEventListener('change', () => {
    updateNotepad(index, folder, { value: textarea.value });
  });
};

const getNotebooks = async (showAll, update) => {
  let currentNotebooks = await GM.getValue('notebooks', defaultNotebooks);
  if (update) {
    currentNotebooks = currentNotebooks.filter(a => a);
    GM.setValue('notebooks', currentNotebooks);
  }
  return showAll ? currentNotebooks : currentNotebooks.filter(matchNotebookURL);
};

const createSingleNotebook = async (notepad, index, gui) => {
  const folder = gui.addFolder(getNotepadTitle(notepad));
  if (index !== 0)
    folder
      .add(notepad, 'name')
      .onChange(name => updateNotepad(index, folder, { name }))
      .name('Notebook Name');
  addNotepadTextarea(folder, notepad, index);
  if (index !== 0) {
    folder
      .add(notepad, 'matcher')
      .onFinishChange(matcher => updateNotepad(index, folder, { matcher }))
      .name("URLs it's active in");
    folder
      .add(notepad, 'mode', Object.keys(urlMatchers))
      .onChange(mode => updateNotepad(index, folder, { mode }))
      .name('Matching Mode');
  }
  notepad.del = async () => {
    folder.destroy();
    const notebooksBeforeDeletion = await GM.getValue(
      'notebooks',
      defaultNotebooks
    );
    if (!notebooksBeforeDeletion[index]) return;
    notebooksBeforeDeletion[index] = null;
    GM.setValue('notebooks', notebooksBeforeDeletion);
  };
  if (index !== 0) folder.add(notepad, 'del').name('🗑️ Delete');
};

const addNewNotebook = async gui => {
  const allNotebooks = await GM.getValue('notebooks', defaultNotebooks);
  const index = allNotebooks.length;
  const notebookData = {
    mode: 'Exact',
    matcher: window.location.href,
    name:
      document.getElementsByTagName('h1')[0]?.textContent ??
      document.getElementsByTagName('h2')[0]?.textContent ??
      document.title,
    value: ''
  };
  allNotebooks.push(notebookData);
  GM.setValue('notebooks', allNotebooks).then(() =>
    createSingleNotebook(notebookData, index, gui)
  );
};

const createNotebooksFromList = async (showAll, gui) => {
  const list = await getNotebooks(showAll, true);
  list.forEach((notepad, index) => createSingleNotebook(notepad, index, gui));
};

const createNotebooks = async () => {
  const gui = await initModalGUI('notebooks');
  const buttons = {
    showAll: false,
    add: () => addNewNotebook(gui)
  };
  gui
    .add(buttons, 'showAll')
    .name('Show all notebooks')
    .onChange(v => {
      gui.children.filter(c => c.children).forEach(c => c.destroy());
      createNotebooksFromList(v, gui);
    });
  gui.add(buttons, 'add').name('➕ New Notebook');
  createNotebooksFromList(buttons.showAll, gui);
};

const createSettings = async currentSettings => {
  const gui = await initModalGUI('settings');
  const folders = {};
  ['Appearance', 'Behavior'].forEach(folder => {
    folders[folder] = createSettingsFolder(
      folder,
      gui.addFolder(folder),
      currentSettings
    );
  });
  gui.onChange(() => {
    saveSettings(gui.save());
    createSidebar();
  });
  saveSettings(gui.save());
  createButtonSettings(gui);
};

const extractButtonData = (buttonFolders, button, position) => {
  const controllers = buttonFolders[button.getElementsByClassName("title")[0].textContent].controllers;
  return {
    id: controllers.id,
    name: controllers.Name,
    url: controllers.URL,
    icon: controllers['Iconify Icon Name'],
    pos: position,
    newTab: controllers['Open in new tab']
  };
}

const collectButtonData = gui => {
  const buttonFolders = gui.save().folders.Buttons.folders;
  const buttonsDom = [
    ...gui.folders[2].domElement.querySelectorAll('.children > .lil-gui')
  ];
  return buttonsDom.map((button, position) => extractButtonData(buttonFolders, button, position));
}

const persistButtons = async gui => {
  GM.setValue('buttons', collectButtonData(gui)).then(() => createSidebar());
};

const generateButtonName = async (name, id) => {
  const allButtons = await GM.getValue('buttons', []);
  if (!allButtons.find(btn => btn.name === name && btn.id !== id)) return name;
  let suffix = 1;
  while (allButtons.find(btn => btn.name === `${name} ${suffix}`)) {
    suffix++;
  }
  return `${name} ${suffix}`;
};

const createNewButtonData = async (name, position) => {
  const id = (await GM.getValue('id', -1)) + 1;
  GM.setValue('id', id);
  return {
    id: id,
    name: name,
    url: 'https://www.neopets.com/home',
    icon: 'famicons:paw-outline',
    pos: position,
    newTab: (await GM.getValue('settings', getDefaultSettings()))
      .newTabIsDefault
  };
};

const validateUrl = (url, control) => {
  if (url.startsWith('https://')) return;
  control.setValue(url.replace(/^\/(.+)/, 'https://www.neopets.com/$1'));
};

const makeButtonsDraggable = (buttonFolder, gui) => {
  // eslint-disable-next-line no-undef
  Sortable.create(buttonFolder.domElement.querySelector('.children'), {
    draggable: '.lil-gui',
    direction: 'vertical',
    onChange: () => {
      for (
        let i = 0;
        i <
        buttonFolder.domElement.querySelectorAll('.children > .lil-gui').length;
        i++
      ) {
        buttonFolder.domElement.querySelector(
          `.children > .lil-gui:nth-child(${i + 4})`
        ).dataset.sphsbposition = i;
      }
      persistButtons(gui);
      createSidebar();
    }
  });
};

const createButtonInSettings = (buttonData, parentFolder, gui) => {
  const buttonFolder = parentFolder.addFolder(buttonData.name);
  buttonFolder.add(buttonData, 'id').disable().hide();
  const button = buttonFolder
    .add(buttonData, 'name')
    .name('Name')
    .onFinishChange(async value => {
      const newValue = await generateButtonName(value, buttonData.id);
      if (newValue !== value) button.setValue(newValue);
      buttonFolder.title(newValue);
    });
  const url = buttonFolder
    .add(buttonData, 'url')
    .name('URL')
    .onChange(v => validateUrl(v, url));
  buttonFolder.add(buttonData, 'icon').name('Iconify Icon Name');
  buttonFolder.add(buttonData, 'newTab').name('Open in new tab');
  buttonFolder.domElement.dataset.sphsbposition = buttonData.pos;
  const del = {
    delete: () =>
      deleteButton(buttonData.id, buttonData.name, gui, parentFolder)
  };
  buttonFolder
    .add(del, 'delete')
    .name('🗑️')
    .domElement.classList.add('sphsb-delete-question');
  return buttonFolder;
};

const deleteButton = async (id, buttonName, gui, folder) => {
  const confirm = (await GM.getValue('settings', getDefaultSettings()))
    .confirmOnDeletion;
  if (confirm)
    window.confirm(`Are you sure you want to delete "${buttonName}"?`);
  const allButtons = (await GM.getValue('buttons', [])).filter(
    btn => btn.id !== id
  );
  GM.setValue(
    'buttons',
    allButtons.sort((a, b) => a.pos - b.pos)
  );
  createButtonSettings(gui, folder);
};

const addButton = async (button, folder, gui) => {
  const allButtons = await GM.getValue('buttons', []);
  const position = button?.pos ?? allButtons[allButtons.length - 1].pos + 1;
  const name = await generateButtonName(button?.name ?? 'New Button');
  const buttonData = button ?? (await createNewButtonData(name, position));
  const btn = createButtonInSettings(buttonData, folder, gui);
  if (button) btn.close();
  if (!button) persistButtons(gui);
};

const createButtonSettings = async (gui, buttonsFolder) => {
  if (buttonsFolder) buttonsFolder.destroy();
  const folder = gui.addFolder('Buttons');
  const add = { addButton: () => addButton(null, folder, gui) };
  folder.add(add, 'addButton').name('➕ Add Button');
  folder
    .add(add, 'addButton')
    .name('➕ Add Button')
    .domElement.classList.add('sphsb-flex-last');
  folder.domElement
    .getElementsByClassName('children')[0]
    .insertAdjacentHTML('afterBegin', iconifyText);
  const buttons = await GM.getValue('buttons', []);
  buttons.forEach(button => addButton(button, folder, gui));
  folder.onChange(() => persistButtons(gui));
  makeButtonsDraggable(folder, gui);
};

const createButton = async buttonData => {
  const button = document.createElement(
    buttonData.url && buttonData.url !== '' ? 'a' : 'hr'
  );
  const split = buttonData.icon.split(':');
  if (split.length === 2)
    button.classList.add(`sphsb-${split[0]}-${split[1]}`, `sphsb-${split[0]}`);
  else console.warn(`${button.icon} isn't a valid Iconify icon!`);
  if (buttonData.url && buttonData.url !== '') button.href = buttonData.url;
  button.title = buttonData.name;
  if (buttonData.newTab) button.target = '_blank';
  return button;
};

const addSpecialButton = title => {
  const open = document.createElement('label');
  open.classList.add(`sphsb-open-modal`, `sphsb-${title}-button`);
  open.ariaLabel = `Open ${title}`;
  open.htmlFor = `sphsb-toggle-${title}`;
  return open;
};

const initializeSidebar = () => {
  document.getElementsByClassName('sphsb-sidebar')[0]?.remove();
  const sidebar = document.createElement('aside');
  sidebar.classList.add('sphsb-sidebar');
  document.body.prepend(sidebar);
  return sidebar;
}

const initializeBackground = () => {
  document.getElementsByClassName('sphsb-sidebar-bg')[0]?.remove();
  const bg = document.createElement('div');
  bg.ariaHidden = true;
  bg.classList.add('sphsb-sidebar-bg');
  document.body.prepend(bg);
  return bg;
}

const addButtonsToSidebar = async (sidebar) => {
  applyIconStyles();
  const buttons = await GM.getValue('buttons', []);
  buttons
    .sort((a, b) => a.pos - b.pos)
    .forEach(async buttonData =>
      sidebar.appendChild(await createButton(buttonData))
    );
  sidebar.appendChild(addSpecialButton('settings'));
  sidebar.appendChild(addSpecialButton('notebooks'));
}

const createSidebar = async () => {
  const backgroundElement = getElement('#navtop__2020', '#ban');
  if (!backgroundElement) return false;
  applySettings(backgroundElement);
  const sidebar = initializeSidebar();
  initializeBackground();
  addButtonsToSidebar(sidebar);
  return true;
};

const getElement = (...names) => {
  for (let i = 0; i < names.length; i++) {
    const element = document.querySelector(names[i]);
    if (element) return element;
  }
};

const fetchIconSet = async (iconSet, icons) => {
  const response = await fetch(
    `https://api.iconify.design/${iconSet}.css?selector=.sphsb-{prefix}-{name}&common=.sphsb-{prefix}&mode=mask&format=compressed&icons=${icons.join(',')}`
  );
  const css = await response.text();
  return css;
};

const groupIconsBySet = async () => {
  const buttons = await GM.getValue('buttons', []);
  return buttons
    .map(button => button.icon.split(':'))
    .reduce((agg, curr) => {
      if (curr.length !== 2) return agg;
      agg[curr[0]] = agg[curr[0]] ? agg[curr[0]].concat([curr[1]]) : [curr[1]];
      return agg;
    }, {});
};

const buildIconCache = async () => {
  const iconSets = await groupIconsBySet();
  const cache = await GM.getValue('cached', {});
  Object.keys(cache)
    .filter(set => !Object.keys(iconSets).includes(set))
    .forEach(key => delete cache[key]);
  const results = await Promise.all(
    Object.entries(iconSets)
      .filter(([set, icons]) => {
        const found = cache[set];
        return !found || icons.some(icon => !found.iconList.includes(icon));
      })
      .map(
        ([set, icons]) =>
          new Promise(resolve => {
            fetchIconSet(set, icons).then(css =>
              resolve([set, { iconList: icons, css: css }])
            );
          })
      )
  );
  const newCache = { ...cache, ...Object.fromEntries(results) };
  GM.setValue('cached', newCache);
  return newCache;
};

const applyIconStyles = async () => {
  const newCache = await buildIconCache();
  if (!newCache || Object.values(newCache).length === 0) return;
  const style = document.createElement('style');
  style.innerHTML = Object.values(newCache)
    .map(v => v.css)
    .join('');
  document.getElementById('sphsb-style-icons')?.remove();
  style.id = 'sphsb-style-icons';
  document.head.appendChild(style);
};

const getUserBackgroundImage = bg => {
  if (bg === '') return [];
  const regex = new RegExp(
    /((?:(?:url|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient|element|image|cross-fade|image-set)\([^)]+\))|(?:[^(, ]+))/,
    'g'
  );
  return bg
    .match(regex)
    .map(b => (b.includes('(') ? b : `url('${b}')`))
    .reverse();
};

const getNeoBackgroundImage = backgroundElement => {
  const themeBackgroundImage =
    window.getComputedStyle(backgroundElement).backgroundImage;
  const themePattern = [
    ...document.getElementsByClassName('nav-top-pattern__2020')
  ].map(pattern => window.getComputedStyle(pattern).backgroundImage);
  return [themeBackgroundImage, ...themePattern].reverse();
};

const createCSSProperties = (currentSettings) => {
  return settings
    .filter(setting => setting.css)
    .map(setting => Object.entries(setting.css)
      .map(([propName, valFunc]) => `--sphsb-${propName}: ${valFunc(currentSettings[setting.key])};`)
      .join('\n')
    ).join('\n');
}

const applySettings = async backgroundElement => {
  const currentSettings = await GM.getValue('settings', getDefaultSettings());
  const topBar = window.getComputedStyle(backgroundElement).height;
  document.head
    .querySelectorAll('.sphsb-sidebar-style')
    .forEach(oldSettings => oldSettings.remove());
  const newSettingsStyle = document.createElement('style');
  const userBackground = getUserBackgroundImage(currentSettings.bg).join(', ');
  document.head.appendChild(newSettingsStyle);
  newSettingsStyle.classList.add('sphsb-sidebar-style');
  const autoProps = createCSSProperties(currentSettings);
  const cssVars = `
  :root {
    --sphsb-top-bar: ${topBar};
    --sphsb-width: ${currentSettings.width}${currentSettings.unit};
    --sphsb-neo-bg-image: ${getNeoBackgroundImage(backgroundElement).join(', ')};
    --sphsb-user-bg-image: ${userBackground === '' ? 'none' : userBackground};
    --sphsb-border: 2px solid oklch(from var(--sphsb-border-color) l c h / var(--sphsb-border-opacity));
    --sphsb-modal-margin: calc(var(--sphsb-width) * ${currentSettings.iconSize}px);
    ${autoProps}
  }
  `;

  newSettingsStyle.innerHTML = `${cssVars}
  ${css}`;
};

const css = `body:has(#navtop__2020) .sphsb-sidebar {
  z-index: 96;
  margin-top: var(--sphsb-top-bar);
  height: calc(100vh - var(--sphsb-top-bar));
}

body:has(#navtop__2020) .sphsb-sidebar-bg {
  z-index: 96;
}

body:has(.sphsb-toggle-modal:checked) {
  overflow: hidden;
}

.lil-gui .children {
  display: flex;
  flex-direction: column;
  overscroll-behavior: none;
}

.lil-gui .children .title {
  height: auto;
  min-height: var(--title-height);
}

.sphsb-flex-last {
  order: 9999999;
}

.sphsb-delete-question::before {
  display: inline-block;
  min-width: var(--name-width);
  content: 'Delete?';
}

.sphsb-sidebar {
  display: flex;
  position: fixed;
  top: 0;
  right: var(--sphsb-right);
  left: var(--sphsb-left);
  flex-direction: column;
  justify-content: var(--sphsb-justify);
  align-items: center;
  gap: 1em;
  z-index: 101;
  box-sizing: border-box;
  border-right: var(--sphsb-border-right);
  border-left: var(--sphsb-border-left);
  padding: 3.5em 0;
  width: var(--sphsb-width);
  height: 100vh;
  font-size: var(--sphsb-icon-size);
}

body:has(.sphsb-toggle-modal:checked)
  :is(.sphsb-sidebar, .sphsb-sidebar-bg) {
  z-index: 9001;
}

.sphsb-sidebar-bg {
  position: fixed;
  top: 0;
  right: var(--sphsb-right);
  left: var(--sphsb-left);
  z-index: 101;
  width: var(--sphsb-width);
  height: 100vh;
  font-size: var(--sphsb-icon-size);
}

.sphsb-sidebar-bg::before {
  display: block;
  position: relative;
  top: 0;
  transform: rotate(-90deg)
    translate(
      calc((var(--sphsb-width) - 100vh) / 2),
      calc((var(--sphsb-width) - 100vh) / 2)
    );
  background: var(--sphsb-neo-bg-image);
  background-repeat: repeat;
  width: 100vh;
  height: var(--sphsb-width);
  content: '';
}

.sphsb-sidebar-bg::after {
  display: block;
  position: relative;
  top: calc(-1 * var(--sphsb-width));
  background: var(--sphsb-user-bg-image);
  background-size: var(--sphsb-bg-size);
  background-repeat: var(--sphsb-bg-repeat);
  width: var(--sphsb-width);
  height: 100vh;
  content: '';
}

.sphsb-sidebar :is(a, label, hr) {
  margin: 0;
  width: 1.5em;
  height: 1.5em;
}

.sphsb-sidebar :is(a, label) {
  color: oklch(
    from var(--sphsb-icon-color) l c h / var(--sphsb-icon-opacity)
  );
}

.sphsb-sidebar hr {
  color: oklch(from var(--sphsb-hr-color) l c h / var(--sphsb-hr-opacity));
}

.sphsb-sidebar label {
  position: absolute;
  top: 1em;
}

.sphsb-sidebar :is(a, label):hover {
  color: oklch(
    from var(--sphsb-icon-hover-color) l c h / var(--sphsb-icon-hover-opacity)
  );
}

.sphsb-open-modal {
  display: inline-block;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  cursor: pointer;
  background-color: currentColor;
  width: 24px;
  height: 24px;
}

.sphsb-settings-button {
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M11 10.27L7 3.34m4 10.39l-4 6.93M12 22v-2m0-18v2m2 8h8m-5 8.66l-1-1.73m1-15.59l-1 1.73M2 12h2m16.66 5l-1.73-1m1.73-9l-1.73 1M3.34 17l1.73-1M3.34 7l1.73 1'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/g%3E%3C/svg%3E");
}

label.sphsb-notebooks-button {
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26px' height='26px' viewBox='0 0 32 32'%3E%3Cpath fill='%23fff' d='M10 3a1 1 0 1 1 2 0v1h3V3a1 1 0 1 1 2 0v1h3V3a1 1 0 1 1 2 0v1h1.75A3.25 3.25 0 0 1 27 7.25V21a1 1 0 0 1-.293.707l-7 7A1 1 0 0 1 19 29H8.25A3.25 3.25 0 0 1 5 25.75V7.25A3.25 3.25 0 0 1 8.25 4H10zM7 7.25v18.5c0 .69.56 1.25 1.25 1.25h9.25v-3.75A3.25 3.25 0 0 1 20.75 20H25V7.25C25 6.56 24.44 6 23.75 6H8.25C7.56 6 7 6.56 7 7.25m12.5 18.836L23.586 22H20.75c-.69 0-1.25.56-1.25 1.25zM11 10a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2zm-1 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2z' stroke-width='1' stroke='%23fff'/%3E%3C/svg%3E");
  top: auto;
  bottom: 1em;
}

.sphsb-modal-wrapper {
  display: none;
  position: fixed;
  top: 0;
  justify-content: center;
  align-items: center;
  z-index: 9000;
  width: 100%;
  height: 100%;
}

.lil-gui.root {
  position: fixed;
  box-sizing: border-box;
  border-radius: 30px;
  padding: 2em;
  width: 40%;
  height: 70%;
}

.sphsb-modal-wrapper .lil-gui {
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
}

.lil-gui textarea {
  width: 100%;
  height: 21em;
  font-family: Poppins, Montserrat, Verdana;
}

.lil-gui .children {
  border-radius: 15px;
}

.lil-gui.root > .title {
  display: none;
}

.lil-gui p {
  margin: 1em;
}

.lil-gui input[type='checkbox']:checked:before {
  position: absolute;
  top: 0;
  left: 0;
}

.lil-gui .controller.number input {
  text-align: center;
}

.sphsb-toggle-modal:checked + .sphsb-modal-wrapper {
  display: flex;
}

.sphsb-bg-close {
  display: block;
  position: relative;
  background: var(--sphsb-backdrop);
  width: 100%;
  height: 100%;
}

.navsub-nc-meter__2020 {
  margin-right: var(--sphsb-right-margin);
}

.navsub-left__2020 {
  margin-left: var(--sphsb-left-margin);
}
  `;

const modal = title => `
  <input type="checkbox" style="display:none" id="sphsb-toggle-${title}" class="sphsb-toggle-modal">
  <div class="sphsb-modal-wrapper">
  <label for="sphsb-toggle-${title}" class="sphsb-close-modal sphsb-bg-close" aria-label="Close modal"></label>
  </div>
`;

// You don't need to change anything here. There's a settings button in your sidebar!
const settings = [
  {
    key: 'bg',
    defaultValue: 'linear-gradient(black, #222)',
    name: 'Background Images',
    kind: 'Text',
    folder: 'Appearance'
  },
  {
    key: 'bgSize',
    defaultValue: 'Original',
    name: 'Background Size',
    kind: 'Enum',
    options: ['Original', 'Fit', 'Fill'],
    folder: 'Appearance',
    css: {
      'bg-size': v => {
        return {
          Original: 'auto',
          Fit: 'contain',
          Fill: 'cover'
        }[v];
      }
    }
  },
  {
    key: 'bgRepeat',
    defaultValue: true,
    name: 'Repeat Background Image',
    kind: 'Boolean',
    folder: 'Appearance',
    css: {
      'bg-repeat': v => (v ? 'repeat' : 'no-repeat')
    }
  },
  {
    key: 'width',
    defaultValue: 3,
    name: 'Sidebar Width',
    kind: 'Number',
    folder: 'Appearance'
  },
  {
    key: 'unit',
    defaultValue: 'em',
    name: 'Width Unit',
    kind: 'Enum',
    options: ['em', 'rem', 'px', 'vw', 'vh'],
    folder: 'Appearance'
  },
  {
    key: 'iconSize',
    defaultValue: 24,
    name: 'Maximum Icon Size (px)',
    kind: 'Number',
    min: 1,
    max: 30,
    step: 1,
    folder: 'Appearance',
    css: {
      'icon-size': v => `${v}px`
    }
  },
  {
    key: 'side',
    defaultValue: 'Left',
    name: 'Sidebar Side',
    kind: 'Enum',
    options: ['Left', 'Right'],
    folder: 'Appearance',
    css: {
      side: v => v.toLowerCase(),
      'other-side': v => (v === 'Right' ? 'left' : 'right'),
      left: v => (v === 'Left' ? 0 : 'auto'),
      right: v => (v === 'Right' ? 0 : 'auto'),
      'border-left': v => (v === 'Right' ? 'var(--sphsb-border)' : 0),
      'border-right': v => (v === 'Left' ? 'var(--sphsb-border)' : 0),
      'left-width': v => (v === 'Left' ? 'var(--sphsb-modal-margin)' : 'auto'),
      'right-width': v =>
        v === 'Right' ? 'var(--sphsb-modal-margin)' : 'auto',
      'left-margin': v => (v === 'Left' ? 'var(--sphsb-width)' : 0),
      'right-margin': v => (v === 'Right' ? 'var(--sphsb-width)' : 0)
    }
  },
  {
    key: 'iconColor',
    defaultValue: '#ffffff',
    name: 'Icon Color',
    kind: 'Color',
    folder: 'Appearance',
    css: {
      'icon-color': v => v
    }
  },
  {
    key: 'iconOpacity',
    defaultValue: 100,
    name: 'Icon Opacity',
    kind: 'Number',
    min: 0,
    max: 100,
    step: 1,
    folder: 'Appearance',
    css: {
      'icon-opacity': v => v / 100
    }
  },
  {
    key: 'iconHoverColor',
    defaultValue: '#ffffff',
    name: 'Icon Color on Hover',
    kind: 'Color',
    folder: 'Appearance',
    css: {
      'icon-hover-color': v => v
    }
  },
  {
    key: 'iconHoverOpacity',
    defaultValue: 100,
    name: 'Icon Opacity on Hover',
    kind: 'Number',
    min: 0,
    max: 100,
    step: 1,
    folder: 'Appearance',
    css: {
      'icon-hover-opacity': v => v / 100
    }
  },
  {
    key: 'borderColor',
    defaultValue: '#ffffff',
    name: 'Border Color',
    kind: 'Color',
    folder: 'Appearance',
    css: {
      'border-color': v => v
    }
  },
  {
    key: 'borderOpacity',
    defaultValue: 100,
    name: 'Border Opacity',
    kind: 'Number',
    min: 0,
    max: 100,
    step: 1,
    folder: 'Appearance',
    css: {
      'border-opacity': v => v / 100
    }
  },
  {
    key: 'hrColor',
    defaultValue: '#ffffff',
    name: 'Divider Color',
    kind: 'Color',
    folder: 'Appearance',
    css: {
      'hr-color': v => v
    }
  },
  {
    key: 'hrOpacity',
    defaultValue: 100,
    name: 'Divider Opacity',
    kind: 'Number',
    min: 0,
    max: 100,
    step: 1,
    folder: 'Appearance',
    css: {
      'hr-opacity': v => v / 100
    }
  },
  {
    key: 'spacing',
    defaultValue: 'Center',
    name: 'Icon Position',
    kind: 'Enum',
    options: [
      'Center',
      'Bottom',
      'Top',
      'Evenly Spaced',
      'Far from Each Other'
    ],
    folder: 'Appearance',
    css: {
      justify: v => {
        return {
          Center: 'center',
          Bottom: 'flex-end',
          Top: 'flex-start',
          'Evenly Spaced': 'space-evenly',
          'Far from Each Other': 'space-between'
        }[v];
      }
    }
  },
  {
    key: 'newTabIsDefault',
    defaultValue: false,
    name: 'Turn "New Tab" on when creating buttons',
    kind: 'Boolean',
    folder: 'Behavior'
  },
  {
    key: 'confirmOnDeletion',
    defaultValue: true,
    name: 'Ask for confirmation when deleting buttons',
    kind: 'Boolean',
    folder: 'Behavior'
  },
  {
    key: 'modalBackdrop',
    defaultValue: true,
    name: 'Enable black backdrop when settings are open',
    kind: 'Boolean',
    folder: 'Behavior',
    css: {
      backdrop: v => (v ? 'oklch(0 0 0 / 0.5)' : 'none')
    }
  }
];

const defaultStorage = {
  buttons: [
    {
      name: 'Your First Button',
      url: 'https://www.neopets.com/winter/snowager.phtml',
      icon: 'healthicons:animal-snake',
      pos: 0,
      id: -1,
      newTab: false
    }
  ],
  id: -1,
  cached: {}
};

const defaultNotebooks = [
  {
    matcher: 'neopets\\.com\\/.*',
    mode: 'Regular Expression',
    name: 'Global Notebook',
    value:
      "These are your notebooks! The one you see right now is available in all pages the sidebar can be seen in. Additionally, you can create individual notebooks that only show up in the pages you specify. For that, you can use a glob-like pattern, which is basically just an URL with an asterisk * everywhere you want to match 0 or more characters. So, https://www.neopets.com/tradingpost.phtml and https://www.neopets.com/tradingpost.phtml? both match https://www.neopets.com/tradingpost.phtml* but only the first matches https://www.neopets.com/tradingpost.phtml. In addition to that, you can use RegEx almost freely, except ? and * aren't allowed characters. So, not very free."
  }
];

const urlMatchers = {
  Exact: (url, matcher) => url === matcher.toLowerCase(),
  'Starts With': (url, matcher) => url.startsWith(matcher.toLowerCase()),
  'Ends With': (url, matcher) => url.endsWith(matcher.toLowerCase()),
  'Regular Expression': (url, matcher) => url.match(new RegExp(matcher)),
  Glob: (url, matcher) => {
    const safeMatcher = matcher
                        .replaceAll('.', '\\.')        // Escape dots. They mean literal dots in glob
                        .replaceAll('/', '\\/')        // Escape forward slashes. They mean literal slashes in glob
                        .replaceAll(/(?<!\\)\?/g, '.') // Single character match: ? in glob, . in RegEx
                        .replaceAll('*', '.*');         // Zero+ character match: * in glob, .* in RegEx
    return url.match(new RegExp(`^${safeMatcher}$`)); // Globs match the whole string, unlike RegEx
  }
};

const iconifyText =
  '<p>Icon names should be copied from <a href="https://icon-sets.iconify.design/">Iconify\'s amazing collection of icons</a>. When you click on one, a bottom view of the icon should open with a bigger preview and a copy button. You want the name that looks like icon-pack:icon-name.</p>';

(async function () {
  'use strict';
  if (!(await createSidebar())) return;
  createSettings(
    await GM.getValue('settings', getDefaultSettings()),
    await GM.getValue('storage', defaultStorage)
  );
  createNotebooks();
})();
