import 'testcafe'

fixture('second fixture').page`https://example.com`

test.before(async (_t) => {})('1st', async (_t) => {})

test.before(async (_t) => {})('2nd', async (_t) => {
  await _t.expect(true).eql(false)
})
