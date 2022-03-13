import React from "react";
import ReactDom from "react-dom";
import "./styles/search.less";
import fu from "./images/fu.jpeg"
import {getText} from "../../common";
import jzLargeNumber from "test-large-number-jz";


class Search extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            Text: null
        }
    }

    async loadComponent() {
        let Text = await import('./print.js');
        this.setState({
            Text: Text.default
        })
    }

    render () {
        let {Text} = this.state;
        return (
          <div className="text-dom">
            <img src={fu} onClick={this.loadComponent.bind(this)} alt="fu"/>
            Search Text 文字地区
              <div>
                  {getText()}
              </div>
              {
                Text ? <Text/> : null
              }
              <div>
                两数之和
                {jzLargeNumber(999, 1)}
              </div>
          </div>
        )
    }
}

ReactDom.render(
    <Search/>,
    document.getElementById('root')
)