# Diode

[![CircleCI](https://circleci.com/gh/traveloka/react-diode/tree/master.svg?style=svg)](https://circleci.com/gh/traveloka/react-diode/tree/master) [![codecov.io](https://codecov.io/github/traveloka/react-diode/coverage.svg?branch=master)](https://codecov.io/github/traveloka/react-diode?branch=master)

> Endpoint agnostic, unidirectional data fetching for React application

**Diode is an early project, expect breaking changes every (minor) version update.**

## Features

- **Unidirectional**

  Data requirement flows one direction from child component to parent component so root component will know all data the child need. No more confusion where the data comes from (or what component should fetch what data) as root component data is the only source of truth.

- **Declarative**

  Declare your data requirements declaratively, no need to manually call API in `componentDidMount` and use `this.state` to store data from server. All your data in component will be available as props.

- **Colocation**

  Query next to views that rely on them. See your data requirement in the same place that your view resides.

- **Endpoint agnostic**

  Every query will have its own endpoint and configuration on how to call them. You can use any HTTP-based endpoint, including REST and yes, GraphQL.

## Install

```
$ npm install react-diode
```

## Usage example

See `/examples` directory

## Contributing

### Publishing new version

`react-diode` is published semi automatically via [GitHub Action](https://github.com/traveloka/react-diode/actions). You just need to update the version in `package.json` via `npm version` and push to master alongside git tag.

```sh
# First pull latest master
git pull origin master

# Then determine the next version
npm version patch # for bugfix
npm version minor # for new feature
npm version major # for breaking change

# Push changes to GitHub 
git push origin master --follow-tags
```
## License

MIT
