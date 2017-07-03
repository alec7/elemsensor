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

import Vue from 'vue';
import {ipcRenderer, remote} from 'electron';
import Vex from 'vex-js';
import VexDialog from 'vex-dialog';

import Router from './router.js';
import Localization from './localization.js';
import Preferences from './preferences.js';
import Monitor from './monitor.js';
import Sensor from './sensor.js';

// Vex dialogs
Vex.defaultOptions.className = 'vex-theme-os';
Vex.registerPlugin(VexDialog);

// Localizxation
Localization.setLocale('en');

// Our Vue includes
Vue.use(require('vue-chartist'));

// Push messages for route changes
ipcRenderer.on('route', (ev, msg) => {
  Router.push(msg.path);
});

/**
 * Initializes the application
 * @param {Object} sensors Sensors from lm
 * @return {void}
 */
const init = (sensors) => {
  Preferences.init(sensors).then(() => {
    //const mainWindow = remote.getCurrentWindow();
    const menu = remote.Menu.buildFromTemplate([
      {
        label: Localization._('MENU_FILE'),
        submenu: [{
          role: 'quit'
        }]
      },
      {
        label: Localization._('MENU_VIEW'),
        submenu: [{
          label: Localization._('PAUSE'),
          type: 'checkbox',
          checked: Monitor.state(),
          click: () => Monitor.pause()
        }, {
          label: Localization._('FAHRENHEIT'),
          type: 'checkbox',
          checked: Preferences.get('temperature') === 'fahrenheit',
          click: () => {

            const s = Preferences.get('temperature') === 'fahrenheit'
              ? 'celcius'
              : 'fahrenheit';

            Preferences.set('temperature', s);
          }
        }, {
          type: 'separator'
        }, {
          label: Localization._('MENU_ADD'),
          click: () => {
            Preferences.collection.create();
          }
        }
          /*
          label: Localization._('MENU_GRAPHS'),
          click: () => {
            mainWindow.webContents.send('route', {
              path: '/'
            });
          }
        }, {
          label: Localization._('MENU_LIST'),
          click: () => {
            mainWindow.webContents.send('route', {
              path: '/list'
            });
          }
        }*/]
      }
    ]);

    remote.Menu.setApplicationMenu(menu);

    new Vue({
      router: Router
    }).$mount('#app');

  });
};

Sensor.getSensors()
  .then(init)
  .catch(() => init({}));
