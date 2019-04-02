import React from "react";
import { render, waitForElement } from "react-testing-library";
import "jest-dom/extend-expect";
import "react-testing-library/cleanup-after-each";

import Diode from "../DiodePublic";
import ContentResourceQuery from "./fixtures/ContentResourceQuery";
import ImageResourceQuery from "./fixtures/ImageResourceQuery";
import ImageSliderQuery from "./fixtures/ImageSliderQuery";

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
  const ComponentA = props => (
    <div>{props.imageSlider.sample.map(image => image.title)}</div>
  );
  const ComponentB = props => (
    <div>{props.imageSlider.sample.map(image => image.title)}</div>
  );
  const ComponentC = props => (
    <div>{props.imageSlider.test.map(image => image.title)}</div>
  );

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

  const ContainerA = Diode.createRootContainer(ComponentA, {
    queries: {
      imageSlider: Diode.createQuery(ImageSliderQuery, {
        sample: {}
      })
    }
  });

  const ContainerB = Diode.createRootContainer(ComponentB, {
    queries: {
      imageSlider: Diode.createQuery(ImageSliderQuery, {
        sample: {}
      })
    }
  });

  const ContainerC = Diode.createRootContainer(ComponentC, {
    queries: {
      imageSlider: Diode.createQuery(ImageSliderQuery, {
        test: {}
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
    })
    .mockResolvedValueOnce({
      imageSlider: {
        data: {
          sample: [{ title: "image1" }]
        }
      }
    })
    .mockResolvedValueOnce({
      imageSlider: {
        data: {
          test: [{ title: "image2" }]
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

  // re-render other component with different queries
  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerA />
    </Diode.CacheProvider>
  );

  // different key, fetch again
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);
  expect(container.firstChild).toHaveTextContent("image1");

  // re-render other component with same queries
  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerB />
    </Diode.CacheProvider>
  );

  // already in cache, no additional fetch
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(fetchCount);
  expect(container.firstChild).toHaveTextContent("image1");

  // re-render other component with different queries
  rerender(
    <Diode.CacheProvider value={cache}>
      <ContainerC />
    </Diode.CacheProvider>
  );

  // different key, fetch again
  await waitForElement(() => container.firstChild);
  expect(fakeNetworkLayer.sendQueries).toBeCalledTimes(++fetchCount);
  expect(container.firstChild).toHaveTextContent("image2");
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

test("Render loading component when cache is not resolved", async () => {
  fakeNetworkLayer.sendQueries.mockResolvedValueOnce({
    contentResource: {
      data: {
        contentResources: {
          hello: {
            world: "hello, world!"
          }
        }
      }
    }
  });

  const Component = props => <div>{props.contentResource.hello.world}</div>;
  const LoadingComponent = () => <div>{"Loading Component"}</div>;

  const Container = Diode.createRootContainer(Component, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        }
      })
    },
    loading: LoadingComponent
  });

  const cache = Diode.createCache({});

  const { getByText } = render(
    <Diode.CacheProvider value={cache}>
      <Container />
    </Diode.CacheProvider>
  );

  // When cache is resolved, should not display loading component
  await waitForElement(() => getByText("hello, world!"));

  expect(getByText("hello, world!")).not.toBeNull();
});

test("Render error component when cache fails to resolve", async () => {
  fakeNetworkLayer.sendQueries.mockRejectedValueOnce("Error");

  const Component = props => <div>{props.contentResource.hello.world}</div>;
  const ErrorComponent = () => <div>{"Error Component"}</div>;

  const Container = Diode.createRootContainer(Component, {
    queries: {
      contentResource: Diode.createQuery(ContentResourceQuery, {
        hello: {
          world: null
        }
      })
    },
    error: ErrorComponent
  });

  const cache = Diode.createCache({});

  const { container } = render(
    <Diode.CacheProvider value={cache}>
      <Container />
    </Diode.CacheProvider>
  );

  // When cache fails to resolve, should display error component
  await waitForElement(() => container.firstChild);
  expect(container.firstChild).toHaveTextContent("Error Component");
});

test("Make sure fetch-all flag doesn't interfere with result", async () => {
  console.error = jest.fn();

  fakeNetworkLayer.sendQueries.mockResolvedValueOnce({
    imageResource: {
      data: {
        imageResources: {
          sample: {
            image1: {
              key: "image-1",
              title: "first-image"
            },
            image2: {
              key: "image-2",
              title: "second-image"
            }
          }
        }
      }
    }
  });

  const Component = props => {
    const { images } = props;

    return (
      <React.Fragment>
        {images.map(({ key, title }) => (
          <div key={key}>{title}</div>
        ))}
      </React.Fragment>
    );
  };

  const Container = Diode.createRootContainer(Component, {
    queries: {
      imageResource: Diode.createQuery(ImageResourceQuery, {
        sample: {}
      })
    }
  });

  const initialCache = await Diode.Store.forceFetch(Container);

  const { container, getByText } = render(
    <Component images={Object.values(initialCache.imageResource.sample)} />
  );

  expect(container.children.length).toBe(2);
  expect(getByText("first-image")).toBeInTheDocument();
  expect(getByText("second-image")).toBeInTheDocument();

  expect(console.error).not.toHaveBeenCalled();
});
