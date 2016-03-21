/**
 * @flow
 */
import React from 'react';
import objectAssign from 'object-assign';
import DiodeContainerQuery from '../query/DiodeContainerQuery';
import type { DiodeQuery } from '../query/DiodeTypes';

export type DiodeContainer = {
  query: DiodeContainerQuery,
  displayName: string,
  componentName: string
}

export type DiodeContainerSpec = {
  children?: Array<DiodeContainer>,
  queries?: {
    [key: string]: DiodeQuery
  }
}

function createContainerComponent(Component, spec) {
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;

  class DiodeContainer extends React.Component {
    constructor(...args) {
      super(...args);
      this.query = spec.query;
    }

    render() {
      return (
        <Component {...this.props} />
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
