/**
 * @flow
 */
import React from "react";
import * as reactIs from "react-is";
import deepExtend from "deep-extend";
import objectAssign from "object-assign";
import hoistStatics from "hoist-non-react-statics";
import DiodeContainerQuery from "../query/DiodeContainerQuery";
import type { DiodeQueryMap } from "../tools/DiodeTypes";
import { CacheContext, DiodeCache } from "../cache/DiodeCache";

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

class DiodeQueryFetcher extends React.Component {
  state = {
    error: null,
    // set default isLoading state to true
    // only if cache is provided & hasn't resolved
    isLoading:
      this.props.cache instanceof DiodeCache &&
      !this.props.cache.hasResolved(this.props.query)
  };

  async componentDidMount() {
    const { cache, query } = this.props;

    if (this.state.isLoading === false) {
      return;
    }

    try {
      await cache.resolve(query);

      await new Promise(resolve => {
        if (typeof this.props.afterFetchCallback === "function") {
          this.props.afterFetchCallback(resolve, cache.getContents());
        }
        resolve();
      });

      this.setState({ isLoading: false });
    } catch (error) {
      console.error("error", error);
      this.setState({ error, isLoading: false });
    }
  }

  render() {
    const {
      Component,
      wrapper,
      cache,
      query,
      loading: LoadingComponent,
      error: ErrorComponent,
      ...props
    } = this.props;
    const { isLoading } = this.state;

    if (this.state.error !== null) {
      return ErrorComponent && reactIs.isValidElementType(ErrorComponent) ? (
        React.createElement(ErrorComponent, props)
      ) : (
        <span>{this.state.error.message}</span>
      );
    }

    let component;

    if (isLoading) {
      component =
        LoadingComponent && reactIs.isValidElementType(LoadingComponent)
          ? React.createElement(LoadingComponent, props)
          : null;
    } else {
      component = (
        <Component
          {...props}
          {...cache instanceof DiodeCache && cache.getContents()}
        />
      );
    }

    if (wrapper) {
      return <div {...wrapper}>{component}</div>;
    }

    return component;
  }
}

function createContainerComponent(Component, spec, query) {
  /* istanbul ignore next */
  const componentName = Component.displayName || Component.name;
  const containerName = `Diode(${componentName})`;

  class DiodeContainer extends React.Component {
    constructor(props) {
      super(props);
      this.wrapperInfo = spec.wrapperInfo;
    }

    render() {
      const { props, wrapperInfo } = this;
      const wrapper = props.wrapperInfo ? props.wrapperInfo : wrapperInfo;

      return (
        <CacheContext.Consumer>
          {cache => {
            return (
              <DiodeQueryFetcher
                {...this.props}
                Component={Component}
                wrapper={wrapper}
                query={query}
                cache={cache}
                loading={spec.loading}
                error={spec.error}
              />
            );
          }}
        </CacheContext.Consumer>
      );
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
  function ContainerConstructor(props) {
    /* istanbul ignore else */
    if (!Container) {
      Container = createContainerComponent(Component, spec, query);
    }
    return new Container(props);
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
