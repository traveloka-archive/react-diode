/**
 * @flow
 */
import DiodeRootQuery from '../query/DiodeRootQuery';
import { create as createContainer } from './DiodeContainer';
import type { DiodeContainer, DiodeContainerSpec } from './DiodeContainer';

export type DiodeRootContainer = DiodeContainer & {
  query: DiodeRootQuery
}

function createRootContainer(
  Component: any,
  spec: DiodeContainerSpec
): DiodeRootContainer {
  const Container: DiodeContainer = createContainer(Component, spec);
  Container.query = new DiodeRootQuery(Container.query);
  return Container;
}

module.exports = {
  create: createRootContainer
};
