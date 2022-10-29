import { Context, Element, QualifiedName } from '../xml/xml'
import { retryNamespace } from './namespace'

class Data extends Element {
  static readonly Element = QualifiedName.of(retryNamespace, 'data')

  constructor(context: Context) {
    super(context, Data.Element)
  }
}

export const data = (consumer: (data: Data) => void) => {
  return (context: Context) => {
    const dataElement = new Data(context).openTag()
    consumer(dataElement)
    dataElement.closeTag()
  }
}

class Entry extends Element {
  static readonly Element = QualifiedName.of(retryNamespace, 'entry')
  static readonly Key = QualifiedName.of(retryNamespace, 'key')

  constructor(context: Context) {
    super(context, Entry.Element)
  }

  withKey(key: string) {
    return this.withAttribute(Entry.Key, key)
  }
}

export const entry = (key: string, content: string) => {
  return (context: Context) => {
    new Entry(context).openTag().withKey(key).withContent(content).closeTag()
  }
}
