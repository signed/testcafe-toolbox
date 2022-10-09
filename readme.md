# How to run the example

```shell
cd packages/restcafe-reporter-otr && yarn && yarn build && yarn link && cd ../../example && yarn && yarn link "testcafe-reporter-otr"
yarn testcafe:quarantine 
```