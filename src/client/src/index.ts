import {
  init,
  classModule,
  attributesModule,
  styleModule,
  eventListenersModule,
  VNode,
} from "snabbdom";
import * as App from "./App";

import "bulma/css/bulma.min.css";

// Snabbdom Setup
const patch = init([
  classModule,
  attributesModule,
  styleModule,
  eventListenersModule,
]);
const container = document.getElementById("app")!;

// Effect system setup
let model: App.Model;
let vnode: VNode;
const [initModel, initEffect] = App.init;
model = initModel;
const dispatch = (msg: App.Msg) => {
  const [nextModel, nextEffect] = App.update(msg, model);
  nextEffect(dispatch);
  model = nextModel;
  const nextVNode = App.render(nextModel, dispatch);
  vnode = patch(vnode, nextVNode);
};
vnode = App.render(initModel, dispatch);
patch(container, vnode);
initEffect(dispatch);
