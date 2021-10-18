import { unified } from 'unified'
import remarkParse from 'remark-parse'
import stringify from 'remark-stringify'
import { remarkImageSalt, RemarkImageSaltOptions } from '../src/image-salt.js'

describe('remarkImageSalt', () => {
  const f = async (
    markdown: string,
    opts?: RemarkImageSaltOptions
  ): Promise<string> => {
    return await unified()
      .use(remarkParse)
      .use(remarkImageSalt, opts)
      .use(stringify)
      .freeze()
      .process(markdown)
      .then(
        (file) => {
          return String(file)
        },
        (error) => {
          throw error
        }
      )
  }

  it('should generate img tag', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](/path/to/iamge2.jpg)'
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<img src="/path/to/iamge1.jpg">\n\n## test2\n\nimage-salt-2\n\n<img src="/path/to/iamge2.jpg">\n'
    )
  })
  it('should generate nux-img tag', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)',
        { tagName: 'nuxt-img' }
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<nuxt-img src="/path/to/iamge1.jpg"></nuxt-img>\n'
    )
  })
})
