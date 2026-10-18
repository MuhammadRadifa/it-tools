<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';

import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <div class="wordmark">
          <span class="name">it-tools</span>
          <span class="cursor" aria-hidden="true" />
        </div>
        <div class="subtitle">
          {{ $t('home.subtitle') }}
        </div>
      </RouterLink>

      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" flex flex-col items-center>
          <locale-selector w="90%" />

          <div flex justify-center>
            <NavbarButtons />
          </div>
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div>
            IT-Tools

            <c-link target="_blank" rel="noopener" :href="`https://github.com/CorentinTh/it-tools/tree/v${version}`">
              v{{ version }}
            </c-link>

            <template v-if="commitSha && commitSha.length > 0">
              -
              <c-link
                target="_blank"
                rel="noopener"
                type="primary"
                :href="`https://github.com/CorentinTh/it-tools/tree/${commitSha}`"
              >
                {{ commitSha }}
              </c-link>
            </template>
          </div>
          <div>
            © {{ new Date().getFullYear() }}
            <c-link target="_blank" rel="noopener" href="https://corentin.tech?utm_source=it-tools&utm_medium=footer">
              Corentin Thomasset
            </c-link>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div flex items-center justify-center gap-2>
        <c-button
          circle
          variant="text"
          :aria-label="$t('home.toggleMenu')"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <NIcon size="25" :component="Menu2" />
        </c-button>

        <c-tooltip :tooltip="$t('home.home')" position="bottom">
          <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
            <NIcon size="25" :component="Home2" />
          </c-button>
        </c-tooltip>

        <command-palette />

        <locale-selector v-if="!styleStore.isSmallScreen" />

        <div>
          <NavbarButtons v-if="!styleStore.isSmallScreen" />
        </div>
      </div>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
// ::v-deep(.n-layout-scroll-container) {
//     @percent: 4%;
//     @position: 25px;
//     @size: 50px;
//     @color: #eeeeee25;
//     background-image: radial-gradient(@color @percent, transparent @percent),
//         radial-gradient(@color @percent, transparent @percent);
//     background-position: 0 0, @position @position;
//     background-size: @size @size;
// }

.support-button {
  background: rgb(154, 52, 18);
  background: linear-gradient(48deg, rgba(154, 52, 18, 1) 0%, rgba(234, 88, 12, 1) 60%, rgba(249, 115, 22, 1) 100%);
  color: #fff !important;
  transition: padding ease 0.2s !important;

  &:hover {
    color: #fff;
    padding-left: 30px;
    padding-right: 30px;
  }
}

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 120px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  display: block;
  padding: 22px 20px 20px;
  text-decoration: none;
  background-color: v-bind('themeVars.cardColor');
  border-bottom: 1px solid v-bind('themeVars.dividerColor');

  .wordmark {
    display: flex;
    align-items: center;
    gap: 7px;

    .name {
      font-family: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: -0.03em;
      color: v-bind('themeVars.textColor1');
    }

    .cursor {
      width: 8px;
      height: 15px;
      background-color: v-bind('themeVars.primaryColor');
      animation: cursor-blink 1.2s step-end infinite;
    }

    &:hover .cursor {
      animation-play-state: paused;
    }
  }

  .subtitle {
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.4;
    color: v-bind('themeVars.textColor3');
  }

  @keyframes cursor-blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wordmark .cursor {
      animation: none;
    }
  }
}
</style>
