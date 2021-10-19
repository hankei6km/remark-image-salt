import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Image, HTML } from 'mdast'
import { Element } from 'hast'
import { visitParents } from 'unist-util-visit-parents'
import { toHtml } from 'hast-util-to-html'
import { attrs } from './alt-attrs.js'

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

      const ex = image.alt ? attrs(image.alt) : { alt: '' }
      const htmlTag: Element = {
        type: 'element',
        tagName: tagName || defaultTagName,
        properties: {
          src: image.url,
          title: image.title,
          alt: ex.alt,
          ...ex.properties
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
