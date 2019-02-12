import Diode from "../../DiodePublic";

export default {
  type: "imageSlider",
  request(fragment, params, options) {
    const imageSliderNames = Object.keys(fragment);
    const url = "http://localhost:5000/v2/mobile/imageslider";
    const method = "post";

    const imageSliders = imageSliderNames.map(name => {
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

    const payload = { imageSliders };

    return Diode.queryRequest(url, method, payload);
  },

  resolve(response, fragment, options) {
    return {
      ...response.data
    };
  }
};
