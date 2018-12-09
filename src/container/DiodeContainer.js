/**
 * @flow
 */
import React from "react";
import deepExtend from "deep-extend";
import objectAssign from "object-assign";
import hoistStatics from "hoist-non-react-statics";
import DiodeContainerQuery from "../query/DiodeContainerQuery";
import type { DiodeQueryMap } from "../tools/DiodeTypes";

export type DiodeContainer = {
  query: DiodeContainerQuery,
  displayName: string,
  componentName: string
};

export type DiodeContainerSpec = {
  wrapperInfo: {
    [key: string]: string
  },
  children?: Array<DiodeContainer>,
  queries?: DiodeQueryMap
};

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
      const { props, wrapperInfo } = this;
      const wrapper = props.wrapperInfo ? props.wrapperInfo : wrapperInfo;

      if (wrapper) {
        return (
          <div {...wrapper}>
            <Component {...this.props} />
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  }

  DiodeContainer.displayName = containerName;
  return hoistStatics(DiodeContainer, Component);
}

export function createContainer(
  Component,
  spec: DiodeContainerSpec = {}
): DiodeContainer {
  /* istanbul ignore next */
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;
  const query = new DiodeContainerQuery(
    componentName,
    spec.queries,
    spec.children
  );

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

  ContainerConstructor.getComponent = function getComponent() {
    return Component;
  };

  ContainerConstructor.getChildren = function getChildren() {
    if (spec.children && spec.children.length) {
      return spec.children;
    } else {
      return [];
    }
  };

  ContainerConstructor.query = deepExtend(query, Component.query);
  ContainerConstructor.displayName = containerName;
  ContainerConstructor.componentName = componentName;

  return hoistStatics(ContainerConstructor, Component, { query: true });
}
