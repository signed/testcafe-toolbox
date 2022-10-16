import { expect, test } from '@jest/globals'
import { Clock } from './clock'
import {
  coreNamespace,
  directorySource,
  filePosition,
  fileSource,
  hostName,
  infrastructure,
  metadata,
  result,
  sources,
  tag,
  tags,
  userName,
} from './core'
import { eventsNamespace, EventsWriter, finished, intoString, started } from './events'
import { javaNamespace, javaVersion } from './java'
import { execution, retryNamespace } from './retry'
import { NamespaceRegistry } from './xml/xml'

test('events example', () => {
  const clock = new FixedTime(new Date(1664127808347))

  const namespaceRegistry = NamespaceRegistry.of(coreNamespace, {
    e: eventsNamespace,
    java: javaNamespace,
    r: retryNamespace,
  })
  const target = intoString()
  const events = new EventsWriter(namespaceRegistry).startEmitting(target)

  // prettier-ignore
  events.append(infrastructure((_) => _
            .append(hostName('wonderland'))
            .append(userName('alice'))
            .append(javaVersion('1.8'))
        )
    );
  events.append(started('1', 'container', clock.now()))
  events.append(started('2', 'test', clock.now(), (started) => started.withParentId('1')))
  events.append(finished('2', clock.now(), (finished) => finished.append(result('FAILED'))))
  events.append(
    finished('1', clock.now(), (finished) => {
      finished
        .append(
          metadata((metadata) => {
            metadata.append(
              tags((tags) => {
                tags.append(tag('one'))
                tags.append(tag('two'))
                tags.append(tag('three'))
              }),
            )
          }),
        )
        .append(
          sources((_) =>
            _.append(directorySource('/tmp/directory')).append(
              fileSource('/tmp/screenshot.png', (fileSource) => {
                fileSource.append(filePosition(42, 17))
              }),
            ),
          ),
        )
        .append(
          result('FLAKY', (_) => {
            _.append(
              execution('FAILED', (execution) => {
                execution.withId('execution one')
              }),
            )
            _.append(
              execution('FAILED', (execution) => {
                execution.withId('execution two')
              }),
            )
            _.append(
              execution('SUCCESSFUL', (execution) => {
                execution.withId('execution three')
              }),
            )
          }),
        )
    }),
  )
  events.close()
  expect(target.xml).toMatchSnapshot()
})

export class FixedTime implements Clock {
  private readonly _now: Date

  constructor(now: Date) {
    this._now = now
  }

  now() {
    return this._now
  }
}
