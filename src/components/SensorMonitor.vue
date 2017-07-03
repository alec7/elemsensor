<template>
  <li v-on:contextmenu="contextmenu" :class="collection.className">
    <sensor-graph v-bind:collection="collection"></sensor-graph>
  </li>
</template>

<script>

import SensorGraph from './SensorGraph.vue';
import Sensor from '../sensor.js';

export default {
  props: ['collection', 'index'],

  components: {
    SensorGraph
  },

  methods: {
    contextmenu: function() {
      return Sensor.createContextMenu(this.index, this.collection);
    }
  }
}

</script>
