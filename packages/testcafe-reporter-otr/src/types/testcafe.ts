export type TestStartInfo = {
  testId: string
  testRunIds: string[]
  startTime: string
  skipped: boolean
}

export type TestCafeActionInfo = {
  browser: BrowserInfo
  duration?: number
  err?: Error
  test: {
    name: string
    phase: TestPhase
    id: string
  }
  testRunId: string
}

export type decoratorFn = (str: string) => string

export type ReporterPluginHost = {
  indentString(str: string, indentVal: number): string
  wordWrap(str: string, indentVal: number, width: number): string
  escapeHtml(str: string): string
  newline(): ReporterPluginHost
  write(text: string): ReporterPluginHost
  useWordWrap(use: boolean): ReporterPluginHost
  setIndent(val: number): ReporterPluginHost
}

export type TaskResult = {
  failedCount: number
  passedCount: number
  skippedCount: number
}

export type ReporterMethods = {
  init?: (this: ReporterPluginHost) => Promise<void>
  reportTaskStart: (
    this: ReporterPluginHost,
    startTime: Date,
    userAgents: string[],
    testCount: number,
    taskStructure: ReportedTestStructureItem[],
  ) => Promise<void>
  reportFixtureStart: (this: ReporterPluginHost, name: string, path: string, meta: Meta) => Promise<void>
  reportTestStart?: (this: ReporterPluginHost, name: string, meta: Meta, testStartInfo: TestStartInfo) => Promise<void>
  reportTestActionStart?: (
    this: ReporterPluginHost,
    apiActionName: string,
    actionInfo: TestCafeActionInfo,
  ) => Promise<void>
  reportTestActionDone?: (
    this: ReporterPluginHost,
    apiActionName: string,
    actionInfo: TestCafeActionInfo,
  ) => Promise<void>
  reportTestDone: (this: ReporterPluginHost, name: string, testRunInfo: TestRunInfo, meta?: Meta) => Promise<void>
  reportTaskDone: (
    this: ReporterPluginHost,
    endTime: Date,
    passed: number,
    warnings: string[],
    result: TaskResult,
  ) => Promise<void>
  reportWarnings: (this: ReporterPluginHost, warnings: Warning) => Promise<void>
}

export type ReporterPluginObject = ReporterMethods & {
  noColors: boolean
  createErrorDecorator(): Record<string, decoratorFn>
  getReportUrl(): string
}

export type BrowserInfo = {
  alias: string
  engine: { name: string; version: string }
  headless: boolean
  name: string
  os: { name: string; version: string }
  platform: string
  prettyUserAgent: string
  userAgent: string
  version: string
}

export type Error = {
  apiFnChain?: string[]
  apiFnIndex?: number
  callsite: {
    filename: string
    lineNum: number
    callsiteFrameIdx: number
    stackFrames: any[]
    isV8Frames: boolean
  }
  code: string
  errMsg: string
  isTestCafeError: boolean
  screenshotPath: string
  testRunId: string
  testRunPhase: string
  userAgent: string
  id?: string
}

export type TestRunInfo = {
  browsers: (BrowserInfo & { testRunId: string })[]
  durationMs: number
  errs: Error[]
  quarantine: Quarantine | null
  screenshotPath: string | null
  screenshots: Screenshot[]
  skipped: boolean
  testId: string
  unstable: boolean
  videos: Video[]
  warnings: string[]
}

export type Meta = Record<string, string>

export type Quarantine = {
  [key: number]: {
    passed: boolean
  }
}

export type Screenshot = Readonly<{
  testRunId: string
  screenshotPath: string
  thumbnailPath: string
  userAgent: string
  quarantineAttempt: number
  takenOnFail: boolean
  screenshotData?: Buffer
}>

export type Video = Readonly<{
  userAgent: string
  videoPath: string
  testRunId: string
}>

export type Warning = {
  message: string
  testRunId?: string
}

export enum TestPhase {
  initial = 'initial',
  inFixtureBeforeHook = 'inFixtureBeforeHook',
  inFixtureBeforeEachHook = 'inFixtureBeforeEachHook',
  inTestBeforeHook = 'inTestBeforeHook',
  inTest = 'inTest',
  inTestAfterHook = 'inTestAfterHook',
  inFixtureAfterEachHook = 'inFixtureAfterEachHook',
  inFixtureAfterHook = 'inFixtureAfterHook',
  inRoleInitializer = 'inRoleInitializer',
  inBookmarkRestore = 'inBookmarkRestore',
}

export type ReportedTestItem = {
  readonly id: string
  readonly name: string
  readonly skip: boolean
}

export type ReportedFixtureItem = {
  readonly id: string
  readonly name: string
  readonly tests: ReportedTestItem[]
}

export type ReportedTestStructureItem = {
  readonly fixture: ReportedFixtureItem
}
