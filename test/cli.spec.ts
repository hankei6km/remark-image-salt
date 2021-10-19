import { ReadStream } from 'fs'
import { PassThrough } from 'stream'
import cli from '../src/cli.js'

describe('cli()', () => {
  const io: Record<'stdin' | 'stdout' | 'stderr', PassThrough> = {
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    stderr: new PassThrough()
  }
  beforeEach(() => {
    io.stdin = new PassThrough()
    io.stdout = new PassThrough()
    io.stderr = new PassThrough()
  })

  it('should return stdout with exitcode=0', async () => {
    let outData = ''
    io.stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    io.stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      io.stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](/path/to/iamge2.jpg)'
      )
      io.stdin.end()
    })

    expect(
      await cli({
        ...io,
        tagName: '',
        baseURL: '',
        keepBaseURL: false,
        baseAttrs: ''
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should skip url was not matched baseURL', async () => {
    let outData = ''
    io.stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    io.stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      io.stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](https://localhost:3000/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](https://localhost:3001/path/to/iamge2.jpg)'
      )
      io.stdin.end()
    })

    expect(
      await cli({
        ...io,
        tagName: '',
        baseURL: 'https://localhost:3000/',
        keepBaseURL: false,
        baseAttrs: ''
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should keep baseURL', async () => {
    let outData = ''
    io.stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    io.stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      io.stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](https://localhost:3000/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](https://localhost:3001/path/to/iamge2.jpg)'
      )
      io.stdin.end()
    })

    expect(
      await cli({
        ...io,
        tagName: '',
        baseURL: 'https://localhost:3000/',
        keepBaseURL: true,
        baseAttrs: ''
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should apply baseAttrs', async () => {
    let outData = ''
    io.stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    io.stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      io.stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](https://localhost:3000/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](https://localhost:3001/path/to/iamge2.jpg)'
      )
      io.stdin.end()
    })

    expect(
      await cli({
        ...io,
        tagName: '',
        baseURL: 'https://localhost:3000/',
        keepBaseURL: true,
        baseAttrs: 'provider="imgix" class="light-img"'
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should return stderr with exitcode=1', async () => {
    let outData = ''
    io.stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    io.stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      io.stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1#d300x200>#](/path/to/iamge1.jpg)'
      )
      io.stdin.end()
    })

    expect(
      await cli({
        ...io,
        tagName: '',
        baseURL: '',
        keepBaseURL: false,
        baseAttrs: ''
      })
    ).toEqual(1)
    expect(outData).toEqual('')
    expect(errData).toMatchSnapshot()
  })
})
