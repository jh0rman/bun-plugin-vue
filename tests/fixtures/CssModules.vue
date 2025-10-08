<template>
  <div :class="$style.container">
    <span :class="$style.text">CSS Modules work!</span>
  </div>
</template>

<script>
export default {
  name: 'CssModules'
}
</script>

<style module>
.container {
  display: flex;
}
.text {
  color: blue;
}
</style>
