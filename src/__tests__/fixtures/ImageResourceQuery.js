import Diode from "react-diode";

export default {
  type: "imageResource",
  request(fragment, params, options) {
    const crNames = Object.keys(fragment);

    const imageResources = crNames.map(name => {
      const entry = fragment[name];
      const entryKeys = Object.keys(entry);
      const entries = entryKeys.map(key => {
        return {
          key
        };
      });

      return { name, entries };
    });

    const url = "http://localhost:5000/v2/mobile/imageResource";
    const method = "post";
    const payload = { imageResources };
    return Diode.queryRequest(url, method, payload);
  },
  resolve(response, fragment, options) {
    return {
      ...response.data.imageResources
    };
  }
};
