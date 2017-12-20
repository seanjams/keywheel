import React from 'react';
import ReactDOM from 'react-dom';
import Scale from './scale';
import { CMAJOR, ScaleNode, neighbors, isEqual, buildKeyWheel } from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: new ScaleNode(),
    };
  }

  componentWillMount() {
    const start = buildKeyWheel(this.state.start);
  }

  render() {
    const { start } = this.state;
    return (
      <div>
        <Scale start={start} center={start.center} num={1}/>
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);
});
