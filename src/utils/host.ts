/**
 * 开发项目在本地绑定中的状态。
 */
export type DevProjectLocalStatus = 'ready' | 'config_missing' | 'invalid_config' | 'unbound'

/**
 * 宿主环境暴露的开发项目结构。
 */
export interface HostDevProject {
  /**
   * 用于路由和查找的内部插件名称。
   */
  name: string
  /** 面向终端用户展示的标题。 */
  title: string
  /** 在工作台中展示的版本号。 */
  version: string
  /** 插件描述文案。 */
  description?: string
  /** 插件作者信息。 */
  author?: string
  /** 插件主页地址。 */
  homepage?: string
  /** 插件图标地址。 */
  logo?: string
  /** 插件所在的文件系统路径。 */
  path: string | null
  /** 当前设备绑定的配置文件路径。 */
  configPath: string | null
  /** 当前设备上的本地状态。 */
  localStatus: DevProjectLocalStatus
  /** 最近一次校验时间。 */
  lastValidatedAt?: string | null
  /** 最近一次校验错误。 */
  lastError?: string | null
  /** 插件是否正在运行。 */
  isRunning?: boolean
  /** 插件是否已安装为开发模式。 */
  isDevModeInstalled: boolean
  /** 插件安装时间。 */
  installedAt?: string
  /** 跨设备共享的展示顺序。 */
  sortOrder?: number
  /** 插件可运行平台列表，如 ["win32", "darwin"]。 */
  platform?: string[]
}

/**
 * 开发项目动作返回值。
 */
export interface HostActionResult {
  success: boolean
  error?: string
  pluginName?: string
}

/**
 * 当前工作台所需的最小宿主访问接口。
 */
export interface HostAccess {
  /**
   * 获取宿主当前已识别的插件列表。
   */
  getDevProjects(): Promise<HostDevProject[]>
  /**
   * 获取当前正在运行的插件路径列表。
   */
  getRunningPlugins(): Promise<string[]>
  /** 打开详情时按需校验项目绑定状态。 */
  validateDevProject?(pluginName: string): Promise<HostActionResult>
  /** 为开发项目重新选择配置文件。 */
  selectDevProjectConfig?(pluginName: string, configPath?: string): Promise<HostActionResult>
  /** 打包指定开发项目。 */
  packageDevProject?(pluginName: string, packagePath?: string, version?: string): Promise<HostActionResult>
}

/**
 * 通过 `window.ztools.internal` 暴露的扩展宿主接口。
 */
export interface HostInternalAccess extends HostAccess {
  /** 在系统文件管理器中定位插件目录。 */
  revealInFinder?(pluginPath: string): Promise<void>
  /** 导入开发中的插件配置。 */
  importDevPlugin?(pluginJsonPath?: string): Promise<HostActionResult>
  /** 根据 plugin.json 路径执行新建或更新当前设备绑定。 */
  upsertDevProjectByConfigPath?(pluginJsonPath: string): Promise<HostActionResult>
  /** 从开发项目列表中移除指定项目，但保留磁盘目录。 */
  removeDevProject?(pluginName: string): Promise<HostActionResult>
  /** 重载指定的开发模式插件。 */
  reloadDevProject?(pluginName: string): Promise<HostActionResult>
  /** 将当前工程安装为开发模式插件。 */
  installDevPlugin?(pluginName: string): Promise<HostActionResult>
  /** 将当前工程从开发模式卸载。 */
  uninstallDevPlugin?(pluginName: string): Promise<HostActionResult>
  /** 更新开发项目的共享展示顺序。 */
  updateDevProjectsOrder?(pluginNames: string[]): Promise<HostActionResult>
  /** 从模板创建开发项目。 */
  scaffoldDevProject?(params: ScaffoldDevProjectParams): Promise<ScaffoldDevProjectResult>
  /** 更新开发项目的登记元数据。 */
  updateDevProjectMeta?(projectName: string, meta: { title?: string; description?: string; platform?: string[]; author?: string }): Promise<HostActionResult>
  /** 获取宿主已安装的全部插件（含动态功能与归一化图标）。 */
  getAllPlugins?(): Promise<HostInstalledPlugin[]>
  /** 请求宿主打开指定插件或插件的某个功能命令。 */
  launch?(options: HostLaunchOptions): Promise<HostActionResult | void>
}

