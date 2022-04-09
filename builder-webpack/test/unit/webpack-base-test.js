const assert = require('assert');

describe('webpack.base.js test case', () => {
  const baseConfig = require('../../lib/base.config');
  console.log(baseConfig)
  it('entry', () => {
    assert.equal(baseConfig.module.entry.index, 'E:/project/webpack-demo/builder-webpack/test/smoke/template/src/index/index.js')
    assert.equal(baseConfig.module.entry.search, 'E:/project/webpack-demo/builder-webpack/test/smoke/template/src/search/index.js')
  })
})