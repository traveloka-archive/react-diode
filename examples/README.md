# Diode usage examples

Follow these steps to get up and running

```sh
# Clone this repo
$ git clone git@github.com:traveloka/react-diode.git

# Install dependencies for react-diode
$ cd react-diode
$ npm install

# Install dependencies for our examples
$ cd examples
$ npm install
```

All scripts below are executed inside `examples` directory. See `package.json`
for complete npm scripts.

### Hello world

This example show the basic of Diode: given a component and data requirement, render the page with the result. A component and a query is called a Container and can be created using `Diode.createContainer`. The top-most container (or the only component if you only have one) must be a root container that created using `Diode.createRootContainer`. Root container essentially is a container, with the ability to set global dynamic variables and send all the queries (more on that later).

To fetch all data requirement, use `Diode.Store.forceFetch(RootContainer)` that will resolve a Promise containing the props you should pass to RootContainer.

To see the example run this script

```sh
$ npm start hello-world
```

Open http://localhost:3000 in your browser. To experiment, try changing `world` fragment in `HelloWorldComponent`.

### Query composition

Diode also support query composition via parent-children relationship. When creating parent container, you can specify children property to include all children queries that will be merged with the parent query.

To see the example run this script

```sh
$ npm start query-composition
```

Open http://localhost:3000 in your browser

### Variables

As explained earlier, Diode also support dynamic variable (variables that only known at runtime, for example after receiving http request). To use variable in fragment use `'$variable'` format (yes including single quote). Then you can replace it in Root container using `RootContainer.query.setVariables` that accept a `Map<K, V>` with a key being your variable name.

To see the example run this script

```sh
$ npm start variables
```

Open http://localhost:3000/hotel/detail/PICK_RANDOM_ID in your browser

### Query dependencies

A query can also have a another query as its dependency. For example, you may want to fetch hotel information from booking data, and the API for hotel info need something from booking data (hotelId). Simply use `Diode.waitForQuery` to specify query dependency, and add callback with resolved query as the argument that should return how the query request looked like.

To see the example run this script

```sh
npm start query-dependencies
```

Open http://localhost:3000 in your browser
