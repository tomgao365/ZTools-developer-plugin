<script setup lang="ts">
import type { PluginCommandsDialogEmits, PluginCommandsDialogProps } from './PluginCommandsDialog'
import { usePluginCommandsDialog } from './PluginCommandsDialog'

const props = defineProps<PluginCommandsDialogProps>()
const emit = defineEmits<PluginCommandsDialogEmits>()

const { features, isLoading, loadError, getCmdLabel, getCmdTypeBadge, isCmdLaunchable, handleSelectCmd } =
  usePluginCommandsDialog(props, emit)
</script>

<template>
  <el-dialog
    class="plugin-commands-dialog"
    :model-value="visible"
    :title="`指令列表 - ${plugin?.title || plugin?.name || ''}`"
    width="520px"
    append-to-body
    @update:model-value="emit('update:visible', Boolean($event))"
  >
    <div v-loading="isLoading" class="plugin-commands-dialog__body">
      <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon />
      <p v-else-if="!isLoading && features.length === 0" class="plugin-commands-dialog__empty">
        暂无指令
      </p>
      <ul v-else class="plugin-commands-dialog__list">
        <li v-for="feature in features" :key="feature.code" class="plugin-commands-dialog__feature">
          <div class="plugin-commands-dialog__feature-head">
            <img
              v-if="feature.icon"
              :src="feature.icon"
              alt="功能图标"
              class="plugin-commands-dialog__feature-icon"
            />
            <span class="plugin-commands-dialog__feature-explain">
              {{ feature.explain || feature.code }}
            </span>
          </div>
          <div class="plugin-commands-dialog__cmds">
            <span
              v-for="(cmd, index) in feature.cmds || []"
              :key="index"
              class="plugin-commands-dialog__cmd"
              :class="{
                'plugin-commands-dialog__cmd--clickable': isCmdLaunchable(cmd)
              }"
              role="button"
              tabindex="0"
              @click="handleSelectCmd(feature, cmd)"
              @keydown.enter.prevent="handleSelectCmd(feature, cmd)"
            >
              {{ getCmdLabel(cmd) }}
              <span v-if="getCmdTypeBadge(cmd)" class="plugin-commands-dialog__cmd-badge">
                {{ getCmdTypeBadge(cmd) }}
              </span>
            </span>
          </div>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>

<style scoped lang="less">
.plugin-commands-dialog__body {
  display: flex;
  min-height: 120px;
  max-height: 360px;
  overflow-y: auto;
  flex-direction: column;
}

.plugin-commands-dialog__empty {
  margin: auto;
  color: var(--u-color-text-3);
  font-size: 13px;
}

.plugin-commands-dialog__list {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: 14px;
  list-style: none;
}

.plugin-commands-dialog__feature-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plugin-commands-dialog__feature-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: contain;
}

.plugin-commands-dialog__feature-explain {
  color: var(--u-color-text-1);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.plugin-commands-dialog__cmds {
  display: flex;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.plugin-commands-dialog__cmd {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border: 1px solid var(--u-color-border-1);
  border-radius: 999px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-2);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.plugin-commands-dialog__cmd--clickable {
  border-color: color-mix(in srgb, var(--u-color-primary-6) 36%, var(--u-color-border-1));
  color: var(--u-color-primary-6);
  cursor: pointer;
}

.plugin-commands-dialog__cmd--clickable:hover {
  background: color-mix(in srgb, var(--u-color-primary-6) 12%, transparent);
}

.plugin-commands-dialog__cmd-badge {
  color: var(--u-color-text-3);
  font-size: 11px;
}
</style>
