<template>
  <div class="dashboard">
    <ul>
      <sensor-monitor
        v-for="(collection, index) in collections"
        :key="collection.name"
        v-bind:collection="collection"
        v-bind:index="index">
      </sensor-monitor>
    </ul>
  </div>
</template>

<script>
  import SensorMonitor from './SensorMonitor.vue';

  import monitor from '../monitor.js';

  export default {
    components: {
      SensorMonitor
    },

    mounted() {
      monitor.start((result) => {
        this.collections = result;
      });
    },

    destroyed() {
      monitor.stop();
    },

    data() {
      return {
        collections: []
      };
    }

  }
</script>
