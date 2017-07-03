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
import Preferences from './preferences.js';

import moment from 'moment';

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
   * Gets maximum value of all sensors in collection
   * @return {Number}
   */
  min() {
    return Math.min(...this.collection.map((r) => r.min()));
  }

  /**
   * Gets minimum value of all sensors in collection
   * @return {Number}
   */
  max() {
    return Math.max(...this.collection.map((r) => r.max()));
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
   * Gets a textual representation of the value of collection
   * @return {String}
   */
  value() {
    return this.collection.map((c) => {
      return [c.value, c.unit()].join(' ');
    }).join(', ');
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
    return Object.assign({
      distributeSeries: this.type !== 'Line',
      low: this.min(),
      high: this.max(),
      chartPadding: 0,
      showPoint: this.count() > 1,
      showArea: this.count() < 2,
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
    const name = this.collection.map((r) => r.name).join(', ');

    return {
      className: this.count() ? 'has-sensors' : '',
      name: name,
      label: this.label || name,
      value: this.value(),
      sensors: this.collection.map((r) => r.name),
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

}
