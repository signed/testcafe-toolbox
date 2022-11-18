# custom [testcafe reporter][testcafe-reporter]

Intended for exploring the reporter api protocol in testcafe.
Each interaction with the customer reporter is serialize and written to the console.

# How to use
Testcafe does not support [scoped reports](https://github.com/DevExpress/testcafe/issues/4692#issuecomment-578790454).
The proposed workaround is to rename the package during install like this

````shell
yarn add -D testcafe-reporter-raw@npm:@signed/testcafe-reporter-raw@0.2.0
````

[testcafe-reporter]: https://testcafe.io/documentation/402810/guides/extend-testcafe/reporter-plugin
