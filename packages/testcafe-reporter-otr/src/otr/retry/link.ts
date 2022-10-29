import { Context, Element, QualifiedName } from '../xml/xml'
import { retryNamespace } from './namespace'

class Link extends Element {
  static readonly Element = QualifiedName.of(retryNamespace, 'link')
  static readonly RunId = QualifiedName.of(retryNamespace, 'runId')

  constructor(context: Context) {
    super(context, Link.Element)
  }
}

export const link = (runId: string) => {
  return (context: Context) => {
    new Link(context).openTag().withAttribute(Link.RunId, runId).closeTag()
  }
}
