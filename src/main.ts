#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import cli from './cli.js'
;(async () => {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('image-salt')
    .env('IMAGE_SALT')
    .usage('$0 [OPTION]... --')
    .example('cat foo.md | $0', 'generate img tag by Image node in markdown')
    .options({
      'tag-name': {
        type: 'string',
        required: false,
        description: 'a Tag name to use generated tag'
      }
    })
    .help().argv

  process.exit(
    await cli({
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
      tagName:argv['tag-name']||''
    })
  )
})()
