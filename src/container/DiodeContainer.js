import React from 'react';
import objectAssign from 'object-assign';
import DiodeContainerQuery from '../query/DiodeContainerQuery';
import type DiodeQuery from '../query/DiodeQuery';

export type DiodeContainer = {
  query: DiodeContainerQuery,
  displayName: string,
  componentName: string
}

export type DiodeContainerSpec = {
  children?: Array<React.Component>,
  queries?: {
    [key: string]: DiodeQuery
  }
}

type DiodeResponse = {
  [queryType: string]: any
};

type DiodeContainerProps = any;

function createContainerComponent(Component, spec) {
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;

  class DiodeContainer extends React.Component {
    constructor(...args) {
      super(...args);
      this.query = spec.query;
    }

    _parseDiodeResponse(diodeResponse: DiodeResponse): DiodeContainerProps {
      const { query } = this;
      return Object.keys(query.map).reduce((props, key) => {
        props[key] = diodeResponse[query.map[key].type];
        return props;
      }, {});
    }

    render() {
      /* eslint no-use-before-define: 0 */
      // see https://github.com/babel/babel-eslint/issues/249
      const { __diodeResponse, ...prop } = this.props;

      // Child container doesn't need to parse diodeResponse again
      // as parent already know what query types the children need,
      // so __diodeResponse will not be passed to child container
      let diodeProps;
      if (__diodeResponse) {
        diodeProps = this._parseDiodeResponse(__diodeResponse);
      }

      return (
        <Component {...prop} {...diodeProps} />
      );
    }
  }

  DiodeContainer.displayName = containerName;
  DiodeContainer.propTypes = {
    __diodeResponse: React.PropTypes.object
  };

  return DiodeContainer;
}

function createContainer(
  Component: React.Component,
  spec: DiodeContainerSpec
): DiodeContainer {
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;
  const query = spec.query = new DiodeContainerQuery(spec.queries, spec.children);

  let Container;
  function ContainerConstructor(props, context) {
    if (!Container) {
      Container = createContainerComponent(Component, spec);
    }
    return new Container(props, context);
  }

  ContainerConstructor.setWrapperInfo = function setWrapperInfo(wrapperInfo) {
    objectAssign(spec.wrapperInfo, wrapperInfo);
  };

  ContainerConstructor.getWrapperInfo = function getWrapperInfo(key) {
    return spec.wrapperInfo[key];
  };

  ContainerConstructor.query = query;
  ContainerConstructor.displayName = containerName;
  ContainerConstructor.componentName = componentName;

  return ContainerConstructor;
}

module.exports = {
  create: createContainer
};
