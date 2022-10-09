import 'testcafe'

let counter = 0

fixture('quarantine fixture').page`https://example.com`.after(async (_t) => {
  console.log(`executed the test ${counter} times`)
})

const executionsThatShouldFail = [1, 3]

test.before(async (_t) => {
  ++counter
})('first one', async (t) => {
  const shouldFail = executionsThatShouldFail.includes(counter)
  console.log(`execution #${counter} ${shouldFail ? 'fail' : 'success'}`)
  if (shouldFail) {
    await t.expect(true).eql(false, `assertion of execution #${counter}`)
  }
})
