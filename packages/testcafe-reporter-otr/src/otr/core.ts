import { Context, Namespace, QualifiedName, XMLBuilderCB, Element } from './xml'

export const coreNamespace = Namespace.of('https://schemas.opentest4j.org/reporting/core/0.1.0')

const statuses = ['SKIPPED', 'ABORTED', 'SUCCESSFUL', 'FAILED'] as const
export type Status = typeof statuses[number]

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

class Result extends Element {
  static Element = QualifiedName.of(coreNamespace, 'result')
  static Status = QualifiedName.of(coreNamespace, 'status')

  constructor(context: Context) {
    super(context, Result.Element)
  }
}

export const result = (status: Status) => {
  return (context: Context) => {
    const result = new Result(context).openTag()
    result.withAttribute(Result.Status, status)
    context.xmlBuilder.up()
  }
}
