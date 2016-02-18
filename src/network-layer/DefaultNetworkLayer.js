import request from 'superagent';

// Simplify static method, use object definition
module.exports = {
  /**
   * Default data-fetching layer in Diode
   *
   * @param {Array<BaseQuery>} queries
   * @param {any} options
   */
  sendQueries(queries, options) {
    return Promise.all(queries.map(query => {
      return new Promise((resolve, reject) => {
        const apiEndpoint = options.apiDomain + query.endpoint;
        const apiPayload = query.generateAPIPayload(options);

        request[query.method](apiEndpoint)
          .send(apiPayload)
          .set(options.headers)
          .end((err, res) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(query.resolve(res.body));
            }
          });
      });
    }));
  }
};
