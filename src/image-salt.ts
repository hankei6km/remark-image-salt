import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Image, HTML } from 'mdast'
import { Element, Properties } from 'hast'
import { visitParents } from 'unist-util-visit-parents'
import { toHtml } from 'hast-util-to-html'
import { attrs, decodeAttrs } from './alt-attrs.js'
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
  keepBaseURL: inKeepBaseURL,
  baseAttrs: inBaseAttrs
}: RemarkImageSaltOptions = defaultOpts): Transformer {
  const { tagName, baseURL, keepBaseURL, baseAttrs }: typeof defaultOpts = {
    tagName: inTagName !== undefined ? inTagName : defaultOpts.tagName,
    baseURL: inBaseURL !== undefined ? inBaseURL : defaultOpts.baseURL,
    keepBaseURL:
      inKeepBaseURL !== undefined ? inKeepBaseURL : defaultOpts.keepBaseURL,
    baseAttrs: inBaseAttrs !== undefined ? inBaseAttrs : defaultOpts.baseAttrs
  }
  const baseProperties = baseAttrs ? decodeAttrs(`${baseAttrs}`) : {}

  return function transformer(tree: Node): void {
    visitParents(tree, 'image', (node, parents: Parent[]) => {
      const parentsLen = parents.length
      const parent: Parent = parents[parentsLen - 1]
      const imageIdx = parent.children.findIndex((n) => n === node)
      const image: Image = node

      if (image.url.startsWith(baseURL)) {
        let imageURL = image.url
        let largeImageURL = ''

        const ex = image.alt ? attrs(image.alt) : { alt: '' }
        const workProperties: Properties = {}
        Object.assign(workProperties, baseProperties, ex.properties || {})
        const properties: Properties = {}

        Object.entries(workProperties).forEach(([k, v]) => {
          let key = k
          let value = v
          let set = true
          // 特殊な属性の一覧を別に作れないか?
          // ("d:" 属性も処理が分散している)
          if (k === 'modifiers') {
            key = `:${k}`
            value = JSON.stringify(toModifiers(`${v}`))
          } else if (k === 'qq') {
            imageURL = editQuery(baseURL, imageURL, `${v}`, true)
            set = false
          } else if (k === 'q') {
            imageURL = editQuery(baseURL, imageURL, `${v}`, false)
            set = false
          } else if (k === 'thumb') {
            largeImageURL = editQuery(baseURL, imageURL, `${v}`, true)
            set = false
          }
          if (set) {
            properties[key] = value
          }
        })
        if (!keepBaseURL) {
          imageURL = trimBaseURL(baseURL, imageURL)
        }

        const htmlNode: HTML = {
          type: 'html',
          value: ''
        }
        const imageTag: Element = {
          type: 'element',
          tagName,
          properties: {
            src: imageURL,
            title: image.title,
            alt: ex.alt,
            ...properties
          },
          children: []
        }
        if (largeImageURL === '') {
          if (
            parentsLen < 2 ||
            (parent.type === 'paragraph' && parent.children.length === 1)
          ) {
            const pTag: Element = {
              type: 'element',
              tagName: 'p',
              children: [imageTag]
            }
            htmlNode.value = toHtml(pTag)
          } else {
            htmlNode.value = toHtml(imageTag)
          }
        } else {
          const largeImageTag: Element = {
            type: 'element',
            tagName: 'a',
            properties: {
              href: largeImageURL,
              target: '_blank',
              rel: 'noopener noreferrer'
            },
            children: [imageTag]
          }
          htmlNode.value = toHtml(largeImageTag)
        }
        parent.children[imageIdx] = htmlNode
      }
    })
  }
}
