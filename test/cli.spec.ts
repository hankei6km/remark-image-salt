import { PassThrough } from 'stream'
import cli from '../src/cli'

describe('cli()', () => {
  it('should return stdout with exitcode=0', async () => {
    const stdin = new PassThrough()
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](/path/to/iamge2.jpg)'
      )
      stdin.end()
    })

    expect(
      await cli({
        stdin,
        stdout,
        stderr,
        tagName: ''
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
})
