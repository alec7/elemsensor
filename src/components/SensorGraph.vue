<template>
  <div class="sensor-graph">
    <header>
      <div class="left">
        <span class="label">{{ collection.label }}</span>
      </div>
      <div class="right">
        <table v-if="collection.data.count > 0">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th v-for="name in collection.data.names">{{ name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>cur</td>
              <td v-for="value in collection.data.values">{{ value }}</td>
            </tr>
            <tr>
              <td>min</td>
              <td v-for="value in collection.data.min">{{ value }}</td>
            </tr>
            <tr>
              <td>max</td>
              <td v-for="value in collection.data.max">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </header>
    <chartist
      v-if="collection.data.count > 0"
      :type="collection.chart.type"
      :data="collection.chart.data"
      :options="collection.chart.options">
    </chartist>
  </div>
</template>

<script>

export default {
  props: ['collection'],

  data() {
    return this.collection;
  }
}

</script>
