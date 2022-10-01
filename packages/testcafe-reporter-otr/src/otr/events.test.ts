import { expect, test } from '@jest/globals'
import { coreNamespace, hostName, infrastructure, result, userName } from './core'
import { eventsNamespace, EventsWriter, finished, started } from './events'
import { javaNamespace, javaVersion } from './java'
import { NamespaceRegistry } from './xml'

test('events example', () => {
  const clock = new FixedTime(new Date(1664127808347))

  const namespaceRegistry = NamespaceRegistry.of(coreNamespace, { e: eventsNamespace, java: javaNamespace })
  const events = new EventsWriter(namespaceRegistry).startEmitting()

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
  events.append(finished('1', clock.now(), (finished) => finished.append(result('FAILED'))))
  events.close()
  expect(events.result).toMatchSnapshot()
})

export interface Clock {
  now(): Date
}

export class FixedTime implements Clock {
  private readonly _now: Date
  constructor(now: Date) {
    this._now = now
  }

  now() {
    return this._now
  }
}
