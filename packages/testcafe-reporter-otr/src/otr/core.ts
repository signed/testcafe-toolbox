import { Context, Element, Namespace, QualifiedName } from './xml'

export const coreNamespace = Namespace.of('https://schemas.opentest4j.org/reporting/core/0.1.0')

const statuses = ['SKIPPED', 'ABORTED', 'SUCCESSFUL', 'FAILED'] as const
export type Status = typeof statuses[number]

class Infrastructure extends Element {
  static Element = QualifiedName.of(coreNamespace, 'infrastructure')

  constructor(context: Context) {
    super(context, Infrastructure.Element)
  }
}

export const infrastructure = (consumer: (infrastructure: Infrastructure) => void) => {
  return (context: Context) => {
    const infrastructure = new Infrastructure(context).openTag()
    consumer?.(infrastructure)
    infrastructure.closeTag()
  }
}

class HostName extends Element {
  static Element = QualifiedName.of(coreNamespace, 'hostName')

  constructor(context: Context) {
    super(context, HostName.Element)
  }
}

export const hostName = (hostname: string) => {
  return (context: Context) => {
    const hostName = new HostName(context).openTag()
    hostName.withContent(hostname)
    hostName.closeTag()
  }
}

class UserName extends Element {
  static Element = QualifiedName.of(coreNamespace, 'userName')

  constructor(context: Context) {
    super(context, UserName.Element)
  }
}

export const userName = (userName: string) => {
  return (context: Context) => {
    const hostName = new UserName(context).openTag()
    hostName.withContent(userName)
    hostName.closeTag()
  }
}

class Result extends Element {
  static Element = QualifiedName.of(coreNamespace, 'result')
  static Status = QualifiedName.of(coreNamespace, 'status')

  constructor(context: Context) {
    super(context, Result.Element)
  }
}

export const result = (status: Status) => {
  return (context: Context) => {
    const result = new Result(context).openTag()
    result.withAttribute(Result.Status, status)
    context.xmlBuilder.up()
  }
}

export interface Clock {
  now(): Date
}

export class SystemTime implements Clock {
  now(): Date {
    return new Date()
  }
}

class Source extends Element {
  static readonly Element = QualifiedName.of(coreNamespace, 'source')

  constructor(context: Context) {
    super(context, Source.Element)
  }
}

export const source = (consumer: (source: Source) => void) => {
  return (context: Context) => {
    const source = new Source(context).openTag()
    consumer(source)
    source.closeTag()
  }
}

class DirectorySource extends Element {
  private static readonly Element = QualifiedName.of(coreNamespace, 'directorySource')
  private static readonly Path = QualifiedName.of(coreNamespace, 'path')

  constructor(context: Context) {
    super(context, DirectorySource.Element)
  }

  withPath(path: string) {
    this.withAttribute(DirectorySource.Path, path)
    return this
  }
}

export const directorySource = (path: string) => {
  return (context: Context) => {
    new DirectorySource(context).openTag().withPath(path).closeTag()
  }
}

class FileSource extends Element {
  private static readonly Element = QualifiedName.of(coreNamespace, 'fileSource')
  private static readonly Path = QualifiedName.of(coreNamespace, 'path')

  constructor(context: Context) {
    super(context, FileSource.Element)
  }

  withPath(path: string) {
    this.withAttribute(FileSource.Path, path)
    return this
  }
}

export const fileSource = (path: string, consumer?: (fileSource: FileSource) => void) => {
  return (context: Context) => {
    const fileSource = new FileSource(context).openTag().withPath(path)
    consumer?.(fileSource)
    fileSource.closeTag()
  }
}

class FilePosition extends Element {
  private static readonly Element = QualifiedName.of(coreNamespace, 'filePosition')
  private static readonly Line = QualifiedName.of(coreNamespace, 'line')
  private static readonly Column = QualifiedName.of(coreNamespace, 'column')

  constructor(context: Context) {
    super(context, FilePosition.Element)
  }

  withLine(line: number) {
    this.withAttribute(FilePosition.Line, line)
    return this
  }

  withColumn(column: number) {
    this.withAttribute(FilePosition.Column, column)
    return this
  }
}

export const filePosition = (line: number, column?: number) => {
  return (context: Context) => {
    const filePosition = new FilePosition(context).openTag().withLine(line)
    if (column !== undefined) {
      filePosition.withColumn(column)
    }
    filePosition.closeTag()
  }
}
