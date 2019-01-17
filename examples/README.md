## Example

There are 2 example: next.js and CRA

### Requirement

To run the example, first you need to build & link both react-diode and shared modules for example

Run these commands in root directory of react-diode

```sh
yarn build
yarn link
cd examples/shared
yarn
# you can then go to each example dir to run
# for example next.js
cd ../next
yarn
yarn start
# or cra
cd ../cra
yarn
yarn start
```
