const path = require('path');
// chdir 方法更改 Node.js 进程的当前工作目录
process.chdir(path.join(__dirname, './smoke/template'));
describe('webpack-base-test', () => {
    require('./unit/webpack-base-test.js');
})