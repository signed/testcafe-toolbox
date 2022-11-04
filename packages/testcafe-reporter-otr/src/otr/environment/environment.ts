import { Context, Element, QualifiedName } from '../xml/xml'
import { environmentNamespace } from './namespace'

class Environment extends Element {
  static readonly Element = QualifiedName.of(environmentNamespace, 'environment')

  constructor(context: Context) {
    super(context, Environment.Element)
  }
}

export const environment = (consumer: (environment: Environment) => void) => {
  return (context: Context) => {
    const environmentElement = new Environment(context).openTag()
    consumer(environmentElement)
    environmentElement.closeTag()
  }
}
