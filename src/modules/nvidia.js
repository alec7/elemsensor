const BIN_FAN_SPEED = 'nvidia-settings -q all | grep  -i "Attribute \'GPUCurrentFanSpeedRPM\'" | cut -d : -f4 | cut -d . -f1 | xargs echo -n';

let supported = false;

export default {

  /**
   * Gets all sensors on adapter
   * @return {Object}
   */
  getAdapters() {
    return Promise.resolve(supported ? {
      nvidia: {
        adapter: 'nvidia',
        sensors: {
          gpu_speed: {
            sensor: 'clock',
            input: 0
          },
          gpu_usage: {
            sensor: 'usage',
            input: 0
          },
          mem_usage: {
            sensor: 'number',
            input: 0
          }
        }
      }
    } : {});
  }

};
