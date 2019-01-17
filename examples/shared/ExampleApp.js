const React = require("react");
const Diode = require("react-diode");

const HelloWorld = require("./components/HelloWorld");
const NewWorld = require("./components/NewWorld");

class ExampleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new: false
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({ new: !state.new }));
  }

  render() {
    const Component = this.state.new ? NewWorld : HelloWorld;

    return React.createElement(
      Diode.CacheProvider,
      { value: this.props.cache },
      [
        React.createElement(Component, {}, null),
        React.createElement(
          "button",
          { onClick: this.handleClick },
          "Click me!"
        )
      ]
    );
  }
}

module.exports = ExampleApp;
