const React = require("react");
const Diode = require("react-diode");

const ContentResourceQuery = require("../queries/ContentResourceQuery");

const NewWorldComponent = props => {
  return React.createElement("div", {}, props.contentResource.new.world);
};

module.exports = Diode.createRootContainer(NewWorldComponent, {
  queries: {
    contentResource: Diode.createQuery(ContentResourceQuery, {
      new: {
        world: null
      }
    })
  }
});
