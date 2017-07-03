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
import SensorCollection from './sensorcollection.js';

let paused = false; // If paused or not
let interval; // Our tick

export default {

  /**
   * Gets pause state
   * @return {Boolean}
   */
  state() {
    return paused;
  },

  /**
   * Starts polling
   * @param {Function} cb Callback function
   */
  start(cb) {
    const run = () => {
      if ( paused ) {
        return;
      }

      Sensor.getSensors().then((s) => {
        cb(Preferences.get('collection').map((collection) => {
          return (new SensorCollection(s, collection)).toJson();
        }));
      }).catch((e) => {
        console.error(e);
        clearInterval(interval);
      });
    };

    interval = setInterval(run, Preferences.get('interval'));
    run();
  },

  /**
   * Stops polling
   */
  stop() {
    clearInterval(interval);
  },

  /**
   * Toggles polling state
   */
  pause() {
    paused = !paused;
  }

};
