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
 * Gets a value in its correct representation
 */
function getValue(type, value) {
  if ( type === 'in' ) {
    return value.toFixed(3);
  } else if ( type === 'temp' ) {
    return value.toFixed(1);
  }

  return value;
}

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
 * @return {Object}
 */
const getSensorBuffer = (function() {
  const sensorBuffer = {};
  const sensorMin = {};
  const sensorMax = {};

  return function(iter, sensor) {
    const value = getValue(sensor.sensor, sensor.input);
    const sensorBufferLength = Preferences.get('buffer');

    if ( typeof sensorBuffer[iter] === 'undefined' ) {
      sensorBuffer[iter] = Array.from(Array(sensorBufferLength), () => 0);
    }

    if ( typeof sensorMin[iter] === 'undefined' || value < sensorMin[iter] ) {
      sensorMin[iter] = value;
    }

    if ( typeof sensorMax[iter] === 'undefined' || value > sensorMax[iter] ) {
      sensorMax[iter] = value;
    }

    sensorBuffer[iter].push(value);
    sensorBuffer[iter].splice(0, sensorBuffer[iter].length - sensorBufferLength);

    return {
      values: sensorBuffer[iter],
      min: sensorMin[iter],
      max: sensorMax[iter]
    };
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
    const id = [adapter, name].join(':');
    const {values, min, max} = getSensorBuffer(id, sensor);

    this.id = id;
    this.adapter = adapter;
    this.name = name;
    this.sensor = sensor;
    this.type = this.sensor.sensor;
    this.values = values;
    this.min = min;
    this.max = max;
    this.value = getValue(this.type, sensor.input);
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
   * Gets min/max bounds
   * @return {Object}
   */
  bounds() {
    const min = getValueFromMap('min', Preferences.get('min'), this.sensor);

    let max = this.sensor.max;
    if ( typeof max === 'undefined' || !max ) {
      max = getValueFromMap('max', Preferences.get('max'), this.sensor);
    }

    return {min, max};
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

}

