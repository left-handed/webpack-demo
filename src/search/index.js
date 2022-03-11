import React from "react";
import ReactDom from "react-dom";
import "./styles/search.less";
import fu from "./images/fu.jpeg"
import {getText} from "../../common";


class Search extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            Text: null
        }
    }

    async loadComponent() {
        let Text = await import(/* webpackChunkName: "print" */'./print.js');
        this.setState({
            Text: Text.default
        });
    }

    render () {
        let {Text} = this.state;
        return (
          <div className="text-dom">
            <img src={fu} onClick={this.loadComponent.bind(this)} alt="fu"/>
            Search Text 文字地区
              {
                  Text ? <Text/> : null
              }
              <div>
                  {getText()}
              </div>
          </div>
        )
    }
}

ReactDom.render(
    <Search/>,
    document.getElementById('root')
)