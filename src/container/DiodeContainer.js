/**
 * @flow
 */
import React from "react";
import deepExtend from "deep-extend";
import objectAssign from "object-assign";
import hoistStatics from "hoist-non-react-statics";
import DiodeContainerQuery from "../query/DiodeContainerQuery";
import type { DiodeQueryMap } from "../tools/DiodeTypes";
import { CacheContext } from "../cache/DiodeCache";

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
    loading: true
  };

  async componentDidMount() {
    const { cache, query } = this.props;

    // prevent re-renders ?
    if (cache.hasResolved(query)) {
      return;
    }

    try {
      await cache.resolve(query);
      this.setState({ loading: false });
    } catch (error) {
      console.error("error", error);
      this.setState({ error, loading: false });
    }
  }

  render() {
    const {
      Component,
      wrapper,
      cache,
      query,
      onLoading,
      onError,
      ...props
    } = this.props;

    if (this.state.error !== null) {
      // TODO error handling
      return onError ? onError(props) : <span>{this.state.error.message}</span>;
    }

    let resolved, loading;

    try {
      resolved = cache.hasResolved(query);
      loading = !resolved && this.state.loading;
    } catch (error) {
      console.error("error", error);
      throw new Error(
        "Cache not found. Diode Cache is now required to use Diode."
      );
    }

    let component;

    if (loading) {
      component = typeof onLoading === "function" ? onLoading(props) : null;
    } else {
      component = <Component {...props} {...cache.getContents()} />;
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
                onLoading={spec.handleLoading}
                onError={spec.handleError}
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
