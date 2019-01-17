const Diode = require("react-diode");

module.exports = {
  type: "contentResource",
  request(fragment, params, options) {
    const crNames = Object.keys(fragment);

    const contentResources = crNames.map(name => {
      const entry = fragment[name];
      const entryKeys = Object.keys(entry);
      const entries = entryKeys.map(key => {
        return {
          key,
          params: entry[key]
        };
      });

      return { name, entries };
    });

    const url = "http://localhost:5000/v2/mobile/contentresource";
    const method = "post";
    const payload = { contentResources };
    return Diode.queryRequest(url, method, payload);
  },
  resolve(response, fragment, options) {
    return response.data.contentResources;
  }
};
