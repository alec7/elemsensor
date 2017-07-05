<template>
  <div class="sensor-graph">
    <header>
      <div class="left">
        <span class="label">{{ collection.label }}</span>
        <span class="name">({{ collection.name }})</span>
      </div>
      <div class="right">
        <span class="value">{{ collection.data.values.join(' / ') }}</span>
        <span class="minmax">min : {{ collection.data.min.join(' / ') }}</span>
        <span class="minmax">max : {{ collection.data.max.join(' / ') }}</span>
      </div>
    </header>
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
