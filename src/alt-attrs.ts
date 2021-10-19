import parse5 from 'parse5'
import { fromParse5 } from 'hast-util-from-parse5'
import { Element } from 'hast'
import { Node } from 'unist'
import { Properties } from 'hast'
import { unified } from 'unified'

export type ExtractAttrs = {
  source: string
  extracted: boolean
  surrounded: [string, string]
  start: string
  attrs: string
  end: string
}

type AttrsResult = {
  alt: string
  properties?: Properties
  query?: string
  modifiers?: string
}

export function decodeAttrs(s: string): Properties {
  const dummy = `<dummy ${s}/>`
  const p5ast = parse5.parseFragment(String(dummy), {
    sourceCodeLocationInfo: true
  })
  const n: Node = fromParse5(p5ast)
  if ((n.type = 'element')) {
    const root: Element = n as Element
    const dummy = root.children[0]
    if (
      root.children.length === 1 &&
      dummy.type === 'element' &&
      dummy.tagName === 'dummy' &&
      dummy.children.length === 0
    ) {
      return dummy.properties || {}
    }
  }
  throw new Error('extractAttrs: invalid attrs has injected')
  //throw new Error(`extractAttrs: invalid attrs has injected: ${s}`)
}

const extractRegExp = /(^[^#]*)#([^#]+)#(.*$)/
export function extractAttrs(alt: string): ExtractAttrs {
  const s = alt.match(extractRegExp)
  if (s) {
    return {
      source: alt,
      extracted: true,
      surrounded: ['#', '#'],
      start: s[1],
      attrs: s[2],
      end: s[3]
    }
  }
  return {
    source: alt,
    extracted: false,
    surrounded: ['', ''],
    start: '',
    attrs: '',
    end: ''
  }
}

const dimRegExp = /^d:(\d+)x(\d+)$/
export function attrs(alt: string): AttrsResult {
  // Properties {
  const e = extractAttrs(alt)
  if (e.extracted) {
    const properties: Properties = {}
    Object.entries(decodeAttrs(e.attrs)).forEach(([k, v]) => {
      const dm = k.match(dimRegExp)
      if (dm) {
        properties.width = parseInt(dm[1], 10)
        properties.height = parseInt(dm[2], 10)
        return
      }
      properties[k] = v
    })
    return {
      alt: `${e.start}${e.end}`,
      properties
    }
  }
  return { alt }
}
