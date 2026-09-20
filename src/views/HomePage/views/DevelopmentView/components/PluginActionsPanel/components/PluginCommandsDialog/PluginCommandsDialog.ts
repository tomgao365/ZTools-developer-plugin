import { ref, watch } from 'vue'
import { logError, logInfo, logWarn } from '@/utils/logger'
import { findInstalledPlugin } from '@/utils/host'
import type { HostInternalAccess, HostPluginCmd, HostPluginFeature } from '@/utils/host'

/** 指令对话框需要展示的插件信息。 */
export interface PluginCommandsDialogPlugin {
  /** 开发项目登记名称（不含 __dev 后缀）。 */
  name: string
  /** 对话框标题展示的插件标题。 */
  title: string
}

/** 点击可打开指令时向父层抛出的负载。 */
export interface PluginCommandSelectPayload {
  /** 指令所属的功能定义。 */
  feature: HostPluginFeature
  /** 被点击的具体指令。 */
  cmd: HostPluginCmd
}

/**
 * 指令列表对话框属性。
 */
export interface PluginCommandsDialogProps {
  /** 对话框是否可见。 */
  visible: boolean
  /** 当前查看指令列表的插件。 */
  plugin?: PluginCommandsDialogPlugin | null
}

/**
 * 指令列表对话框事件。
 */
export interface PluginCommandsDialogEmits {
  /** 同步对话框可见状态。 */
  (e: 'update:visible', visible: boolean): void
  /** 点击了某个可直接打开的文本指令。 */
  (e: 'select', payload: PluginCommandSelectPayload): void
}

/**
 * 读取指令对象的展示文案。
 */
function getCmdLabel(cmd: HostPluginCmd): string {
  if (typeof cmd === 'string') {
    return cmd
  }

  return cmd.label || cmd.regex || cmd.match || cmd.type || '未知指令'
}

/**
 * 读取指令的触发类型，字符串指令视为文本指令。
 */
function getCmdType(cmd: HostPluginCmd): string {
  return typeof cmd === 'string' ? 'text' : cmd.type || 'text'
}

/**
 * 获取非文本指令的类型徽标文案。
 */
function getCmdTypeBadge(cmd: HostPluginCmd): string {
  switch (getCmdType(cmd)) {
    case 'regex':
      return '正则'
    case 'over':
      return '匹配任意文本'
    case 'img':
      return '图片'
    case 'files':
      return '文件'
    case 'main':
      return '主搜'
    default:
      return ''
  }
}

/**
 * 提供指令列表对话框的数据加载与交互逻辑。
 */
export function usePluginCommandsDialog(
  props: PluginCommandsDialogProps,
  emit: PluginCommandsDialogEmits
) {
  /**
   * 当前插件安装记录中的功能指令列表。
   */
  const features = ref<HostPluginFeature[]>([])
  /**
   * 指令列表是否正在加载。
   */
  const isLoading = ref(false)
  /**
   * 加载失败或宿主能力缺失时的提示文案。
   */
  const loadError = ref('')

  /**
   * 解析宿主扩展接口。
   */
  const resolveHostInternal = (): HostInternalAccess | undefined => {
    // @ts-ignore
    return window.ztools?.internal
  }

  /**
   * 对话框打开时从宿主注册表读取当前插件的功能指令。
   */
  const loadCommands = async (): Promise<void> => {
    if (!props.plugin?.name) {
      features.value = []
      loadError.value = ''
      return
    }

    const hostInternal = resolveHostInternal()

    if (!hostInternal?.getAllPlugins) {
      logWarn('PluginCommandsDialog', '加载指令列表', '宿主未提供 getAllPlugins 能力')
      features.value = []
      loadError.value = '宿主服务不可用'
      return
    }

    isLoading.value = true
    loadError.value = ''

    try {
      const installed = await findInstalledPlugin(hostInternal, props.plugin.name)
      features.value = installed?.features ?? []
      logInfo(
        'PluginCommandsDialog',
        '加载指令列表',
        `插件 ${props.plugin.name} 共 ${features.value.length} 个功能`
      )
    } catch (error) {
      logError(
        'PluginCommandsDialog',
        '加载指令列表',
        `加载失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      features.value = []
      loadError.value = '指令列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 指令是否可以直接打开（仅文本指令可点击触发）。
   */
  const isCmdLaunchable = (cmd: HostPluginCmd): boolean => getCmdType(cmd) === 'text'

  /**
   * 点击指令标签时向父层抛出打开请求。
   */
  const handleSelectCmd = (feature: HostPluginFeature, cmd: HostPluginCmd): void => {
    if (!isCmdLaunchable(cmd)) {
      return
    }

    emit('select', { feature, cmd })
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        void loadCommands()
      }
    }
  )

  return {
    features,
    isLoading,
    loadError,
    getCmdLabel,
    getCmdTypeBadge,
    isCmdLaunchable,
    handleSelectCmd
  }
}