/** 从模板创建开发项目时使用的表单参数。 */
export interface ScaffoldDevProjectParams {
  template: 'vue-vite' | 'react-vite'
  projectPath: string
  name: string
  title: string
  description?: string
  platform?: string[]
  author?: string
}

/** 创建并导入开发项目后的操作结果。 */
export type ScaffoldDevProjectResult = HostActionResult & { pluginName?: string }

/**
 * 宿主插件注册表中开发模式安装插件的名称后缀。
 */
export const DEV_PLUGIN_SUFFIX = '__dev'

/**
 * plugin.json 中 features[].cmds 支持的指令形态。
 */
export type HostPluginCmd =
  | string
  | {
      type?: string
      label?: string
      match?: string
      regex?: string
      minLength?: number
      maxLength?: number
      fileType?: string
      extensions?: string[]
    }

/**
 * 宿主插件注册表中的功能指令定义。
 */
export interface HostPluginFeature {
  /** 功能唯一编码，打开指定功能时作为 featureCode 传给宿主。 */
  code: string
  /** 功能说明文案。 */
  explain?: string
  /** 功能图标（宿主已归一化为可访问路径）。 */
  icon?: string
  /** 触发该功能的指令列表。 */
  cmds: HostPluginCmd[]
}

/**
 * 宿主 getAllPlugins 返回的已安装插件记录（仅声明本插件用到的字段）。
 */
export interface HostInstalledPlugin {
  name: string
  title: string
  path: string
  logo?: string
  features?: HostPluginFeature[]
  isDevelopment?: boolean
}

/**
 * 宿主 internal.launch 打开插件功能时使用的参数。
 */
export interface HostLaunchOptions {
  /** 插件物理路径。 */
  path: string
  type: 'plugin'
  /** 功能编码；缺省时由宿主选择 plugin.json 配置的首个功能命令。 */
  featureCode?: string
  /** 展示用的指令名称。 */
  name?: string
  /** 指令类型。 */
  cmdType?: string
  /** 启动携带的参数。 */
  param?: { payload?: unknown; type?: string }
}

/**
 * 在宿主已安装插件列表中查找开发项目对应的安装记录。
 * 开发模式安装后的实际名称为 `基础名 + __dev`，同时兼容按基础名匹配。
 */
export async function findInstalledPlugin(
  host: HostInternalAccess | undefined,
  pluginName: string
): Promise<HostInstalledPlugin | null> {
  if (!host?.getAllPlugins) {
    return null
  }

  const plugins = await host.getAllPlugins()
  return (
    plugins.find((item) => item.name === `${pluginName}${DEV_PLUGIN_SUFFIX}`) ??
    plugins.find((item) => item.name === pluginName) ??
    null
  )
}

/**
 * 本地开发与测试阶段使用的兜底插件数据。
 */
const mockPlugins: HostDevProject[] = [
  {
    name: 'rabbit-screenshot',
    title: '兔灵截图工具',
    version: '1.0.0',
    description: '开发环境 mock 插件',
    author: 'xiaou',
    homepage: '',
    logo: '',
    path: '/mock/rabbit-screenshot',
    configPath: '/mock/rabbit-screenshot/plugin.json',
    localStatus: 'ready',
    lastValidatedAt: new Date().toISOString(),
    lastError: null,
    isRunning: false,
    isDevModeInstalled: true,
    installedAt: new Date().toISOString()
  }
]

/**
 * 创建带有兜底逻辑的宿主访问对象。
 * 优先使用显式传入的宿主，其次读取 `window.ztools.internal`，最后回退到本地 mock。
 */
export function createHostAccess(host?: HostInternalAccess): HostInternalAccess {
  const fallbackHost: HostInternalAccess = {
    async getDevProjects() {
      return mockPlugins
    },
    async getRunningPlugins() {
      return []
    }
  }

  if (host) {
    return host
  }

  const globalHost = typeof window !== 'undefined' ? window.ztools?.internal : undefined
  return globalHost ?? fallbackHost
}
