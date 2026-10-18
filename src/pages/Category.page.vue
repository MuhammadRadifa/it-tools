<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ToolCard from '../components/ToolCard.vue';
import { useToolStore } from '@/tools/tools.store';

const route = useRoute();
const toolStore = useToolStore();
const { t } = useI18n();

const categoryName = computed(() => {
  const rawCategoryName = route.meta.category as string;
  return t(`tools.categories.${rawCategoryName.toLowerCase()}`, rawCategoryName);
});

const tools = computed(() => toolStore.tools.filter(tool => tool.category === categoryName.value));

useHead(computed(() => ({ title: `${categoryName.value} - IT Tools` })));
</script>

<template>
  <div class="pt-50px">
    <h3 class="mb-5px mt-25px text-neutral-400 font-500">
      {{ categoryName }}
    </h3>
    <div class="grid grid-cols-1 gap-12px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
      <ToolCard v-for="tool in tools" :key="tool.path" :tool="tool" />
    </div>
  </div>
</template>
