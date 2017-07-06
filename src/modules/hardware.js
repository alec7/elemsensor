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
import OS from 'os';

let inited;
let samples = [];
let prevCpus = OS.cpus();

function getSensors() {
  const sensors = {};

  OS.cpus().forEach((cpu, idx) => {
    const name = 'cpu' + (idx + 1) + '_speed';
    sensors[name] = {
      sensor: 'clock',
      input: cpu.speed
    };
  });

  sensors.cpu_usage = (function() {
    let result = 0;
    let percent = 0;
    let i = samples.length;
    let j = 0;

    while ( i-- ) {
      j++;
      if ( samples[i].total > 0 ) {
        percent += (100 - Math.round(100 * samples[i].idle / samples[i].total));
      }

      if ( j === 10 ) {
        result = percent / j;
      }
    }

    return {
      sensor: 'usage',
      input: result
    };
  })();

  sensors.memory_usage = (function() {
    const total = OS.totalmem() / 1024 / 1024;
    const free = OS.freemem() / 1024 / 1024;
    const used = total - free;

    return {
      sensor: 'number',
      input: used
    };
  })();

  return sensors;
}

export default {

  /**
   * Gets all sensors on adapter
   * @return {Object}
   */
  getAdapters() {
    if ( !inited ) {
      inited = true;

      setInterval(() => {
        const currCpus = OS.cpus();

        var prevCpu, currCpu, deltas, t;
        for ( let i = 0, len = currCpus.length; i < len; i++ ) {
          prevCpu = prevCpus[i];
          currCpu = currCpus[i];
          deltas = {total: 0};

          for ( t in prevCpu.times ) {
            deltas.total += currCpu.times[t] - prevCpu.times[t];
          }
          for ( t in prevCpu.times ) {
            deltas[t] = currCpu.times[t] - prevCpu.times[t];
          }
        }

        prevCpus = currCpus;
        samples.push(deltas);

        if ( samples.length > 100) {
          samples.shift();
        }
      }, 100);
    }

    return new Promise((resolve, reject) => {
      resolve({
        hardware: {
          adapter: 'hardware',
          sensors: getSensors()
        }
      });
    });
  }

};
