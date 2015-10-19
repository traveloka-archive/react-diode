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
        diodeResponse: React.PropTypes.object.isRequired
      };
    }

    constructor(props, context) {
      super(props, context);
      this.queries = spec.queries;
      this.wrapperInfo = spec.wrapperInfo;
    }

    _compileDiodeResponse(response) {
      let compiledResponse = {};
      let queries = this.queries;

      if (response && typeof response === 'object') {
        Object.keys(response).forEach(type => {
          let data = response[type];

          if (type === QueryTypes.BATCHED) {
            // batched response contains multiple data
            Object.keys(data).forEach(queryType => {
              for (let key in queries) {
                if (queries[key].type === queryType) {
                  compiledResponse[key] = data[queryType];
                }
              }
            });
          } else {
            for (let key in queries) {
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
      let compiledResponse = this._compileDiodeResponse(this.props.diodeResponse);

      if (!this.wrapperInfo) {
        return <Component {...this.props} {...compiledResponse} />;
      }

      return (
        <div {...this.wrapperInfo}>
          <Component {...this.props} {...compiledResponse} />
        </div>
      );
    }
  }

  return DiodeContainer;
}

export default function createContainer(Component, spec) {
  var componentName = Component.displayName || Component.name;

  spec.id = `Diode(${componentName})`;

  var Container;
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
  }

  ContainerConstructor.displayName = spec.id;
  ContainerConstructor.queries = new QueryManager(spec.queries, spec.children);
  ContainerConstructor.componentName = componentName;

  return ContainerConstructor;
}
