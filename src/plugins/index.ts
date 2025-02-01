import db from "./db";
import acl from "./acl";
import reply from "./reply";
import route from "./route";

export { default as db } from "./db";
export { default as acl } from "./acl";
export { default as route } from "./route";
export { default as reply } from "./reply";

export const plugins = [acl, reply, route, db];
