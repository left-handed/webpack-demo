const React = require("react");
// const ReactDom = require("react-dom") ;
// import "./styles/search.less";
require("./styles/search.less");
const fu = require("./images/fu.jpeg");
const {getText} = require("../../common") ;
// import jzLargeNumber from "test-large-number-jz";

class Search extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            Text: null
        }
    }

    loadComponent() {
        require.ensure([], () => {
            let Text = require('./print.js').default;
            this.setState({
                Text
            })
        }, 'print')

        // improt 依赖不生效
        // import(/* webpackChunkName="print" */ /*webpackMode: "lazy"*/'./print.js').then((Text) => {
        //     this.setState({
        //         Text: Text.default
        //     })
        // });
    }

    render () {
        let {Text} = this.state;
        // let num = jzLargeNumber(999, 1);
        return (
            <div className="text-dom">
                <img src={fu.default} onClick={this.loadComponent.bind(this)} alt="fu"/>
                Search Text 文字地区
                <div>
                    {getText()}
                </div>
                {
                    Text ? <Text/> : null
                }
                <div>
                    两数之和
                </div>
            </div>
        )
    }
}

module.exports = <Search/>