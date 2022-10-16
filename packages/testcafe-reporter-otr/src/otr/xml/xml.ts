import { createCB } from 'xmlbuilder2'

export type XMLBuilderCB = ReturnType<typeof createCB>

export type Context = {
  readonly xmlBuilder: XMLBuilderCB
  readonly namespaceRegistry: NamespaceRegistry
}

export const toXsDateTime = (date: Date) => date.toISOString()

export type XmlEmitter = (context: Context) => void

export class NamespaceRegistry {
  static of(defaultNamespace: Namespace, additionalNamespacesArg: Record<string, Namespace> = {}) {
    const additionalNamespaces = new Map()

    Object.entries(additionalNamespacesArg).forEach(([alias, namespace]) => {
      additionalNamespaces.set(namespace.uri, alias)
    })

    return new NamespaceRegistry(defaultNamespace, additionalNamespaces)
  }

  readonly defaultNamespace: Namespace
  readonly additionalNamespaces: Map<string, string>

  constructor(defaultNamespace: Namespace, additionalNamespaces: Map<string, string>) {
    this.defaultNamespace = defaultNamespace
    this.additionalNamespaces = additionalNamespaces
  }
}

type AttributeValue = string | number | Date

const attributeValueToString = (value: AttributeValue): string => {
  if (value instanceof Date) {
    return toXsDateTime(value)
  }
  if (typeof value === 'number') {
    return value.toString(10)
  }
  return value
}

export class Element {
  private readonly _context: Context
  private readonly _namespace: Namespace
  private readonly _simpleName: string

  constructor(context: Context, qualifiedName: QualifiedName) {
    this._context = context
    this._namespace = qualifiedName.namespace
    this._simpleName = qualifiedName.simpleName
  }

  openTag() {
    if (this._namespace.equals(this._context.namespaceRegistry.defaultNamespace)) {
      this._context.xmlBuilder.ele(this._simpleName)
    } else {
      this._context.xmlBuilder.ele(this._namespace.uri, this._simpleName)
    }
    return this
  }

  closeTag() {
    this._context.xmlBuilder.up()
    return this
  }

  withAttribute(qualifiedName: QualifiedName, value: AttributeValue) {
    let valueAsString = attributeValueToString(value)
    if (this._namespace.equals(qualifiedName.namespace)) {
      this._context.xmlBuilder.att(qualifiedName.simpleName, valueAsString)
    } else {
      this._context.xmlBuilder.att(qualifiedName.namespace.uri, qualifiedName.simpleName, valueAsString)
    }
    return this
  }

  withContent(version: string) {
    this._context.xmlBuilder.txt(version)
    return this
  }

  append(emitter: XmlEmitter): this {
    emitter(this._context)
    return this
  }
}

export class Namespace {
  static of(uri: string) {
    return new Namespace(uri)
  }

  readonly uri: string

  constructor(uri: string) {
    this.uri = uri
  }

  equals(other: Namespace) {
    return this.uri === other.uri
  }
}

export class QualifiedName {
  static of(namespace: Namespace, simpleName: string) {
    return new QualifiedName(namespace, simpleName)
  }

  readonly namespace: Namespace
  readonly simpleName: string

  constructor(namespace: Namespace, simpleName: string) {
    this.namespace = namespace
    this.simpleName = simpleName
  }
}
