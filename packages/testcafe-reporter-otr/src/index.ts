import { Clock, SystemTime } from './otr/clock'
import {
  attachments,
  coreNamespace,
  fileSource,
  hostName,
  infrastructure,
  result,
  sources,
  Status,
  userName,
} from './otr/core'

import { eventsNamespace, EventsWriter, finished, started, Writer } from './otr/events'
import { run, retryNamespace, data, link, entry } from './otr/retry'
import { reason } from './otr/retry/run'
import { NamespaceRegistry } from './otr/xml/xml'

import {
  Meta,
  ReportedTestStructureItem,
  ReporterPluginHost,
  ReporterPluginObject,
  TestRunInfo,
  TestStartInfo,
} from './types/testcafe'

const intoReporterPlugin = (host: ReporterPluginHost): Writer => {
  return new (class implements Writer {
    write(chunk: string): void {
      host.write(chunk)
    }

    close(): void {
      // do nothing
    }
  })()
}

const clock: Clock = new SystemTime()

const toStatus = (test: Test): Status => {
  if (test.skipped) {
    return 'SKIPPED'
  }
  if (test.flaky) {
    return 'FLAKY'
  }
  if (test.failed) {
    return 'FAILED'
  }
  return 'SUCCESSFUL'
}

type Test = {
  start: Date
  skipped: boolean
  flaky: boolean
  failed: boolean
  environments: Environment[]
}

type Environment = {
  name: string
  runs: TestRun[]
}

type TestRun = {
  id: string
  status: Status
  reason?: string
  screenshotPath?: string
  //should contain artifacts from the run like
  //- video
  //- stacktrace
  //- assertion error
}

type Attachment = {
  runId: string
  screenshotPath: string
}

const attachmentsFrom = (test: Test): Attachment[] => {
  return test.environments.reduce((acc: Attachment[], environment) => {
    const newAttachments = environment.runs.reduce((att: Attachment[], run) => {
      if (run.screenshotPath) {
        const newAttachment = { runId: run.id, screenshotPath: run.screenshotPath }
        return [...att, newAttachment]
      }
      return att
    }, [])
    return [...acc, ...newAttachments]
  }, [])
}

module.exports = function pluginFactory(): ReporterPluginObject {
  const tests = new Map<string, Test>()
  const fixtureNameToFixtureId = new Map<string, string>()
  let events: EventsWriter
  let currentFixtureId: string

  return {
    noColors: true,
    init: async function () {
      const namespaceRegistry = NamespaceRegistry.of(coreNamespace, { e: eventsNamespace, r: retryNamespace })
      events = new EventsWriter(namespaceRegistry).startEmitting(intoReporterPlugin(this))
      events.append(infrastructure((_) => _.append(hostName('wonderland')).append(userName('alice'))))
    },
    reportTaskStart: async function (
      startTime: Date,
      userAgents: string[],
      testCount: number,
      taskStructures: ReportedTestStructureItem[],
    ) {
      taskStructures.forEach((taskStructure) => {
        const fixtureName = taskStructure.fixture.name
        const fixtureId = taskStructure.fixture.id
        if (fixtureNameToFixtureId.has(fixtureName)) {
          throw new Error(`duplicate fixture name: ${fixtureName}`)
        }
        fixtureNameToFixtureId.set(fixtureName, fixtureId)
      })
    },
    reportFixtureStart: async function (name: string, path: string, _meta: Meta) {
      if (currentFixtureId !== undefined) {
        events.append(finished(currentFixtureId, clock.now()))
      }
      const id = fixtureNameToFixtureId.get(name as any)
      if (id === undefined) {
        throw new Error(`no fixture id for fixture "${name}"`)
      }
      currentFixtureId = id
      events.append(
        started(id, name, clock.now(), (started) => {
          started.append(sources((sources) => sources.append(fileSource(path))))
        }),
      )
    },
    reportTestStart: async function (name: string, meta: Meta, testStartInfo: TestStartInfo) {
      const start = new Date(testStartInfo.startTime)
      const testId = testStartInfo.testId
      const skipped = testStartInfo.skipped
      const flaky = false
      const failed = false
      tests.set(testId, { start, environments: [], skipped, flaky, failed })
      events.append(started(testId, name, start, (_) => _.withParentId(currentFixtureId)))
    },
    reportTestDone: async function (name: string, testRunInfo: TestRunInfo, _meta?: Meta) {
      const testId = testRunInfo.testId
      const test = tests.get(testId)
      if (test === undefined) {
        throw new Error(`no test data found for test "${testId}"`)
      }
      test.flaky = testRunInfo.unstable
      test.skipped = testRunInfo.skipped
      test.failed = testRunInfo.errs.length > 0
      const end = new Date(test.start.getTime() + testRunInfo.durationMs)
      const environments = testRunInfo.browsers.map((browser) => {
        const environment: Environment = { name: browser.name, runs: [] }

        browser.quarantineAttemptsTestRunIds?.forEach((runId) => {
          const quarantineContainer = testRunInfo.quarantine
          if (quarantineContainer === null) {
            throw new Error('quarantine not present, although quarantineAttemptsTestRunIds are. Should not happen')
          }
          const quarantine = quarantineContainer[runId]
          const status: Status = quarantine.passed ? 'SUCCESSFUL' : 'FAILED'
          const id = runId
          let reason = undefined
          if (quarantine.errors.length > 0) {
            const error = quarantine.errors[0]
            reason = error.errMsg
          }
          const failScreenshot = testRunInfo.screenshots.find((screenshot) => {
            return screenshot.testRunId === runId && screenshot.takenOnFail
          })
          let screenshotPath
          if (failScreenshot) {
            screenshotPath = failScreenshot.screenshotPath
          }
          environment.runs.push({ id, status, reason, screenshotPath })
        })
        return environment
      })
      test.environments.push(...environments)

      events.append(
        finished(testId, end, (finished) => {
          const createdAttachments = attachmentsFrom(test)
          if (createdAttachments.length > 0) {
            finished.append(
              attachments((_) => {
                createdAttachments.forEach((attachment) => {
                  _.append(
                    data((_) => {
                      _.append(link(attachment.runId))
                      _.append(entry('failScreenshotPath', attachment.screenshotPath))
                    }),
                  )
                })
              }),
            )
          }
          finished.append(
            result(toStatus(test), (_) => {
              test.environments.forEach((environment) => {
                environment.runs.forEach((testRun) => {
                  _.append(
                    run(testRun.status, (run) => {
                      run.withId(testRun.id)
                      if (testRun.reason) {
                        run.append(reason(testRun.reason))
                      }
                    }),
                  )
                })
              })
            }),
          )
        }),
      )
    },
    reportTaskDone: async function () {
      events.append(finished(currentFixtureId, clock.now()))
      events.close()
    },
    reportWarnings: async function () {},
    createErrorDecorator: () => ({}),
    getReportUrl: () => '',
  }
}
