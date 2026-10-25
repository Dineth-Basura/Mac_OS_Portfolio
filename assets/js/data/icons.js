
'use strict';
// Uploaded artwork shared by Desktop, Dock, Finder and Spotlight.
// Filenames are mapped by their visible logo, not just their filename.
const iconImages = Object.freeze({
  youtube: 'youtube.png',
  blog: 'blogger.png',
  github: 'github.png',
  whatsapp: 'logo.png',
  linkedin: 'linkedin.png',
  netflix: 'netflix.png',
  chatgpt: 'chatgpt.svg',
  deepseek: 'deepseek.svg',
  gemini: 'gemini.svg',
  figma: 'figma.svg',
  instagram: 'instagram.png',
  photos: 'photos.svg',
  terminal: 'terminal.png',
  spotify: 'spotify.svg',
  camera: 'camera.svg',
  contact: 'contacts.svg',
  settings: 'settings.svg',
  calendar: 'calendar.svg',
  translate: 'translate.svg'
});
// SVG symbols are deliberately authored as vectors, so they stay sharp at any DPI.
const SVG = (shapes) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${shapes}</svg>`;
const rounded=(fill,inside)=>SVG(`<rect width="64" height="64" rx="14" fill="${fill}"/>${inside}`);
const icons = {
  folder: SVG(`<defs><linearGradient id="folderGold" x1="0" x2="0" y2="1"><stop stop-color="#ffcf56"/><stop offset="1" stop-color="#f9a400"/></linearGradient></defs><path d="M4 14c0-3.4 2.7-6 6-6h16l6 6h22c3.3 0 6 2.7 6 6v31c0 4-3.2 7-7 7H11c-3.8 0-7-3-7-7Z" fill="#f5a401"/><path d="M4 20h56v30c0 4.3-3.2 7-7.2 7H11c-3.8 0-7-3-7-7Z" fill="url(#folderGold)"/><path d="M4 21h56" stroke="#ffdc7b" stroke-width="2"/>`),
  youtube: rounded('#fff',`<rect x="10" y="16" width="44" height="32" rx="10" fill="#FF002B"/><path d="M28 23.7 42 32 28 40.3Z" fill="#fff"/>`),
  chatgpt: rounded('#589e92',`<g transform="translate(32 32)" fill="none" stroke="white" stroke-width="3.7" stroke-linejoin="round" stroke-linecap="round"><path d="M-4-16c8-7 17-1 17 6v7l-13 8"/><path d="M12-10c9 1 11 13 4 17l-6 3-12-8"/><path d="M16 7c2 10-8 17-15 13l-6-3V3"/><path d="M1 20c-7 5-18-1-18-9V5l12-7"/><path d="M-17 11c-10-2-12-14-5-18l6-4 12 8"/><path d="M-22-7c-2-9 8-17 15-13l6 4V-3"/></g>`),
  figma: rounded('#202126',`<g transform="translate(19 10)"><path d="M13 0H6.5a6.5 6.5 0 100 13H13Z" fill="#F24E1E"/><path d="M13 0h6.5a6.5 6.5 0 110 13H13Z" fill="#FF7262"/><path d="M13 13H6.5a6.5 6.5 0 100 13H13Z" fill="#A259FF"/><circle cx="19.5" cy="19.5" r="6.5" fill="#1ABCFE"/><path d="M6.5 26H13v6.5A6.5 6.5 0 116.5 26" fill="#0ACF83"/></g>`),
  journal: rounded('#1a1827',`<defs><linearGradient id="jl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7894fa"/><stop offset="1" stop-color="#bd93d8"/></linearGradient><linearGradient id="jr" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff91bd"/><stop offset="1" stop-color="#ffdaae"/></linearGradient></defs><path d="M30 24C26 16 18 15 12 15v21c0 6 9 9 18 15V24Z" fill="url(#jl)"/><path d="M34 24c4-8 12-9 18-9v21c0 6-9 9-18 15V24Z" fill="url(#jr)"/><path d="M30 24 34 24v26l-2 2-2-2z" fill="#403449"/>`),
  codex: rounded('#fff',`<defs><linearGradient id="cx" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b5caff"/><stop offset=".5" stop-color="#6a89ff"/><stop offset="1" stop-color="#5e4dfa"/></linearGradient></defs><path d="M22 13c5-5 13-3 16 2 8-1 14 5 13 13 7 8 1 19-8 19-7 7-15 5-20 0-8 1-14-5-13-13-6-9-1-17 8-19z" fill="url(#cx)"/><path d="m22 26-6 7 6 7M31 40h12" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  devlyhub: rounded('#23202a',`<defs><linearGradient id="dv" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b64dff"/><stop offset=".5" stop-color="#ff78c4"/><stop offset="1" stop-color="#4bd975"/></linearGradient></defs><path d="M10 44C10 18 18 11 29 11c9 0 16 8 16 17 0 8-7 14-14 9-7-5-3-13-5-13-2 0-2 14-5 23-3 7-11 5-11-3Z" fill="url(#dv)"/><path d="M41 18c15-5 18 5 12 13-5 7-8 11-5 17-13 3-17-5-15-13 1-7 5-13 8-17z" fill="#45ce7d"/>`),
  blog: rounded('#ff7b00',`<rect x="20" y="12" width="24" height="40" rx="9" fill="#fff"/><rect x="26" y="21" width="12" height="5" rx="2.5" fill="#ff7b00"/><rect x="24" y="31" width="16" height="5" rx="2.5" fill="#ff7b00"/><rect x="25" y="41" width="14" height="4" rx="2" fill="#ff7b00"/>`),
  github: rounded('#11141b',`<circle cx="32" cy="32" r="24" fill="#fff"/><path fill="#15171d" d="M32 12c-11.1 0-20 9-20 20 0 8.6 5.4 16 12.9 18.8 1 .2 1.1-.4 1.1-.9v-3.7c-5.3 1.2-6.4-2.2-6.4-2.2-.9-2.3-2.2-2.9-2.2-2.9-1.8-1.2.1-1.2.1-1.2 1.9.1 3 2 3 2 1.7 3 4.5 2 5.6 1.5.2-1.3.7-2.1 1.2-2.5-4.2-.5-8.8-2.1-8.8-9.8 0-2.2.8-4 2-5.4-.2-.5-.9-2.5.2-5.1 0 0 1.6-.5 5.3 2a18 18 0 0 1 9.6 0c3.7-2.5 5.3-2 5.3-2 1.1 2.6.4 4.6.2 5.1 1.3 1.4 2 3.2 2 5.4 0 7.7-4.6 9.3-8.9 9.8.7.6 1.3 1.8 1.3 3.6v5.5c0 .5.2 1.1 1.1.9C46.6 48 52 40.6 52 32c0-11-9-20-20-20z"/>`),
  deepseek: rounded('#fff',`<path d="M8 35c5-12 20-17 31-15 8 1 13 6 17 12-8-2-12-1-16 1 5 2 8 7 9 11-4-2-9-2-13 0-5 3-10 6-18 5 4-2 8-6 9-10-7 2-14 1-19-4Z" fill="#3f78f5"/><path d="M30 21c4-6 9-7 14-7-1 5-3 9-8 10Z" fill="#6297ff"/><circle cx="45.3" cy="28.7" r="1.8" fill="#fff"/>`),
  pdf: rounded('#fff',`<path d="M17 7h21l10 10v32c0 3-2 5-5 5H17c-3 0-5-2-5-5V12c0-3 2-5 5-5Z" fill="#fbfbfb" stroke="#d0d6db"/><path d="M38 7v11h10" fill="#e9edf1"/><path d="M22 30c6-6 10-18 7-18-7 0 4 24 14 20 5-3-12-4-25 2" fill="none" stroke="#9ca4ae" stroke-width="1.6"/><rect x="7" y="39" width="50" height="18" rx="2" fill="#E32B2C"/><text x="32" y="52" font-weight="900" fill="#fff" font-size="16" text-anchor="middle">PDF</text>`),
  whatsapp: rounded('#08db54',`<circle cx="32" cy="31" r="20" fill="none" stroke="#fff" stroke-width="4"/><path d="m17 42-2 11 11-4" fill="#fff"/><path d="M24 22c-2 2-3 4-2 8 1 6 9 14 15 15 4 1 8 0 10-3l-7-5-4 4c-5-2-8-5-10-10l4-4-6-5Z" fill="#fff"/>`),
  gemini: rounded('#fff',`<defs><linearGradient id="gem" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#2fdac5"/><stop offset=".45" stop-color="#5a92fb"/><stop offset=".75" stop-color="#9858dc"/><stop offset="1" stop-color="#f5b257"/></linearGradient></defs><path d="M32 8c3.7 14 7 17.3 21 21-14 3.7-17.3 7-21 21-3.7-14-7-17.3-21-21C25 25.3 28.3 22 32 8Z" fill="url(#gem)"/>`),
  linkedin: rounded('#0A66C2',`<circle cx="19" cy="18" r="4.8" fill="#fff"/><rect x="15" y="25" width="8" height="25" rx="1.5" fill="#fff"/><path d="M29 25h8v3.6c1.4-2.4 4.2-4.2 8.1-4.2 7.1 0 9.3 4.8 9.3 12.3V50h-8.2V37.1c0-3.1-1-5.6-4.2-5.6-3 0-4.8 2.1-4.8 5.6V50H29z" fill="#fff"/>`),
  instagram: rounded('#12111c',`<defs><linearGradient id="inst" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffc652"/><stop offset=".32" stop-color="#ff354e"/><stop offset=".66" stop-color="#e23ec9"/><stop offset="1" stop-color="#6843ec"/></linearGradient></defs><rect x="10" y="10" width="44" height="44" rx="12" fill="url(#inst)"/><rect x="15" y="15" width="34" height="34" rx="10" fill="#111221"/><circle cx="32" cy="32" r="10" fill="none" stroke="url(#inst)" stroke-width="4"/><circle cx="43" cy="20" r="3" fill="#ed49aa"/>`),
  netflix: rounded('#101010',`<path d="M23 11h8l15 42h-8Z" fill="#b20710"/><path d="M23 11h8v42h-8Z" fill="#ef111c"/><path d="M38 11h8v42h-8Z" fill="#7d030c"/>`),
  vscode: rounded('#101018',`<path d="m44 12-21 19-10-8-4 4 12 11-12 10 4 5 10-8 21 19 11-4V16l-11-4Z" fill="#fff"/><path d="M44 12v52l11-4V16z" fill="#e8eff6"/><path d="M24 32 44 17v30Z" fill="#161d2a"/>`),
  finder: rounded('#f7f7f7',`<path d="M4 15C4 9 9 4 15 4h17v56H15C9 60 4 55 4 49Z" fill="#16adf5"/><path d="M32 4h17c6 0 11 5 11 11v34c0 6-5 11-11 11H32Z" fill="#f0f7ff"/><path d="M22 13 15 39h18" fill="none" stroke="#204d6f" stroke-width="1.5"/><path d="M22 26h2M43 25h3M18 43c8 9 20 9 27 0" fill="none" stroke="#1e4060" stroke-width="2.5" stroke-linecap="round"/>`),
  photos: rounded('#fff',`<g transform="translate(32 32)"><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#ff594e"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#ffb439" transform="rotate(45)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#ffe43b" transform="rotate(90)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#51d65d" transform="rotate(135)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#3ccacc" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#40a5fb" transform="rotate(225)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#7c70ff" transform="rotate(270)"/><ellipse cx="0" cy="-10" rx="6.1" ry="15" fill="#dc70d3" transform="rotate(315)"/><circle r="6" fill="#fff5ed"/></g>`),
  terminal: rounded('#24272d',`<path d="m17 21 10 11-10 11" fill="none" stroke="#f1f2f4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="32" y="41" width="16" height="3" rx="1.5" fill="#f1f2f4"/>`),
  spotify: rounded('#101312',`<circle cx="32" cy="32" r="26" fill="#19d45a"/><path d="M19 24c9-4 22-3 32 2M21 33c9-3 19-2 27 2M24 41c7-2 15-1 21 2" stroke="#111c16" stroke-width="4" stroke-linecap="round" fill="none"/>`),
  camera: rounded('#abb1b9',`<defs><linearGradient id="cameraBody" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5d6069"/><stop offset="1" stop-color="#262a30"/></linearGradient></defs><rect x="7" y="19" width="50" height="32" rx="9" fill="url(#cameraBody)"/><path d="M15 18h12l4 6H13z" fill="#565b62"/><circle cx="33" cy="35" r="14" fill="#9ea5ae"/><circle cx="33" cy="35" r="11" fill="#0c1018"/><circle cx="33" cy="35" r="7" fill="#2d4158"/><path d="M28 30a7 7 0 0 1 9-1" fill="none" stroke="#8faec8" stroke-width="2" opacity=".8"/><circle cx="49" cy="26" r="2.2" fill="#efb54c"/>`),
  contact: rounded('#c99751',`<rect x="5" y="7" width="54" height="50" rx="12" fill="#c79c58"/><circle cx="32" cy="26" r="8" fill="#a87938"/><path d="M17 48c1-10 9-16 15-16s14 6 15 16" fill="#a87938"/><path d="M55 16v32" stroke="#72ca8b" stroke-width="5"/><path d="M58 16v32" stroke="#fdc86c" stroke-width="3"/>`),
  settings: rounded('#8c98a8',`<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7f8fa"/><stop offset=".55" stop-color="#aeb6bf"/><stop offset="1" stop-color="#515e6a"/></linearGradient></defs><circle cx="32" cy="32" r="24" fill="url(#metal)"/><g transform="translate(32 32)" fill="#586573">${Array.from({length:12},(_,i)=>`<rect x="-3" y="-27" width="6" height="14" rx="1.5" transform="rotate(${i*30})"/>`).join('')}</g><circle cx="32" cy="32" r="17" fill="#d1d7dd" stroke="#67717c" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="#7c8894"/><circle cx="32" cy="32" r="4" fill="#e2e5e9"/>`)
};

