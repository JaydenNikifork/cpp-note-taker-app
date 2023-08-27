import Cursor from "./cursor.js";
import InputHandler from "./input.js";
import Text from "./text.js";
import SideNav from "./side-nav.js";

const test = document.getElementById('test');

const text = new Text();
const cur = new Cursor(text.head);
const sideNav = new SideNav(cur);
const inputHandler = new InputHandler(cur, sideNav);