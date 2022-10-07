import { Context, QualifiedName, Element } from '../xml/xml'
import { coreNamespace } from './namespace'

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
