module.exports = class FakeNetworkLayer {
  async sendQueries(queries, options) {
    console.log("send queries", queries);
    const responses = await Promise.all(
      queries.map(query => {
        if (query.type !== "contentResource") {
          throw new Error("Only contentResource query for demo");
        }

        const fakeContentResource = {};
        const keys = query.payload.contentResources;
        console.log("keys", keys);
        keys.forEach(key => {
          fakeContentResource[key.name] = {};
          key.entries.forEach(entry => {
            if (entry.params === null) {
              fakeContentResource[key.name][entry.key] = `${key.name}, ${
                entry.key
              }!`;
            } else {
              fakeContentResource[key.name][entry.key] = `${key.name}, ${
                entry.key
              } ${entry.params}!`;
            }
          });
        });

        return {
          type: query.type,
          data: {
            data: {
              contentResources: fakeContentResource
            }
          }
        };
      })
    );

    console.log("resolved", responses);

    return responses.reduce((result, response) => {
      result[response.type] = response.data;
      return result;
    }, {});
  }
};
