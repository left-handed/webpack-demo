import React from "react";
import ReactDom from "react-dom";
import "./styles/search.less";
import fu from "./images/fu.jpeg"

class Search extends React.Component {
  render () {
    return (
      <div className="text-dom">
        <img src={fu}/>
        Search Text 文字地区
      </div>
    )
  }
}

ReactDom.render(
  <Search/>,
  document.getElementById('root')
)