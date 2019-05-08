import Diode from "../DiodePublic";

import contentResourceQuery from "./fixtures/ContentResourceQuery";

describe("Query merging", () => {
  test("Merge container query with wrapped component query", () => {
    function Foo() {
      return <div />;
    }

    const FooContainer = Diode.createContainer(Foo, {
      queries: {
        contentResource: Diode.createQuery(contentResourceQuery, {
          hello: {
            world: null
          }
        })
      }
    });

    const AppContainer = Diode.createRootContainer(FooContainer, {
      queries: {
        contentResource: Diode.createQuery(contentResourceQuery, {
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
