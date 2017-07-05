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
import Sensor from './sensor.js';
import Adapters from './adapters.js';
import Preferences from './preferences.js';
import Localization from './localization.js';

import moment from 'moment';
import {remote} from 'electron';

/**
 * The sensor collection class
 */
export default class SensorCollection {

  /**
   * @param {Object} sensors lm_sensors data
   * @param {Object} collection collection configuration
   */
  constructor(sensors, collection) {
    const result = collection.sensors.map((u) => {
      let adapter, name;
      [adapter, name] = u.split(':');

      const sensor = sensors[adapter].sensors[name];
      return new Sensor(adapter, name, sensor);
    });

    this.type = collection.type || 'Line';
    this.label = collection.label;
    this.options = collection.options || {};
    this.collection = result;
  }

  /**
   * Gets the min/max bounds used for graph
   * @return {Object}
   */
  bounds() {
    const bounds = this.collection.map((r) => r.bounds());
    const min = Math.min(...bounds.map((r) => r.min));
    const max = Math.max(...bounds.map((r) => r.max));

    return {min, max};
  }

  /**
   * Gets maximum value of all sensors in collection
   * @return {Number}
   */
  min() {
    return Math.min(...this.collection.map((r) => r.min));
  }

  /**
   * Gets minimum value of all sensors in collection
   * @return {Number}
   */
  max() {
    return Math.max(...this.collection.map((r) => r.max));
  }

  /**
   * Gets all labels from sensors
   * @return {String[]}
   */
  labels() {
    if ( this.type !== 'Line' ) {
      return this.collection.map((r) => r.name);
    }

    const iv = Preferences.get('interval') / 1000;
    const l = Preferences.get('buffer');

    return Array.from(Array(l), (v, i) => {
      const s = (l - i) * iv;
      return moment().subtract(s, 'seconds').format('H:mm:ss');
    });
  }

  /**
   * Gets all values from sensors
   * @return {Number[]}
   */
  values() {
    if ( this.type !== 'Line' ) {
      return this.collection.map((r) => r.value);
    }

    return this.collection.map((r) => r.values);
  }

  /**
   * Gets number of sensors
   * @return {Number}
   */
  count() {
    return this.collection.length;
  }

  /**
   * Creates options passed on to the graph
   * @return {Object}
   */
  createOptions() {
    const {min, max} = this.bounds();

    return Object.assign({
      distributeSeries: this.type !== 'Line',
      low: min,
      high: max,
      chartPadding: 0,
      showPoint: false,
      showArea: this.count() <= 1,
      fullWidth: true,
      axisX: {
        showLabel: false,
        showGrid: false
      }
    }, this.options);
  }

  /**
   * Gets JSON of this collection including its sensors
   * @return {Object}
   */
  toJson() {
    const unitized = (k) => {
      return this.collection.map((c) => {
        return [c[k], c.unit()].join(' ');
      });
    };

    const names = this.collection.map((r) => r.name);

    return {
      label: this.label || names.join(', '),
      sensors: this.collection.map((r) => r.name),

      options: {
        showMinMax: true
      },

      data: {
        names: names,
        values: unitized('value'),
        count: this.count(),
        min: unitized('min'),
        max: unitized('max')
      },

      chart: {
        type: this.type,
        options: this.createOptions(),
        data: {
          labels: this.labels(),
          series: this.values()
        }
      }
    };
  }

  /**
   * Creates the context menu
   * @param {Number} index The collection index
   * @param {Object} collection The collection object
   * @return {void}
   */
  static createContextMenu(index, collection) {
    const optionsTemplate = [
      {label: Localization._('SHOW_GRID'), key: 'axisX.showGrid'},
      {label: Localization._('SHOW_LABEL'), key: 'axisX.showLabel'},
      {label: Localization._('SHOW_AREA'), key: 'showArea'},
      {label: Localization._('SHOW_POINT'), key: 'showPoint'}
    ];

    const win = remote.getCurrentWindow();

    const createMenu = (sensors) => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: Localization._('RENAME'),
          click: () => Preferences.collection.rename(index)
        },
        {
          label: Localization._('REMOVE'),
          click: () => Preferences.collection.remove(index)
        },
        {
          label: Localization._('TYPE'),
          submenu: Preferences.get('types').map((t) => {
            return {
              label: t,
              click: () => Preferences.collection.setType(index, t)
            };
          })
        },
        {
          label: Localization._('SENSORS'),
          submenu: Object.keys(sensors).map((adapter) => {
            return {
              label: adapter,
              submenu: Object.keys(sensors[adapter].sensors).map((n) => {
                const exists = collection.sensors.indexOf(n) !== -1;

                return {
                  label: n,
                  type: 'checkbox',
                  checked: exists,
                  click: () => Preferences.collection[exists ? 'removeSensor' : 'addSensor'](index, adapter, n)
                };
              })
            };
          })
        },
        {
          label: Localization._('OPTIONS'),
          submenu: optionsTemplate.map((t) => {
            const current = Preferences.collection.getOption(index, t.key, collection.chart.options);

            return {
              label: t.label,
              type: 'checkbox',
              checked: current,
              click: () => Preferences.collection.setOption(index, t.key, !current)
            };
          })
        }
      ]);

      menu.popup(win);
    };

    Adapters.getAdapters().then(createMenu).catch(() => createMenu([]));
  }

}
