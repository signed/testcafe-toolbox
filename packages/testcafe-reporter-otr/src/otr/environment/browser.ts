import { Context, Element, QualifiedName } from '../xml/xml'
import { environmentNamespace } from './namespace'

class Browser extends Element {
  static readonly Element = QualifiedName.of(environmentNamespace, 'browser')
  static readonly Name = QualifiedName.of(environmentNamespace, 'name')
  static readonly Version = QualifiedName.of(environmentNamespace, 'version')

  constructor(context: Context) {
    super(context, Browser.Element)
  }

  withName(name: string) {
    return this.withAttribute(Browser.Name, name)
  }

  withVersion(version: string) {
    return this.withAttribute(Browser.Version, version)
  }
}

export const browser = (name: string, version: string) => {
  return (context: Context) => {
    new Browser(context).openTag().withName(name).withVersion(version).closeTag()
  }
}
