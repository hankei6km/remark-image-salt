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

  // attrs がこの順番で出力されるとは限らない.
  // 変化するようならユーティリティを利用.
  it('should generate img tag', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![](/path/to/iamge2.jpg)'
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<img src="/path/to/iamge1.jpg" alt="image1">\n\n## test2\n\nimage-salt-2\n\n<img src="/path/to/iamge2.jpg" alt="">\n'
    )
  })
  it('should generate nuxt-img tag', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)',
        { tagName: 'nuxt-img' }
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<nuxt-img src="/path/to/iamge1.jpg" alt="image1"></nuxt-img>\n'
    )
  })
  it('should convert(decode) modifiers to :modifiers', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1#modifiers="blur=100"#](/path/to/iamge1.jpg)',
        { tagName: 'nuxt-img' }
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<nuxt-img src="/path/to/iamge1.jpg" alt="image1" :modifiers="{&#x22;blur&#x22;:&#x22;100&#x22;}"></nuxt-img>\n'
    )
  })
  it('should generate nuxt-img tag', async () => {
    expect(
      await f(
        '# test\n## test1\nimage-salt-1\n\n![image1#d:300x200 class="light-img" sizes="sm:100vw md:50vw lg:400px"#](/path/to/iamge1.jpg)',
        { tagName: 'nuxt-img' }
      )
    ).toEqual(
      '# test\n\n## test1\n\nimage-salt-1\n\n<nuxt-img src="/path/to/iamge1.jpg" alt="image1" width="300" height="200" class="light-img" sizes="sm:100vw md:50vw lg:400px"></nuxt-img>\n'
    )
  })
})
