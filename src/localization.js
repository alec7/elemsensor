/*!
 * elemsensors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Anders Evenrud <andersevenrud@gmail.com>
 */
let currentLocale = 'en';

// All translations
const locales = {
  en: {
    'RPM': 'RPM',
    'FAHRENHEIT': 'Fahrenheit',
    'MENU_FILE': 'File',
    'MENU_VIEW': 'View',
    'MENU_LIST': 'Sensor List',
    'MENU_PREFS': 'Preferences',
    'MENU_GRAPHS': 'Graphs',
    'MENU_ADD': 'Add...',
    'MENU_RESET': 'Reset Settings',
    'SHOW_GRID': 'Show grid',
    'SHOW_LABEL': 'Show label',
    'SHOW_AREA': 'Show area',
    'SHOW_POINT': 'Show points',
    'RENAME': 'Rename',
    'REMOVE': 'Remove',
    'NEW': 'New',
    'TYPE': 'Type',
    'OPTIONS': 'Options',
    'SENSORS': 'Sensors',
    'PAUSE': 'Pause',
    'LABEL_FAN': 'Fans',
    'LABEL_IN': 'Voltages',
    'LABEL_TEMP': 'Temperatures',
    'LABEL_INTRUSION': 'Intrusion',
    'LABEL_BEEP': 'Beep',
    'LABEL_CLOCK': 'Clock Speeds',
    'LABEL_MEMORY': 'Memory Usage'
  },
  no: {
    'RPM': 'RPM',
    'FAHRENHEIT': 'Fahrenheit',
    'MENU_FILE': 'Fil',
    'MENU_VIEW': 'Visning',
    'MENU_LIST': 'Sensorliste',
    'MENU_PREFS': 'Instillinger',
    'MENU_GRAPHS': 'Grafer',
    'MENU_ADD': 'Legg til...',
    'MENU_RESET': 'Nullstill instillinger',
    'SHOW_GRID': 'Vis nett',
    'SHOW_LABEL': 'Vis etiketter',
    'SHOW_AREA': 'Vis område',
    'SHOW_POINT': 'Vis punkter',
    'RENAME': 'Navngi',
    'REMOVE': 'Fjern',
    'NEW': 'Ny',
    'TYPE': 'Type',
    'OPTIONS': 'Opsjoner',
    'SENSORS': 'Sensorer',
    'PAUSE': 'Pause',
    'LABEL_FAN': 'Vifter',
    'LABEL_IN': 'Strøm',
    'LABEL_TEMP': 'Temperaturer',
    'LABEL_INTRUSION': 'Innbrudd',
    'LABEL_BEEP': 'Pip',
    'LABEL_CLOCK': 'Klokkehastighet',
    'LABEL_MEMORY': 'Minnebruk'
  }
};

/**
 * Sets current locale
 * @param {String} l Locale name
 * @return {void}
 */
module.exports.setLocale = (l) => {
  if ( Object.keys(locales)[l] ) {
    currentLocale = l;
  }
};

/**
 * Translates a string
 * @param {String} k The string, or 'key' to translate
 * @return {String}
 */
module.exports._ = (k) => {
  return locales[currentLocale][k]
    ? locales[currentLocale][k]
    : locales.en[k];
};
