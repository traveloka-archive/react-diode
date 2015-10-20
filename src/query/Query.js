import deepExtend from 'deep-extend';

function aggreateQuery(container, options) {
  let queries = container.queries.aggregate();

  return queries.map(query => compileQuery(query, options));
}

function compileQuery(query, options) {
  let apiEndpoint;
  let apiPayload = query.generate(query.fragment, options);

  if (typeof query.endpoint === 'function') {
    apiEndpoint = query.endpoint(options);
  } else {
    apiEndpoint = query.endpoint;
  }

  // expose only static public property
  // the only function exported is resolve()
  return {
    type: query.type,
    method: query.method,
    endpoint: apiEndpoint,
    payload: apiPayload,
    resolve: query.resolve
  };
}

function createQuery(QueryShape, fragmentStructure) {
  if (typeof QueryShape.generate !== 'function') {
    throw new TypeError('Missing .generate() method definition');
  }

  if (typeof QueryShape.resolve !== 'function') {
    throw new TypeError('Missing .resolve() method definition');
  }

  let query = Object.create(QueryShape);
  query.fragmentStructure = fragmentStructure;

  return query;
}

function createBatchedQuery(QueryShape, queryGroupTypes, queryMap) {
  let query = createQuery(QueryShape, queryMap);
  let originalPayloadGenerator = query.generate;

  query.fragment = query.fragmentStructure;
  query.generate = (fragment, options) => {
    let data = {};
    let defaultMissingValue = options.defaultMissingValue ? options.defaultMissingValue : null;

    queryGroupTypes.forEach(queryType => {
      let query = fragment[queryType];

      if (query) {
        data[queryType] = query.payload;
      } else {
        data[queryType] = defaultMissingValue;
      }
    });

    return originalPayloadGenerator(data, options);
  };

  return query;
}

function reduceQuery(queries, QueryGroup, queryGroupTypes, options) {
  let rawGroupedQuery;
  let reducedQuery = [];

  queries.forEach(query => {
    if (queryGroupTypes.indexOf(query.type) === -1) {
      reducedQuery.push(query);
      return;
    }

    let groupedQueryFragment = {
      [query.type]: query
    };

    if (rawGroupedQuery) {
      deepExtend(rawGroupedQuery.fragment, groupedQueryFragment);
    } else {
      // create new query group
      rawGroupedQuery = createBatchedQuery(QueryGroup, queryGroupTypes, groupedQueryFragment);
    }
  });

  let groupedQuery = compileQuery(rawGroupedQuery, options);
  reducedQuery.push(groupedQuery);
  return reducedQuery;
}

let DiodeQuery = {
  aggregate: aggreateQuery,
  create: createQuery,
  reduce: reduceQuery
};

export default DiodeQuery;
