<template>
  <div class="sensor-graph">
    <header><strong>{{ collection.label }}</strong> <span class="name">({{ collection.name }})</span> <span class="value">{{ collection.value }}</span></header>
    <chartist
      :type="collection.chart.type"
      :data="collection.chart.data"
      :options="collection.chart.options">
    </chartist>
  </div>
</template>

<style>
.sensor-graph .ct-line {
  stroke-width: 1px;
}
.sensor-graph .ct-point {
  stroke-width: 4px;
}
</style>

<script>

export default {
  props: ['collection'],

  data() {
    return this.collection;
  }
}

</script>
