import {helloword} from './helloword.js';
import {getText} from "../../common";
let dom = document.getElementById('text');
dom.innerText = `${helloword()}${getText()}`;


