import Preferences from '../preferences.js';
import LM from 'lm_sensors.js';

export default {

  /**
   * Gets all sensors on adapter
   * @return {Object}
   */
  getAdapters() {
    const opts = {
      fahrenheit: Preferences.get('temperature') === 'fahrenheit'
    };

    return LM.sensors(opts);
  }

};
