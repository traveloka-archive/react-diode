import React from 'react';
import objectAssign from 'object-assign';
import QueryTypes from './query/Types';
import QueryManager from './query/Manager';

function createContainerComponent(Component, spec) {
  class DiodeContainer extends React.Component {
    static get displayName() {
      return DiodeContainer.name;
    }

    static get propTypes() {
      return {
        wrapperInfo: React.PropTypes.object,
        diodeResponse: React.PropTypes.object
      };
    }

    constructor(props, context) {
      super(props, context);
      this.queries = spec.queries;
      this.wrapperInfo = spec.wrapperInfo;
    }

    _compileDiodeResponse(response) {
      const compiledResponse = {};
      const queries = this.queries;

      if (response && typeof response === 'object') {
        Object.keys(response).forEach(type => {
          const data = response[type];

          if (type === QueryTypes.BATCHED) {
            // batched response contains multiple data
            Object.keys(data).forEach(queryType => {
              for (const key in queries) {
                if (queries[key].type === queryType) {
                  compiledResponse[key] = data[queryType];
                }
              }
            });
          } else {
            for (const key in queries) {
              if (queries[key].type === type) {
                compiledResponse[key] = data;
              }
            }
          }
        });
      }

      return compiledResponse;
    }

    render() {
      const compiledResponse = this._compileDiodeResponse(this.props.diodeResponse);
      const wrapperInfo = this.props.wrapperInfo ? this.props.wrapperInfo : this.wrapperInfo;

      if (!wrapperInfo) {
        return <Component {...this.props} {...compiledResponse} />;
      }

      return (
        <div {...wrapperInfo}>
          <Component {...this.props} {...compiledResponse} />
        </div>
      );
    }
  }

  return DiodeContainer;
}

module.exports = function createContainer(Component, spec) {
  const componentName = Component.displayName || Component.name;

  spec.id = `Diode(${componentName})`;

  let Container;
  function ContainerConstructor(props, context) {
    if (!Container) {
      Container = createContainerComponent(Component, spec);
    }

    return new Container(props, context);
  }

  ContainerConstructor.setWrapperInfo = function (wrapperInfo) {
    objectAssign(spec.wrapperInfo, wrapperInfo);
  };

  ContainerConstructor.getWrapperInfo = function (key) {
    return spec.wrapperInfo[key];
  };

  ContainerConstructor.getComponent = function () {
    return Component;
  };

  ContainerConstructor.getChildren = function () {
    if (spec.children && spec.children.length) {
      return spec.children;
    }

    return [];
  };

  ContainerConstructor.displayName = spec.id;
  ContainerConstructor.queries = new QueryManager(spec.queries, spec.children);
  ContainerConstructor.componentName = componentName;

  return ContainerConstructor;
};
