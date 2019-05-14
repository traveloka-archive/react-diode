import React from "react";
import { render, waitForElement } from "react-testing-library";
import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import Diode from "../DiodePublic";
import ContentResourceQuery from "./fixtures/ContentResourceQuery";

const fakeNetworkLayer = {
  sendQueries: jest.fn()
};

Diode.injectNetworkLayer(fakeNetworkLayer);

afterEach(() => {
  fakeNetworkLayer.sendQueries.mockClear();
  fakeNetworkLayer.sendQueries.mockReset();
});

describe("Query merging", () => {
  test("Merge container query with wrapped component query", () => {
    function Foo() {
      return <div />;
    }

    const FooContainer = Diode.createContainer(Foo, {
      queries: {
        contentResource: Diode.createQuery(ContentResourceQuery, {
          hello: {
            world: null
          }
        })
      }
    });

    const AppContainer = Diode.createRootContainer(FooContainer, {
      queries: {
        contentResource: Diode.createQuery(ContentResourceQuery, {
          hello: {
            tvlk: null
          }
        })
      }
    });

    const queryMap = AppContainer.query._containerQuery.map;

    expect(queryMap).toEqual({
      contentResource: {
        fragmentStructure: {
          hello: {
            tvlk: null,
            world: null
          }
        },
        paramsStructure: {}
      }
    });
  });
});

test("Cached fragments should not be sent as payload", async () => {
  const ComponentX = props => <div>{props.contentResource.hello.world}</div>;
  const ComponentY = props => <div>{props.contentResource.hello.world}</div>;

  const ContainerX = Diode.createRootContainer(ComponentX, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        }
      })
    }
  });
  const ContainerY = Diode.createRootContainer(ComponentY, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        },
        fetchAll: {}
      })
    }
  });

  // Fake Network Layer
  fakeNetworkLayer.sendQueries
    .mockResolvedValueOnce({
      contentResource: {
        data: {
          contentResources: {
            hello: {
              world: "Hello, World!"
            }
          }
        }
      }
    })
    .mockResolvedValueOnce({
      contentResource: {
        data: {
          contentResources: {
            fetchAll: {
              buggy: "bug"
            }
          }
        }
      }
    });

  // render other component with same queries
  const cache = Diode.createCache({});
  const { container, rerender } = render(
    <Diode.CacheProvider value={cache}>
      <ContainerX />
    </Diode.CacheProvider>
  );

  await waitForElement(() => container.firstChild);

  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerY />
    </Diode.CacheProvider>
  );

  await waitForElement(() => container.firstChild);

  /*
    Checking the params sent to sendQueries when it is called
    First array: calls
    Second array: params
    Third array: query
  */
  expect(fakeNetworkLayer.sendQueries.mock.calls[1][0][0].payload).toEqual({
    contentResources: [{ name: "fetchAll", entries: [] }]
  });
});
