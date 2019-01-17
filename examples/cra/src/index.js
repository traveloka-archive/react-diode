import React from "react";
import ReactDOM from "react-dom";
import Diode from "react-diode";

import { ExampleApp, FakeNetworkLayer } from "@diode/example";

Diode.injectNetworkLayer(new FakeNetworkLayer());

const cache = Diode.createCache({});

ReactDOM.render(<ExampleApp cache={cache} />, document.getElementById("root"));
