/**
 * @flow
 */
import DiodeRootQuery from "../query/DiodeRootQuery";
import { createContainer } from "./DiodeContainer";
import type { DiodeContainer, DiodeContainerSpec } from "./DiodeContainer";

export type DiodeRootContainer = DiodeContainer & {
  query: DiodeRootQuery
};

export function createRootContainer(
  Component: any,
  spec: DiodeContainerSpec
): DiodeRootContainer {
  const Container: DiodeContainer = createContainer(Component, spec);
  Container.query = new DiodeRootQuery(Container.query);
  return Container;
}
