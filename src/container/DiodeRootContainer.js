/**
 * @flow
 */
import DiodeRootQuery from '../query/DiodeRootQuery';
import { create as createContainer } from './DiodeContainer';
import type { DiodeContainerSpec } from './DiodeContainer';

export type DiodeRootContainer = {
  query: DiodeRootQuery
}

function createRootContainer(
  Component: any,
  spec: DiodeContainerSpec
): DiodeRootContainer {
  const Container = createContainer(Component, spec);
  Container.query = new DiodeRootQuery(Container.query);
  return Container;
}

module.exports = {
  create: createRootContainer
};
