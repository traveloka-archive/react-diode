const React = require("react");
const Diode = require("react-diode");

const ContentResourceQuery = require("../queries/ContentResourceQuery");

const HelloWorldComponent = props => {
  return React.createElement("div", {}, props.contentResource.hello.world);
};

module.exports = Diode.createRootContainer(HelloWorldComponent, {
  queries: {
    contentResource: Diode.createQuery(ContentResourceQuery, {
      hello: {
        world: null
      }
    })
  }
});
