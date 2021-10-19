import { ReadStream } from 'fs'
import { PassThrough } from 'stream'
import cli from '../src/cli.js'

describe('cli()', () => {
  let stdin: PassThrough
  let stdout: PassThrough
  let stderr: PassThrough
  beforeEach(() => {
    stdin = new PassThrough()
    stdout = new PassThrough()
    stderr = new PassThrough()
  })

  it('should return stdout with exitcode=0', async () => {
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
        tagName: '',
        baseURL: '',
        keepBaseURL: false
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should skip url was not matched baseURL', async () => {
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](https://localhost:3000/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](https://localhost:3001/path/to/iamge2.jpg)'
      )
      stdin.end()
    })

    expect(
      await cli({
        stdin,
        stdout,
        stderr,
        tagName: '',
        baseURL: 'https://localhost:3000/',
        keepBaseURL: false
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should keep baseURL', async () => {
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1](https://localhost:3000/path/to/iamge1.jpg)\n## test2\nimage-salt-2\n\n![image2](https://localhost:3001/path/to/iamge2.jpg)'
      )
      stdin.end()
    })

    expect(
      await cli({
        stdin,
        stdout,
        stderr,
        tagName: '',
        baseURL: 'https://localhost:3000/',
        keepBaseURL: true
      })
    ).toEqual(0)
    expect(outData).toMatchSnapshot()
    expect(errData).toEqual('')
  })
  it('should return stderr with exitcode=1', async () => {
    let outData = ''
    stdout.on('data', (d) => (outData = outData + d))
    let errData = ''
    stderr.on('data', (d) => (errData = errData + d))
    process.nextTick(() => {
      stdin.write(
        '# test\n## test1\nimage-salt-1\n\n![image1#d300x200>#](/path/to/iamge1.jpg)'
      )
      stdin.end()
    })

    expect(
      await cli({
        stdin,
        stdout,
        stderr,
        tagName: '',
        baseURL: '',
        keepBaseURL: false
      })
    ).toEqual(1)
    expect(outData).toEqual('')
    expect(errData).toMatchSnapshot()
  })
})
