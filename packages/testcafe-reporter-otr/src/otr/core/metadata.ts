import { Context, QualifiedName, Element } from '../xml/xml'
import { coreNamespace } from './namespace'

class Metadata extends Element {
  static readonly Element = QualifiedName.of(coreNamespace, 'metadata')

  constructor(context: Context) {
    super(context, Metadata.Element)
  }
}

export const metadata = (consumer: (metadata: Metadata) => void) => {
  return (context: Context) => {
    const metadataElement = new Metadata(context).openTag()
    consumer(metadataElement)
    metadataElement.closeTag()
  }
}

class Tags extends Element {
  static readonly Element = QualifiedName.of(coreNamespace, 'tags')

  constructor(context: Context) {
    super(context, Tags.Element)
  }
}

export const tags = (consumer: (tags: Tags) => void) => {
  return (context: Context) => {
    const tagsElement = new Tags(context).openTag()
    consumer(tagsElement)
    tagsElement.closeTag()
  }
}

class Tag extends Element {
  private static readonly Element = QualifiedName.of(coreNamespace, 'tag')

  constructor(context: Context) {
    super(context, Tag.Element)
  }

  withValue(value: string) {
    this.withContent(value)
    return this
  }
}

export const tag = (value: string) => {
  return (context: Context) => {
    new Tag(context).openTag().withValue(value).closeTag()
  }
}
