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
import {spawnSync, exec} from 'child_process';
import {format} from 'util';

// Some internals
let supported = false;
let supportChecked = false;

/**
 * Runs a command in promisified fashion
 */
const run = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, (err, stdout, stderr) => {
    if ( err ) {
      reject(stderr);
    } else {
      resolve(stdout);
    }
  });
});

/**
 * Checks if this module is supported on this system
 */
const checkSupport = () => new Promise((resolve, reject) => {
  if ( !supportChecked ) {
    const check1 = spawnSync('which', ['nvidia-settings']).status === 0;
    const check2 = spawnSync('which', ['nvidia-smi']).status === 0;

    supported = check1 && check2;
    supportChecked = true;
  }

  resolve();
});

/**
 * Maps smi output to adapter->sensor data
 */
function getSensorMap(input) {
  const result = {};

  input.forEach((data, gpuid) => {
    const name = format('gpu%d', gpuid);

    result[name + '_usage'] = {
      sensor: 'usage',
      input: parseInt(data['utilization.gpu'], 10)
    };

    result[name + '_power'] = {
      sensor: 'power',
      input: parseInt(data['power.draw'], 10),
      min: parseInt(data['power.min_limit'], 10),
      max: parseInt(data['power.max_limit'], 10)
    };

    result[name + '_temp'] = {
      sensor: 'temp',
      input: parseInt(data['temperature.gpu'], 10)
    };

    result[name + '_fan_speed'] = {
      sensor: 'usage',
      input: parseInt(data['fan.speed'], 10)
    };

    result[name + '_memory_usage'] = {
      sensor: 'number',
      input: parseInt(data['memory.used'], 10)
    };
  });

  return result;
}

/**
 * Pulls all statistics
 */
function getStatistics() {
  // http://briot-jerome.developpez.com/fichiers/blog/nvidia-smi/list.txt
  const queries = [
    'utilization.gpu',
    'power.draw',
    'power.min_limit',
    'power.max_limit',
    'fan.speed',
    'temperature.gpu',
    'memory.total',
    'memory.free',
    'memory.used'
  ];

  const tpl = 'nvidia-smi --query-gpu=%s --format=csv,noheader,nounits';
  const cmd = format(tpl, queries.join(','));

  return new Promise((resolve, reject) => {

    run(cmd).then((stdout) => {
      const lines = stdout.trim().split(/(\r|\n)$/);
      const result = [];

      lines.forEach((line) => {
        const values = line.split(', ');
        const iter = {};

        values.forEach((v, i) => (iter[queries[i]] = v));

        result.push(iter);
      });

      resolve(getSensorMap(result));
    }).catch(reject);
  });
}

export default {

  /**
   * Gets all sensors on adapter
   * @return {Object}
   */
  getAdapters() {
    return new Promise((resolve, reject) => {
      checkSupport().then(() => {
        if ( !supported ) {
          resolve({});
        } else {
          getStatistics().then((stats) => {
            resolve({
              nvidia: {
                adapter: 'nvidia',
                sensors: stats
              }
            });
          }).catch(reject);
        }
      }).catch(reject);
    });
  }

};
