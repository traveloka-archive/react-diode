# Diode

[![Build Status](https://travis-ci.org/traveloka/react-diode.svg?branch=master)](https://travis-ci.org/traveloka/react-diode) [![codecov.io](https://codecov.io/github/traveloka/react-diode/coverage.svg?branch=master)](https://codecov.io/github/traveloka/react-diode?branch=master)

> Endpoint agnostic, unidirectional data fetching for React application

## Motivation

We love [Relay](https://facebook.github.io/relay), but converting all of our APIs into
[GraphQL](https://facebook.github.io/graphql) takes time. and some APIs are still
awkward to be expressed into GraphQL schema (for example our translation API). So we built Diode
by taking what's best from Relay and removing what doesn't work for us.

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

## License

MIT
