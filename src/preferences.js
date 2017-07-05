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

import ElectronSettings from 'electron-settings';
import Localization from './localization.js';
import Vex from 'vex-js';

let currentCollection;

/**
 * Gets the default list of sensor collections to add
 * @param {Object} sensors Sensors from lm
 * @return {Array}
 */
function getDefaultSensorCollection(sensors) {
  const adapters = Object.keys(sensors);
  const allSensors = {};
  const types = {
    'fan': Localization._('LABEL_FAN'),
    'temp': Localization._('LABEL_TEMP'),
    'in': Localization._('LABEL_IN'),
    'intrusion': Localization._('LABEL_INTRUSION'),
    'beep': Localization._('LABEL_BEEP')
  };

  const isValid = (s) => {
    const sensor = allSensors[s];

    // We don't need these as they are on/off only
    if ( ['beep', 'intrusion'].indexOf(sensor.sensor) !== -1 ) {
      return false;
    }

    // For some reason some of my temps are at minimum
    if ( sensor.sensor === 'temp' && sensor.input < -120 ) {
      return false;
    }

    return sensor.input !== 0;
  };

  adapters.forEach((a) => {
    const adapter = sensors[a];
    Object.keys(adapter.sensors).forEach((n) => {
      const id = [a, n].join(':');
      allSensors[id] = adapter.sensors[n];
    });
  });

  const collections = Object.keys(types).map((t) => {
    return {
      label: types[t],
      sensors: Object.keys(allSensors)
        .filter((s) => allSensors[s].sensor === t)
        .filter(isValid)
    };
  }).filter((c) => c.sensors.length > 0);

  const individuals = Object.keys(allSensors)
    .filter(isValid)
    .map((s) => {
      return {
        label: s,
        sensors: [s]
      };
    })
    .filter((c) => c.sensors.length > 0);

  return collections.concat(individuals);
}

/**
 * Graph types
 */
const GRAPH_TYPES = [
  'Line',
  'Bar'
];

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES = {
  collection: [],
  temperature: 'celcius',
  min: {
    temp: 0.0,
    fan: 2500,
    in: -5.0,
    intrusion: 0,
    beep: 0
  },
  max: {
    temp: 120.0,
    fan: 2500,
    in: 13.0,
    intrusion: 1,
    beep: 1
  },
  buffer: 10,
  interval: 1000
};

const collectionMethods = {
  /**
   * Sets the collection graph type
   * @param {Number} index Collection index
   * @param {String} type Graph type
   */
  setType: (index, type) => {
    currentCollection[index].type = type;
  },

  /**
   * Creates a collection
   */
  create: () => {
    currentCollection.unshift({
      label: Localization._('NEW'),
      sensors: []
    });
  },

  /**
   * Renames collection
   * @param {Number} index Collection index
   */
  rename: (index) => {
    if ( currentCollection[index] ) {
      Vex.dialog.prompt({
        message: Localization._('RENAME'),
        placeholder: currentCollection[index].label,
        callback: (label) => {
          if ( label ) {
            currentCollection[index].label = label;
          }
        }
      });
    }
  },

  /**
   * Removes collection
   * @param {Number} index Collection index
   */
  remove: (index) => {
    currentCollection.splice(index, 1);
  },

  /**
   * Adds a sensor to collection
   * @param {Number} index Collection index
   * @param {String} adapter Adapter name
   * @param {String} name Sensor name
   */
  addSensor: (index, adapter, name) => {
    const id = [adapter, name].join(':');
    if ( currentCollection[index] ) {
      const found = currentCollection[index].sensors.indexOf(id);
      if ( found === -1 ) {
        currentCollection[index].sensors.push(id);
      }
    }
  },

  /**
   * Removes a sensor from collection
   * @param {Number} index Collection index
   * @param {String} adapter Adapter name
   * @param {String} name Sensor name
   */
  removeSensor: (index, adapter, name) => {
    const id = [adapter, name].join(':');
    if ( currentCollection[index] ) {
      const found = currentCollection[index].sensors.indexOf(id);
      if ( found !== -1 ) {
        currentCollection[index].sensors.splice(found, 1);
      }
    }
  },

  /**
   * Gets a collection option
   * @param {Number} index Collection index
   * @param {String} name Option name
   * @param {Object} options Options
   * @return {Mixed}
   */
  getOption: (index, name, options) => {
    if ( currentCollection[index] ) {
      //const options = currentCollection[index].options || {};
      const words = name.split('.');

      let current = options;
      words.forEach((k, i) => {
        if ( i < words.length ) {
          try {
            current = current[k];
          } catch ( e ) {}
        }
      });

      return current;
    }

    return null;
  },

  /**
   * Sets a collection option
   * @param {Number} index Collection index
   * @param {String} name Option name
   * @param {Mixed} value Option value
   */
  setOption: (index, name, value) => {
    if ( currentCollection[index] ) {
      if ( typeof currentCollection[index].options === 'undefined' ) {
        currentCollection[index].options = {};
      }

      const options = currentCollection[index].options;
      const words = name.split('.');
      const last = words[words.length - 1];

      let current = options;
      words.forEach((k, i) => {
        if ( i < words.length - 1 ) {
          current = current[k] || {};
        }
      });

      current[last] = value;
    }
  }
};

export default {
  /**
   * @var Collection methods
   */
  collection: (function() {
    const result = {};

    Object.keys(collectionMethods).forEach((m) => {
      result[m] = function() {
        const ret = collectionMethods[m].apply(null, arguments);

        ElectronSettings.set('collection', currentCollection);

        return ret;
      };
    });

    return result;

  })(),

  /**
   * Initializes preferences
   * @param {Object} sensors Sensors from lm
   * @return {Promise}
   */
  init(sensors) {
    Object.keys(DEFAULT_PREFERENCES).forEach((k) => {
      if ( typeof ElectronSettings.get(k) === 'undefined' ) {
        ElectronSettings.set(k, DEFAULT_PREFERENCES[k]);
      }
    });

    const tst = ElectronSettings.get('collection');
    if ( !(tst instanceof Array) || !tst.length ) {
      ElectronSettings.set('collection', getDefaultSensorCollection(sensors));
    }

    currentCollection = ElectronSettings.get('collection');

    return Promise.resolve(true);
  },

  /**
   * Gets a setting
   * @param {String} k The key
   * @return {Object}
   */
  get(k) {
    if ( k === 'collection' ) {
      return currentCollection;
    } else if ( k === 'types' ) {
      return GRAPH_TYPES;
    }

    return ElectronSettings.get(k);
  },

  /**
   * Sets a setting
   * @param {String} k The key
   * @param {Mixed} v The value
   * @return {Mixed}
   */
  set(k, v) {
    if ( k === 'collection' ) {
      return null;
    }
    return ElectronSettings.set(k, v);
  }

};
