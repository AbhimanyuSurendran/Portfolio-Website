// The 12 colour themes: 6 for light mode and 6 for dark mode.
//
// This list only holds ids, names and which mode a theme belongs to.
// The colours themselves are in styles/themes.css, under [data-theme="<id>"].
// To add or change a theme, edit both places (and keep the id spelling identical).

export const THEMES = {
  dark: [
    { id: 'ember', name: 'Ember' },
    { id: 'lagoon', name: 'Lagoon' },
    { id: 'rosewood', name: 'Rosewood' },
    { id: 'moss', name: 'Moss' },
    { id: 'glacier', name: 'Glacier' },
    { id: 'graphite', name: 'Graphite' },
  ],
  light: [
    { id: 'sandstone', name: 'Sandstone' },
    { id: 'seafoam', name: 'Seafoam' },
    { id: 'blush', name: 'Blush' },
    { id: 'meadow', name: 'Meadow' },
    { id: 'frost', name: 'Frost' },
    { id: 'pearl', name: 'Pearl' },
  ],
}

// Used on a first visit, and whenever a saved theme id is not recognised.
export const DEFAULT_THEME = { dark: 'ember', light: 'sandstone' }
