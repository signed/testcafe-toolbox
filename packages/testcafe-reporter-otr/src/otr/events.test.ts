import { expect, test } from '@jest/globals'
import { Clock } from './clock'
import {
  attachments,
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
import { environmentNamespace } from './environment'
import { browser } from './environment/browser'
import { environment } from './environment/environment'
import { eventsNamespace, EventsWriter, finished, intoString, started } from './events'
import { javaNamespace, javaVersion } from './java'
import { run, retryNamespace, data, link, entry } from './retry'
import { NamespaceRegistry } from './xml/xml'

test('events example', () => {
  const clock = new FixedTime(new Date(1664127808347))

  const namespaceRegistry = NamespaceRegistry.of(coreNamespace, {
    e: eventsNamespace,
    java: javaNamespace,
    r: retryNamespace,
    env: environmentNamespace,
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
          attachments((_) => {
            _.append(
              data((_) => {
                _.append(link('execution one'))
                _.append(entry('one', '1st content'))
                _.append(entry('two', '2nd content'))
              }),
            )
            _.append(
              data((_) => {
                _.append(link('execution two'))
                _.append(entry('three', '3rd content'))
                _.append(entry('four', '4th content'))
              }),
            )
          }),
        )
        .append(
          result('FLAKY', (_) => {
            _.append(
              environment('FLAKY', (_) => {
                _.append(browser('opera', '92.0.4561.43'))
                _.append(
                  run('FAILED', (execution) => {
                    execution.withId('execution one')
                  }),
                )
                _.append(
                  run('FAILED', (execution) => {
                    execution.withId('execution two')
                  }),
                )
                _.append(
                  run('SUCCESSFUL', (execution) => {
                    execution.withId('execution three')
                  }),
                )
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
