import * as navigation from "./navigation";
import * as state from "./state";
import * as internet from "./internet";
import * as server from "./server";

export default {
  ...navigation,
  ...state,
  ...internet,
  ...server,
};
