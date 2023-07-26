<template>
  <div>
    <chat-box></chat-box>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import chatBox from "~/components/chatBox.vue";

export default Vue.extend({
  components: { chatBox }
});
</script>
