import deepExtend from 'deep-extend';

function aggreateQuery(container, options) {
  const queries = container.queries.aggregate();

  return queries.map(query => compileQuery(query, options));
}

function compileQuery(query, options) {
  let apiEndpoint;
  const apiPayload = query.generate(query.fragment, options);

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

  const query = Object.create(QueryShape);
  query.fragmentStructure = fragmentStructure;

  return query;
}

function createBatchedQuery(QueryShape, queryGroupTypes, queryMap) {
  const query = createQuery(QueryShape, queryMap);
  const originalPayloadGenerator = query.generate;

  query.fragment = query.fragmentStructure;
  query.generate = (fragment, options) => {
    const data = {};
    const defaultMissingValue = options.defaultMissingValue ? options.defaultMissingValue : null;

    queryGroupTypes.forEach(queryType => {
      const query = fragment[queryType];

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
  const reducedQuery = [];

  queries.forEach(query => {
    if (queryGroupTypes.indexOf(query.type) === -1) {
      reducedQuery.push(query);
      return;
    }

    const groupedQueryFragment = {
      [query.type]: query
    };

    if (rawGroupedQuery) {
      deepExtend(rawGroupedQuery.fragment, groupedQueryFragment);
    } else {
      // create new query group
      rawGroupedQuery = createBatchedQuery(QueryGroup, queryGroupTypes, groupedQueryFragment);
    }
  });

  const groupedQuery = compileQuery(rawGroupedQuery, options);
  reducedQuery.push(groupedQuery);
  return reducedQuery;
}

const DiodeQuery = {
  aggregate: aggreateQuery,
  create: createQuery,
  reduce: reduceQuery
};

module.exports = DiodeQuery;
