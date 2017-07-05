<template>
  <li v-on:contextmenu="contextmenu" :class="collection.className">
    <sensor-graph v-bind:collection="collection"></sensor-graph>
  </li>
</template>

<script>

import SensorGraph from './SensorGraph.vue';
import SensorCollection from '../sensorcollection.js';

export default {
  props: ['collection', 'index'],

  components: {
    SensorGraph
  },

  methods: {
    contextmenu: function() {
      return SensorCollection.createContextMenu(this.index, this.collection);
    }
  }
}

</script>
