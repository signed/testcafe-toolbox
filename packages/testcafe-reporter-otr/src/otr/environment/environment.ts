import { Status } from '../core'
import { Context, Element, QualifiedName } from '../xml/xml'
import { environmentNamespace } from './namespace'

class Environment extends Element {
  static readonly Element = QualifiedName.of(environmentNamespace, 'environment')
  static readonly Status = QualifiedName.of(environmentNamespace, 'status')

  constructor(context: Context) {
    super(context, Environment.Element)
  }

  withStatus(status: Status) {
    return this.withAttribute(Environment.Status, status)
  }
}

export const environment = (status: Status, consumer: (environment: Environment) => void) => {
  return (context: Context) => {
    const environmentElement = new Environment(context).openTag().withStatus(status)
    consumer(environmentElement)
    environmentElement.closeTag()
  }
}
