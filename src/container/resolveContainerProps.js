import objectAssign from "object-assign";

/*
  Possible Errors:
  1. Queries key specified in Diode Container is not the same as query type in Diode Query
*/
export default function resolveContainerProps(response, RootContainer) {
  // Convert diode response as root container props
  const { map: queryMap } = RootContainer.query.getContainerQuery();
  const containerProps = Object.keys(queryMap).reduce((props, key) => {
    props[key] = response[key];

    if (!props[key]) {
      throw new Error(
        `Queries key ${key} does not match any type specified in Diode query.`
      );
    }

    return props;
  }, {});

  const { __additional } = response;
  if (__additional) {
    return objectAssign(containerProps, { __additional });
  } else {
    return containerProps;
  }
}
