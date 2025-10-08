<template>
  <div class="container">
    <span class="text">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'WithStyles',
  props: {
    label: {
      type: String,
      default: 'hello'
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
}
.text {
  color: red;
}
</style>
