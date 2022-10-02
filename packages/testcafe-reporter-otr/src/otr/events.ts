import { createWriteStream } from 'fs'
import { createCB } from 'xmlbuilder2'
import { Context, Element, Namespace, NamespaceRegistry, QualifiedName, XmlEmitter } from './xml'

export const eventsNamespace = Namespace.of('https://schemas.opentest4j.org/reporting/events/0.1.0')

const constructNamespacesFrom = (context: Context) => {
  const eventsAttributes: Record<string, string> = {
    xmlns: context.namespaceRegistry.defaultNamespace.uri,
  }

  context.namespaceRegistry.additionalNamespaces.forEach((prefix, namespaceUri) => {
    eventsAttributes['xmlns:' + prefix] = namespaceUri
  })
  return eventsAttributes
}

export interface Writer {
  write(chunk: string): void
  close(): void
}

export const intoFile = (filename: string): Writer => {
  const outStream = createWriteStream(filename)

  return new (class implements Writer {
    write(chunk: string): void {
      outStream.write(chunk)
    }
    close(): void {
      outStream.close()
    }
  })()
}

export const intoString = (): Writer & { readonly xml: string } => {
  let xml = ''
  return new (class implements Writer {
    get xml() {
      return xml
    }
    write(chunk: string): void {
      xml += chunk
    }
    close(): void {
      // noting to close
    }
  })()
}

export class EventsWriter {
  private readonly namespaceRegistry: NamespaceRegistry
  private context: Context | undefined

  constructor(namespaceRegistry: NamespaceRegistry) {
    this.namespaceRegistry = namespaceRegistry
  }

  startEmitting(target: Writer) {
    const xmlBuilder = createCB({
      data: target.write,
      end: target.close,
      prettyPrint: true,
    })
    this.context = { xmlBuilder, namespaceRegistry: this.namespaceRegistry }
    const eventsAttributes = constructNamespacesFrom(this.context)
    xmlBuilder.dec().ele(eventsNamespace.uri, 'e:events', eventsAttributes)
    return this
  }

  append(emitter: XmlEmitter): this {
    if (this.context) {
      emitter(this.context)
    }
    return this
  }

  close() {
    if (this.context === undefined) {
      return
    }
    this.context.xmlBuilder.end()
  }
}

export class Started extends Element {
  static Element = QualifiedName.of(eventsNamespace, 'started')
  static Id = QualifiedName.of(eventsNamespace, 'id')
  static Name = QualifiedName.of(eventsNamespace, 'name')
  static Time = QualifiedName.of(eventsNamespace, 'time')
  static ParentId = QualifiedName.of(eventsNamespace, 'parentId')

  constructor(context: Context) {
    super(context, Started.Element)
  }

  withParentId(parentId: string) {
    this.withAttribute(Started.ParentId, parentId)
    return this
  }
}

export const started = (id: string, name: string, time: Date, consumer?: (started: Started) => void) => {
  return (context: Context) => {
    const started = new Started(context).openTag()
    started.withAttribute(Started.Id, id)
    started.withAttribute(Started.Name, name)
    started.withAttribute(Started.Time, time)
    consumer?.(started)
    started.closeTag()
  }
}

export class Finished extends Element {
  static Element = QualifiedName.of(eventsNamespace, 'finished')
  static Id = QualifiedName.of(eventsNamespace, 'id')
  static Time = QualifiedName.of(eventsNamespace, 'time')

  constructor(context: Context) {
    super(context, Finished.Element)
  }

  withId(id: string) {
    this.withAttribute(Finished.Id, id)
    return this
  }

  withTime(time: Date) {
    this.withAttribute(Finished.Time, time)
    return this
  }
}

export const finished = (id: string, time: Date, consumer?: (finished: Finished) => void) => {
  return (context: Context) => {
    const finished = new Finished(context).openTag()
    finished.withId(id)
    finished.withTime(time)
    consumer?.(finished)
    finished.closeTag()
  }
}
