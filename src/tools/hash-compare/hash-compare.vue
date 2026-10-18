<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import InputCopyable from '../../components/InputCopyable.vue';
import type { HashAlgorithmName, HashEncoding } from './hash-compare.service';
import { computeHash, hashAlgorithms, isHashMatching } from './hash-compare.service';
import { useQueryParam } from '@/composable/queryParams';

const themeVars = useThemeVars();

const algorithm = useQueryParam<HashAlgorithmName>({ defaultValue: 'SHA256', name: 'algorithm' });
const encoding = useQueryParam<HashEncoding>({ defaultValue: 'Hex', name: 'encoding' });

const text = ref('');
const expectedHash = ref('');

const hasExpectedHash = computed(() => expectedHash.value.length > 0);

const computedHash = computed(() => computeHash({ text: text.value, algorithm: algorithm.value, encoding: encoding.value }));
const isMatch = computed(() => isHashMatching({ text: text.value, expectedHash: expectedHash.value, algorithm: algorithm.value, encoding: encoding.value }));

const algorithmOptions = (Object.keys(hashAlgorithms) as HashAlgorithmName[]).map(name => ({ label: name, value: name }));

const encodingOptions = [
  {
    label: 'Hexadecimal (base 16)',
    value: 'Hex',
  },
  {
    label: 'Binary (base 2)',
    value: 'Bin',
  },
  {
    label: 'Base64 (base 64)',
    value: 'Base64',
  },
  {
    label: 'Base64url (base 64 with url safe chars)',
    value: 'Base64url',
  },
];
</script>

<template>
  <div>
    <c-card title="Hash compare">
      <c-input-text
        v-model:value="text"
        label="Your text: "
        placeholder="Your text to compare..."
        raw-text autosize autofocus multiline
        rows="3"
      />

      <c-input-text
        v-model:value="expectedHash"
        label="Hash to compare: "
        placeholder="Your hash to compare..."
        raw-text mt-4
        test-id="hash-to-compare"
      />

      <div mt-4 flex gap-4>
        <c-select
          v-model:value="algorithm"
          label="Hashing algorithm"
          :options="algorithmOptions"
        />
        <c-select
          v-model:value="encoding"
          label="Digest encoding"
          :options="encodingOptions"
        />
      </div>

      <n-divider />

      <n-form label-width="140">
        <n-form-item v-if="hasExpectedHash" label="Do they match? " label-placement="left" :show-feedback="false">
          <div class="compare-result" :class="{ positive: isMatch }" data-test-id="compare-result">
            {{ isMatch ? 'Yes' : 'No' }}
          </div>
        </n-form-item>

        <n-form-item label="Computed hash: " label-placement="left" :show-feedback="false">
          <InputCopyable :value="computedHash" readonly />
        </n-form-item>
      </n-form>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.compare-result {
  color: v-bind('themeVars.errorColor');

  &.positive {
    color: v-bind('themeVars.successColor');
  }
}
</style>
