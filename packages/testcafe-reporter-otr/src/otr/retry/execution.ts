import { Status } from '../core'
import { Context, QualifiedName, Element } from '../xml/xml'
import { retryNamespace } from './namespace'

class Execution extends Element {
  static Element = QualifiedName.of(retryNamespace, 'execution')
  static Id = QualifiedName.of(retryNamespace, 'id')
  static Status = QualifiedName.of(retryNamespace, 'status')

  constructor(context: Context) {
    super(context, Execution.Element)
  }

  withId(id: string) {
    return super.withAttribute(Execution.Id, id)
  }

  withStatus(status: Status) {
    return super.withAttribute(Execution.Status, status)
  }
}

export const execution = (status: Status, consumer?: (execution: Execution) => void) => {
  return (context: Context) => {
    const executionElement = new Execution(context).openTag().withStatus(status)
    consumer?.(executionElement)
    executionElement.closeTag()
  }
}
