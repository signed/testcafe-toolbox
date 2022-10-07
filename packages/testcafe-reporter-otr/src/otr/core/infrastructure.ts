import { Context, QualifiedName, Element } from '../xml/xml'
import { coreNamespace } from './namespace'

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
