import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Image, HTML } from 'mdast'
import { Element, Properties } from 'hast'
import { visitParents } from 'unist-util-visit-parents'
import { toHtml } from 'hast-util-to-html'
import { attrs } from './alt-attrs.js'
import { editQuery, toModifiers } from './query.js'

export type RemarkImageSaltOptions = {
  tagName?: string
}
const defaultTagName = 'img'

export const remarkImageSalt: Plugin = function remarkImageSalt(
  { tagName }: RemarkImageSaltOptions = { tagName: defaultTagName }
): Transformer {
  return function transformer(tree: Node): void {
    visitParents(tree, 'image', (node, parents) => {
      const parent: Parent = parents[parents.length - 1]
      const imageIdx = parent.children.findIndex((n) => n === node)
      const image: Image = node

      let url = image.url
      const ex = image.alt ? attrs(image.alt) : { alt: '' }
      const properties: Properties = {}
      Object.entries(ex.properties || {}).forEach(([k, v]) => {
        let key = k
        let value = v
        let set = true
        if (k === 'modifiers') {
          key = `:${k}`
          value = JSON.stringify(toModifiers(`${v}`))
        } else if (k === 'qq') {
          url = editQuery('', url, `${v}`, true) // start は baseURL 的なものを設定したときに.
          set = false
        } else if (k === 'q') {
          url = editQuery('', url, `${v}`, false)
          set = false
        }
        if (set) {
          properties[key] = value
        }
      })
      const htmlTag: Element = {
        type: 'element',
        tagName: tagName || defaultTagName,
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
    })
  }
}
