import objectAssign from 'object-assign';
import type DiodeRootContainer from './DiodeRootContainer';

export default function resolveContainerProps(
  response,
  RootContainer: DiodeRootContainer
) {
  // Convert diode response as root container props
  const { map: queryMap } = RootContainer.query.getContainerQuery();
  const containerProps = Object.keys(queryMap).reduce((props, key) => {
    props[key] = response[queryMap[key].type];
    return props;
  }, {});

  const { __additional } = response;
  if (__additional) {
    return objectAssign(containerProps, { __additional });
  } else {
    return containerProps;
  }
}
