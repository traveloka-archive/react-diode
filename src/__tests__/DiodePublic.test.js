import React from "react";
import { render, cleanup, waitForElement } from "react-testing-library";
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

test("do not fetch if already in cache", async () => {
  const ComponentX = props => <div>{props.contentResource.hello.world}</div>;
  const ComponentY = props => <div>{props.contentResource.hello.world}</div>;
  const ComponentZ = props => <div>{props.contentResource.new.world}</div>;

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
        }
      })
    }
  });

  const ContainerZ = Diode.createRootContainer(ComponentZ, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        new: {
          world: null
        }
      })
    }
  });

  fakeNetworkLayer.sendQueries
    .mockResolvedValueOnce({
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
    .mockResolvedValueOnce({
      contentResource: {
        data: {
          contentResources: {
            new: {
              world: "new world!"
            }
          }
        }
      }
    });

  let fetchCount = 0;

  const initialCache = await Diode.Store.forceFetch(ContainerX);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);

  // render other component with same queries
  const cache = Diode.createCache(initialCache);
  const { container, rerender } = render(
    <Diode.CacheProvider value={cache}>
      <ContainerY />
    </Diode.CacheProvider>
  );

  // already in cache, no additional fetch
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(fetchCount);
  expect(container.firstChild).toHaveTextContent("hello, world!");

  // re-render other component with different queries
  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerZ />
    </Diode.CacheProvider>
  );

  // different key, fetch again
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);
  expect(container.firstChild).toHaveTextContent("new world!");
});

test("able to understand fetch-all pattern", async () => {
  const Component = props => <div>{props.contentResource.first.time}</div>;
  const ComponentX = props => <div>{props.contentResource.hello.world}</div>;
  const ComponentY = props => <div>{props.contentResource.hello.loka}</div>;
  const ComponentZ = props => <div>{props.contentResource.hello.airy}</div>;
  const Component$ = props => <div>{props.contentResource.first.kiss}</div>;

  const Container = Diode.createRootContainer(Component, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        // forceFetch-ed
        first: {}
      })
    }
  });

  const ContainerX = Diode.createRootContainer(ComponentX, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        // fetch single, different key, should be fetched
        hello: {
          world: null
        }
      })
    }
  });

  const ContainerY = Diode.createRootContainer(ComponentY, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        // fetch all should be fetched
        hello: {}
      })
    }
  });

  const ContainerZ = Diode.createRootContainer(ComponentZ, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        // fetch single, should be ignored
        hello: {
          airy: null
        }
      })
    }
  });

  const Container$ = Diode.createRootContainer(Component$, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        // fetch all, should be ignored
        hello: {}
      })
    }
  });

  fakeNetworkLayer.sendQueries
    // 1st fetch: 1 key, all CR entries
    .mockResolvedValueOnce({
      contentResource: {
        data: {
          contentResources: {
            first: {
              time: "hi",
              kiss: "love"
            }
          }
        }
      }
    })
    // 1st fetch: 1 key, 1 CR entry
    .mockResolvedValueOnce({
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
    // 2nd fetch: 1 key, all CR entries
    .mockResolvedValueOnce({
      contentResource: {
        data: {
          contentResources: {
            hello: {
              world: "hello, world!",
              loka: "Hello, Traveloka!",
              airy: "Hi, Airy!"
            }
          }
        }
      }
    });

  let fetchCount = 0;

  const initialCache = await Diode.Store.forceFetch(Container);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);

  const cache = Diode.createCache(initialCache);
  const { container, rerender } = render(
    <Diode.CacheProvider value={cache}>
      <ContainerX />
    </Diode.CacheProvider>
  );

  // fetch single, should fetch
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);
  expect(container.firstChild).toHaveTextContent("hello, world!");

  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerY />
    </Diode.CacheProvider>
  );

  // fetch all, should fetch
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);
  expect(container.firstChild).toHaveTextContent("Hello, Traveloka!");

  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerZ />
    </Diode.CacheProvider>
  );

  // fetch single, should read from cache
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(fetchCount);
  expect(container.firstChild).toHaveTextContent("Hi, Airy!");

  rerender(
    <Diode.CacheProvider value={cache}>
      <Container$ />
    </Diode.CacheProvider>
  );

  // fetch all, should read from cache
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(fetchCount);
  expect(container.firstChild).toHaveTextContent("love");
});
