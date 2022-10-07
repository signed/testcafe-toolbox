import { Context, Element, Namespace, QualifiedName } from './xml/xml'

export const javaNamespace = Namespace.of('https://schemas.opentest4j.org/reporting/java/0.1.0')

class JavaVersion extends Element {
  static Element = QualifiedName.of(javaNamespace, 'javaVersion')

  constructor(context: Context) {
    super(context, JavaVersion.Element)
  }
}

export const javaVersion = (version: string) => {
  return (context: Context) => {
    const javaVersion = new JavaVersion(context).openTag()
    javaVersion.withContent(version)
    javaVersion.closeTag()
  }
}
