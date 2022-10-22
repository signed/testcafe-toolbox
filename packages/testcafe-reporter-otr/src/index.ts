import { Clock, SystemTime } from './otr/clock'
import { coreNamespace, fileSource, hostName, infrastructure, result, sources, Status, userName } from './otr/core'

import { eventsNamespace, EventsWriter, finished, started, Writer } from './otr/events'
import { run, retryNamespace } from './otr/retry'
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

const toStatus = (testRunInfo: TestRunInfo): Status => {
  if (testRunInfo.skipped) {
    return 'SKIPPED'
  }
  if (testRunInfo.errs.length > 0) {
    return 'FAILED'
  }
  return 'SUCCESSFUL'
}

type Test = {
  start: Date
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
  //should contain artifacts from the execution like
  //- screenshot
  //- video
  //- stacktrace
  //- assertion error
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
      tests.set(testId, { start, environments: [] })
      events.append(started(testId, name, start, (_) => _.withParentId(currentFixtureId)))
    },
    reportTestDone: async function (name: string, testRunInfo: TestRunInfo, _meta?: Meta) {
      const testId = testRunInfo.testId
      const test = tests.get(testId)
      if (test === undefined) {
        throw new Error(`no test data found for test "${testId}"`)
      }
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

          environment.runs.push({ id, status, reason })
        })
        return environment
      })
      test.environments.push(...environments)

      events.append(
        finished(testId, end, (finished) => {
          finished.append(
            result(toStatus(testRunInfo), (_) => {
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
