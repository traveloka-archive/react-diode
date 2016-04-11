/**
 * @flow
 */
import React from 'react';
import objectAssign from 'object-assign';
import DiodeContainerQuery from '../query/DiodeContainerQuery';
import type { DiodeQueryMap } from '../tools/DiodeTypes';

export type DiodeContainer = {
  query: DiodeContainerQuery,
  displayName: string,
  componentName: string
}

export type DiodeContainerSpec = {
  wrapperInfo: {
    [key: string]: string
  },
  children?: Array<DiodeContainer>,
  queries?: DiodeQueryMap
}

function createContainerComponent(Component, spec) {
  /* istanbul ignore next */
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;

  class DiodeContainer extends React.Component {
    constructor(...args) {
      super(...args);
      this.wrapperInfo = spec.wrapperInfo;
    }

    render() {

      if (this.wrapperInfo) {
        return (
          <div {...this.wrapperInfo}>
            <Component {...this.props} />
          </div>
        );
      }

      return (
        <Component {...this.props} />
      );
    }
  }

  DiodeContainer.displayName = containerName;
  return DiodeContainer;
}

function createContainer(
  Component,
  spec: DiodeContainerSpec = {}
): DiodeContainer {
  /* istanbul ignore next */
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;
  const query = new DiodeContainerQuery(spec.queries, spec.children);

  let Container;
  function ContainerConstructor(props, context) {
    /* istanbul ignore else */
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
