import {helloword} from './helloword.js';
let dom = document.getElementById('text');
dom.innerText = `${helloword()}}`;

dom.addEventListener('click', ()=> {
    getText();
})

let getText = () => {
    import(/* webpackChunkName: "test" */'./test.js').then((text) => {
        console.log(text.default())
    });
}


