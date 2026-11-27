<script setup>
import { useUiStore } from '@/stores/ui';
import BaseModal from '@/components/BaseModal.vue';

const ui = useUiStore();
</script>

<template>
  <BaseModal
    v-if="ui.lightbox.open"
    modal-class="modal--image"
    :label="ui.lightbox.alt || '菜谱图片'"
    @close="ui.closeLightbox()"
  >
    <div class="image-lightbox">
      <img :src="ui.lightbox.src" :alt="ui.lightbox.alt" />
      <p>{{ ui.lightbox.alt }}</p>
    </div>
  </BaseModal>
</template>
