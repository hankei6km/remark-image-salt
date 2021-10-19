import { Readable, Writable } from 'stream'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

import { remarkImageSalt } from './image-salt.js'

type Opts = {
  stdin: Readable
  stdout: Writable
  stderr: Writable
  tagName: string
}
const cli = async ({
  stdin,
  stdout,
  stderr,
  tagName
}: Opts): Promise<number> => {
  try {
    let source = ''
    await new Promise((resolve) => {
      stdin.on('data', (d) => (source = source + d))
      stdin.on('end', () => resolve(source))
    })
    const m = await unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkImageSalt, { tagName })
      .use(stringify)
      .freeze()
      .process(source)
      .then(
        (file) => {
          return String(file)
        },
        (error) => {
          throw error
        }
      )
    stdout.write(m)
  } catch (err: any) {
    stderr.write(err.toString())
    stderr.write('\n')
    return 1
  }
  return 0
}

export default cli
