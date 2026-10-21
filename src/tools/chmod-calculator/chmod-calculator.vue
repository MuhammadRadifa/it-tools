<script setup lang="ts">
import { useThemeVars } from 'naive-ui';

import InputCopyable from '../../components/InputCopyable.vue';
import TextareaCopyable from '../../components/TextareaCopyable.vue';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation, generatePermissionScript, parsePermissionInput } from './chmod-calculator.service';
import type { Group, Scope } from './chmod-calculator.types';
import { useValidation } from '@/composable/validation';

const themeVars = useThemeVars();

const scopes: { scope: Scope; title: string }[] = [
  { scope: 'read', title: 'Read (4)' },
  { scope: 'write', title: 'Write (2)' },
  { scope: 'execute', title: 'Execute (1)' },
];
const groups: Group[] = ['owner', 'group', 'public'];

const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
const symbolic = computed(() => computeChmodSymbolicRepresentation({ permissions: permissions.value }));

const modeInput = ref('drwxr-xr-x');
const parsed = computed(() => parsePermissionInput(modeInput.value));
const hasSpecialBits = computed(() => parsed.value !== null && Object.values(parsed.value.specialBits).some(Boolean));

const modeValidation = useValidation({
  source: modeInput,
  rules: [
    {
      message: 'Invalid permission string, expected something like drwxr-xr-x, rwxr-xr-x or 755',
      validator: value => value.trim() === '' || parsePermissionInput(value) !== null,
    },
  ],
});

const parsedItems = computed(() => {
  if (parsed.value === null) {
    return [];
  }

  const { descriptions, specialDescription, typeLabel, symbolic: symbolicMode, octal: octalMode } = parsed.value;
  const digits = octalMode.slice(-3);

  return [
    { label: 'Type', value: typeLabel, showCopyButton: false },
    { label: 'Symbolic', value: symbolicMode, showCopyButton: false },
    { label: 'Owner (u)', value: `${symbolicMode.slice(0, 3)} (${digits[0]}) - ${descriptions.owner}`, showCopyButton: false },
    { label: 'Group (g)', value: `${symbolicMode.slice(3, 6)} (${digits[1]}) - ${descriptions.group}`, showCopyButton: false },
    { label: 'Others (o)', value: `${symbolicMode.slice(6, 9)} (${digits[2]}) - ${descriptions.public}`, showCopyButton: false },
    { label: 'Special bits', value: specialDescription ?? undefined, showCopyButton: false, hideOnNil: true },
  ];
});

function applyParsedPermissions() {
  if (parsed.value === null) {
    return;
  }

  permissions.value = {
    owner: { ...parsed.value.permissions.owner },
    group: { ...parsed.value.permissions.group },
    public: { ...parsed.value.permissions.public },
  };
}

const targetType = ref<'file' | 'folder'>('file');
const targetPath = ref('/path/to/file');
const owner = ref('www-data');
const groupName = ref('www-data');
const recursive = ref(true);
const useSudo = ref(true);

watch(targetType, (type) => {
  if (['', '/path/to/file', '/path/to/folder'].includes(targetPath.value.trim())) {
    targetPath.value = type === 'folder' ? '/path/to/folder' : '/path/to/file';
  }
});

const script = computed(() =>
  generatePermissionScript({
    octal: octal.value,
    path: targetPath.value,
    isDirectory: targetType.value === 'folder',
    recursive: recursive.value,
    sudo: useSudo.value,
    owner: owner.value,
    group: groupName.value,
  }),
);
</script>

<template>
  <div>
    <n-table :bordered="false" :bottom-bordered="false" single-column class="permission-table">
      <thead>
        <tr>
          <th class="text-center" scope="col" />
          <th class="text-center" scope="col">
            Owner (u)
          </th>
          <th class="text-center" scope="col">
            Group (g)
          </th>
          <th class="text-center" scope="col">
            Public (o)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ scope, title } of scopes" :key="scope">
          <td class="line-header">
            {{ title }}
          </td>
          <td v-for="group of groups" :key="group" class="text-center">
            <!-- <n-switch v-model:value="permissions[group][scope]" /> -->
            <n-checkbox v-model:checked="permissions[group][scope]" size="large" />
          </td>
        </tr>
      </tbody>
    </n-table>

    <div class="octal-result">
      {{ octal }}
    </div>
    <div class="octal-result">
      {{ symbolic }}
    </div>

    <InputCopyable :value="`chmod ${octal} path`" readonly />

    <n-divider />

    <h3 class="section-title">
      Permission converter
    </h3>
    <p class="section-hint">
      Paste an <code>ls -l</code> entry like <code>drwxr-xr-x</code>, a symbolic mode like
      <code>rwxr-xr-x</code> or an octal mode like <code>755</code> to see what it means.
    </p>

    <c-input-text
      v-model:value="modeInput"
      placeholder="drwxr-xr-x"
      clearable
      monospace
      :validation="modeValidation"
    />

    <div v-if="parsed !== null" class="converter-result">
      <div class="octal-result">
        {{ parsed.octal }}
      </div>
      <div class="symbolic-result">
        {{ parsed.symbolic }}
      </div>

      <c-key-value-list :items="parsedItems" my-4 />

      <div class="converter-actions">
        <c-button v-if="!hasSpecialBits" @click="applyParsedPermissions">
          Use these permissions
        </c-button>
        <InputCopyable :value="`chmod ${parsed.octal} path`" readonly />
      </div>
    </div>

    <n-divider />

    <h3 class="section-title">
      chmod &amp; chown script
    </h3>
    <p class="section-hint">
      Generate a ready-to-run script from the permissions selected above, for a file or a whole folder.
    </p>

    <div class="script-options">
      <c-buttons-select
        v-model:value="targetType"
        label="Target"
        :options="[
          { label: 'File', value: 'file' },
          { label: 'Folder', value: 'folder' },
        ]"
      />
      <n-checkbox v-model:checked="recursive" :disabled="targetType !== 'folder'">
        Recursive (-R)
      </n-checkbox>
      <n-checkbox v-model:checked="useSudo">
        Use sudo
      </n-checkbox>
    </div>

    <div class="script-fields">
      <c-input-text v-model:value="targetPath" label="Path" placeholder="/var/www/html" monospace />
      <c-input-text v-model:value="owner" label="Owner" placeholder="www-data" monospace />
      <c-input-text v-model:value="groupName" label="Group" placeholder="www-data" monospace />
    </div>

    <TextareaCopyable :value="script" language="txt" mt-4 />
  </div>
</template>

<style lang="less" scoped>
.octal-result {
  text-align: center;
  font-size: 50px;
  font-family: monospace;
  color: v-bind('themeVars.primaryColor');
  margin: 20px 0;
}
.permission-table {
  td,
  th {
    padding: 15px;

    @media screen and (max-width: 600px) {
      padding: 5px;
    }
  }
}
.line-header {
  font-weight: bold;
  text-align: right;
  max-width: 80px;
}
.text-center {
  text-align: center;
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
.section-hint {
  margin-bottom: 12px;
  opacity: 0.8;
}
.converter-result {
  margin-top: 16px;

  .octal-result {
    margin-bottom: 0;
  }
}
.symbolic-result {
  text-align: center;
  font-size: 30px;
  font-family: monospace;
  opacity: 0.8;
  margin-bottom: 20px;
}
.converter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  & > :first-child {
    flex: 0 0 auto;
  }

  & > :last-child {
    flex: 1 1 220px;
    max-width: 400px;
  }
}
.script-options {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.script-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media screen and (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
  }
}
</style>
