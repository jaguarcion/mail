const fs = require('fs');
const dir = 'C:\\Users\\JAGUAR\\.gemini\\antigravity\\brain\\5a909030-5f4b-47c3-9700-c6fa292b64fb';

const svgs = [
  // 1. Horizontal key (lucide style)
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  // 2. Thick filled key
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
  // 3. Keyhole minimal
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><circle cx="12" cy="10" r="4"/><path d="M10 14h4l-1 6h-2z"/></svg>`,
  // 4. Square abstract key
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20M4 12l8-8M4 12l8 8M14 6h6v4h-2v4h2v4h-6z"/></svg>`,
  // 5. Shield with Keyhole
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="2"/><path d="M11 13h2l-.5 3h-1z"/></svg>`,
  // 6. Grid / Software key
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M6 10v11h12"/></svg>`,
  // 7. Minimal geometric
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="2" y="10" width="10" height="4" rx="2"/><path d="M12 12h10m-3-3v6m-4-6v6"/></svg>`,
  // 8. Mail + Keyhole (ZenMailFlow legacy)
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/><circle cx="12" cy="12" r="2" fill="black"/><path d="M11 14h2l-.5 3h-1z" fill="black"/></svg>`,
  // 9. Diagonal Key modern
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path d="M14.4 7.6C13.5 6.7 12 6.7 11.1 7.6 10.2 8.5 10.2 10 11.1 10.9L3.5 18.5 3 21h2.5L6 20.5V19h1.5l.5-.5V17h1.5l1.6-1.6c.9.9 2.4.9 3.3 0 1.2-1.2 1.2-3.1 0-4.3l-2.6-2.6zM13 10c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/></svg>`,
  // 10. Two keys crossed
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M14.5 4.5l5 5M19.5 4.5l-5 5M4.5 19.5l10-10m0 0v-3h3M4.5 4.5l10 10m0 0v3h-3"/></svg>`
];

svgs.forEach((svg, i) => {
  fs.writeFileSync(dir + '/icon_option_' + (i+1) + '.svg', svg);
});
console.log('SVGs generated successfully');
