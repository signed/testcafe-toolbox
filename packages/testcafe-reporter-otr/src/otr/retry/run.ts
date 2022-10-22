import { Status } from '../core'
import { Context, QualifiedName, Element } from '../xml/xml'
import { retryNamespace } from './namespace'

class Run extends Element {
  static Element = QualifiedName.of(retryNamespace, 'run')
  static Id = QualifiedName.of(retryNamespace, 'id')
  static Status = QualifiedName.of(retryNamespace, 'status')

  constructor(context: Context) {
    super(context, Run.Element)
  }

  withId(id: string) {
    return super.withAttribute(Run.Id, id)
  }

  withStatus(status: Status) {
    return super.withAttribute(Run.Status, status)
  }
}

export const run = (status: Status, consumer?: (execution: Run) => void) => {
  return (context: Context) => {
    const executionElement = new Run(context).openTag().withStatus(status)
    consumer?.(executionElement)
    executionElement.closeTag()
  }
}
