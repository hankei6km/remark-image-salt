import { attrs } from '../src/alt-attrs'

describe('alt-attr', () => {
  it('should extract attrs', async () => {
    expect(
      attrs('abc#class="light-img" sizes="sm:100vw md:50vw lg:400px"#')
    ).toEqual({
      alt: 'abc',
      properties: {
        className: ['light-img'],
        sizes: 'sm:100vw md:50vw lg:400px'
      }
    })
    expect(
      attrs('#class="light-img" sizes="sm:100vw md:50vw lg:400px"#ABC')
    ).toEqual({
      alt: 'ABC',
      properties: {
        className: ['light-img'],
        sizes: 'sm:100vw md:50vw lg:400px'
      }
    })
    expect(
      attrs('abc#class="light-img" sizes="sm:100vw md:50vw lg:400px"#ABC')
    ).toEqual({
      alt: 'abcABC',
      properties: {
        className: ['light-img'],
        sizes: 'sm:100vw md:50vw lg:400px'
      }
    })
  })
  it('should extract attrs with dimension', async () => {
    expect(
      attrs(
        'abc#d:300x200 class="light-img" sizes="sm:100vw md:50vw lg:400px"#'
      )
    ).toEqual({
      alt: 'abc',
      properties: {
        width: 300,
        height: 200,
        className: ['light-img'],
        sizes: 'sm:100vw md:50vw lg:400px'
      }
    })
  })
  it('should extract attrs as enpty', async () => {
    expect(attrs('abc# #')).toEqual({
      alt: 'abc',
      properties: {}
    })
  })
  it('should extract attrs with query', async () => {
    expect(
      attrs(
        'abc#d:300x200 class="light-img" q="auto=compress%2Cformat&crop64=Zm9jYWxwb2ludA&fit64=Y3JvcA&fp-x64=MC42&fp-z64=MS4z" sizes="sm:100vw md:50vw lg:400px"#'
      )
    ).toEqual({
      alt: 'abc',
      properties: {
        width: 300,
        height: 200,
        q: 'auto=compress%2Cformat&crop64=Zm9jYWxwb2ludA&fit64=Y3JvcA&fp-x64=MC42&fp-z64=MS4z',
        className: ['light-img'],
        sizes: 'sm:100vw md:50vw lg:400px'
      }
    })
  })
  it('should return just alt', async () => {
    expect(attrs('abc')).toEqual({ alt: 'abc' })
    expect(attrs('abc#')).toEqual({ alt: 'abc#' })
    expect(attrs('abc##')).toEqual({ alt: 'abc##' })
    expect(attrs('abc#ABC')).toEqual({ alt: 'abc#ABC' })
    expect(attrs('abc##ABC')).toEqual({ alt: 'abc##ABC' })
  })
  it('should trhow error when invalid attrs has injected', async () => {
    expect(() =>
      attrs(
        'abc#d:300x200 class="light-img" sizes="sm:100vw md:50vw lg:400px" >#'
      )
    ).toThrowError('extractAttrs: invalid attrs has injected')
  })
})
