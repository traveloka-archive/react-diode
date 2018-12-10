import React from "react";
import { render, cleanup, waitForElement } from "react-testing-library";
import "jest-dom/extend-expect";

import Diode from "../DiodePublic";
import ContentResourceQuery from "./fixtures/ContentResourceQuery";

const fakeNetworkLayer = {
  sendQueries: jest.fn()
};

const Component = props => {
  return <div>{props.contentResource.hello.world}</div>;
};

const AnotherComponent = props => {
  return <div data-testid="another">{props.contentResource.hello.world}</div>;
};

const DifferentComponent = props => {
  return <div data-testid="different">{props.contentResource.new.world}</div>;
};

Diode.injectNetworkLayer(fakeNetworkLayer);

afterEach(cleanup);

test("do not fetch if already in cache", async () => {
  const Container = Diode.createRootContainer(Component, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        }
      })
    }
  });

  fakeNetworkLayer.sendQueries.mockReturnValueOnce(
    Promise.resolve({
      contentResource: {
        data: {
          contentResources: {
            hello: {
              world: "hello, world!"
            }
          }
        }
      }
    })
  );

  const initialCache = await Diode.Store.forceFetch(Container);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(1);

  // re-render other component with same queries
  const AnotherContainer = Diode.createRootContainer(AnotherComponent, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        }
      })
    }
  });

  const cache = Diode.createCache(initialCache);
  const { getByTestId, rerender } = render(
    <Diode.CacheProvider value={cache}>
      <AnotherContainer />
    </Diode.CacheProvider>
  );

  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(1);
  expect(getByTestId("another")).toHaveTextContent("hello, world!");

  // re-render other component with different queries
  const DifferentContainer = Diode.createRootContainer(DifferentComponent, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        new: {
          world: null
        }
      })
    }
  });

  fakeNetworkLayer.sendQueries.mockReturnValueOnce(
    Promise.resolve({
      contentResource: {
        data: {
          contentResources: {
            new: {
              world: "new world!"
            }
          }
        }
      }
    })
  );

  rerender(
    <Diode.CacheProvider value={cache}>
      <DifferentContainer />
    </Diode.CacheProvider>
  );

  await waitForElement(() => getByTestId("different"));

  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(2);
  expect(getByTestId("different")).toHaveTextContent("new world!");
});
