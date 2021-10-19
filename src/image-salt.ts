import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Image, HTML } from 'mdast'
import { Element, Properties } from 'hast'
import { visitParents } from 'unist-util-visit-parents'
import { toHtml } from 'hast-util-to-html'
import { attrs } from './alt-attrs.js'
import { editQuery, toModifiers } from './query.js'
import { trimBaseURL } from './util.js'

export type RemarkImageSaltOptions = {
  tagName?: string
  baseURL?: string
  keepBaseURL?: boolean
  baseAttrs?: string
}
const defaultOpts: Required<RemarkImageSaltOptions> = {
  tagName: 'img',
  baseURL: '',
  keepBaseURL: false,
  baseAttrs: ''
}

export const remarkImageSalt: Plugin = function remarkImageSalt({
  tagName: inTagName,
  baseURL: inBaseURL,
  keepBaseURL,
  baseAttrs: inBaseAttrs
}: RemarkImageSaltOptions = defaultOpts): Transformer {
  const tagName = inTagName || defaultOpts.tagName
  const baseURL = inBaseURL || defaultOpts.baseURL
  const baseAttr = inBaseAttrs || defaultOpts.baseAttrs
  const { properties: baseProperties = {} } = baseAttr
    ? attrs(`#${baseAttr}#`)
    : { properties: {} }

  return function transformer(tree: Node): void {
    visitParents(tree, 'image', (node, parents) => {
      const parent: Parent = parents[parents.length - 1]
      const imageIdx = parent.children.findIndex((n) => n === node)
      const image: Image = node

      if (image.url.startsWith(baseURL)) {
        let url = image.url
        const ex = image.alt ? attrs(image.alt) : { alt: '' }
        const workProperties: Properties = {}
        Object.assign(workProperties, baseProperties, ex.properties || {})
        const properties: Properties = {}
        Object.assign(properties)
        Object.entries(workProperties || {}).forEach(([k, v]) => {
          let key = k
          let value = v
          let set = true
          if (k === 'modifiers') {
            key = `:${k}`
            value = JSON.stringify(toModifiers(`${v}`))
          } else if (k === 'qq') {
            url = editQuery(baseURL, url, `${v}`, true)
            set = false
          } else if (k === 'q') {
            url = editQuery(baseURL, url, `${v}`, false)
            set = false
          }
          if (set) {
            properties[key] = value
          }
        })
        if (!keepBaseURL) {
          url = trimBaseURL(baseURL, url)
        }
        const htmlTag: Element = {
          type: 'element',
          tagName,
          properties: {
            src: url,
            title: image.title,
            alt: ex.alt,
            ...properties
          },
          children: []
        }
        const htmlNode: HTML = {
          type: 'html',
          value: toHtml(htmlTag)
        }
        parent.children[imageIdx] = htmlNode
      }
    })
  }
}
