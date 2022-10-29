import { Context, QualifiedName, Element } from '../xml/xml'
import { coreNamespace } from './namespace'

class Attachments extends Element {
  static readonly Element = QualifiedName.of(coreNamespace, 'attachments')

  constructor(context: Context) {
    super(context, Attachments.Element)
  }
}

export const attachments = (consumer: (attachments: Attachments) => void) => {
  return (context: Context) => {
    const attachmentsElement = new Attachments(context).openTag()
    consumer(attachmentsElement)
    attachmentsElement.closeTag()
  }
}
