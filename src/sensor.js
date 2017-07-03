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

import LM from 'lm_sensors.js';
import Preferences from './preferences.js';
import Localization from './localization.js';
import {remote} from 'electron';

/**
 * Unit types
 */
const UNITS = {
  temp: {
    celcius: '°C',
    fahrenheit: '°F'
  },
  fan: Localization._('RPM'),
  in: 'V'
};

/**
 * Gets a value for map
 * @param {String} bound Bounding string (min/max)
 * @param {Object} map The map
 * @param {Object} sensor The sensor
 * @return {Number}
 */
function getValueFromMap(bound, map, sensor) {
  const key = sensor.sensor;
  if ( typeof map[key] === 'undefined' ) {
    return sensor.input;
  }
  return Math[bound](sensor.input, map[key]);
}

/**
 * Gets the sensor data
 * @return {Number[]}
 */
const getSensorBuffer = (function() {
  let sensorBuffer = {};

  return function(iter, sensor) {
    const sensorBufferLength = Preferences.get('buffer');

    if ( typeof sensorBuffer[iter] === 'undefined' ) {
      sensorBuffer[iter] = Array.from(Array(sensorBufferLength), () => 0);
    }

    sensorBuffer[iter].push(sensor.input);
    sensorBuffer[iter].splice(0, sensorBuffer[iter].length - sensorBufferLength);
    return sensorBuffer[iter];
  };
})();

/**
 * The sensor class
 */
export default class Sensor {

  /**
   * @param {String} adapter The adapter name for sensor
   * @param {String} name The sensor name
   * @param {Object} sensor The sensor data from lm_sensors
   */
  constructor(adapter, name, sensor) {
    this.id = [adapter, name].join(':');
    this.adapter = adapter;
    this.name = name;
    this.sensor = sensor;
    this.type = this.sensor.sensor;
    this.values = getSensorBuffer(this.id, sensor);
    this.value = sensor.input;
  }

  /**
   * Gets the unit of this sensor
   * @return {String}
   */
  unit() {
    let found = UNITS[this.type];
    if ( typeof found === 'object' ) {
      found = found[Preferences.get('temperature')];
    }
    return found || '';
  }

  /**
   * Gets the alarm value
   * @param {String} type The alarm type (alert or crit)
   * @return {Number}
   */
  alarm(type) {
    return this.sensor[type];
  }

  /**
   * Gets minimum value of sensor
   * @return {Number}
   */
  min() {
    return getValueFromMap('min', Preferences.get('min'), this.sensor);
  }

  /**
   * Gets maximum value of sensor
   * @return {Number}
   */
  max() {
    if ( typeof this.sensor.max === 'undefined' || !this.sensor.max ) {
      return getValueFromMap('max', Preferences.get('max'), this.sensor);
    }

    return this.sensor.max;
  }

  /**
   * Gets all sensors
   * @return {Array}
   */
  static getSensors() {
    const opts = {
      fahrenheit: Preferences.get('temperature') === 'fahrenheit'
    };

    return LM.sensors(opts);
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

    this.getSensors().then(createMenu).catch(() => createMenu([]));
  }

}

