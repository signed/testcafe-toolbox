import { Context, QualifiedName, Element } from '../xml/xml'
import { coreNamespace } from './namespace'

const statuses = ['SKIPPED', 'ABORTED', 'SUCCESSFUL', 'FAILED'] as const
export type Status = typeof statuses[number]

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
    result.closeTag()
  }
}
