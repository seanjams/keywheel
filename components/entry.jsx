import React from 'react';
import ReactDOM from 'react-dom';
import Scale from './scale';
import { CMAJOR, ScaleNode, neighbors, isEqual, buildKeyWheel } from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: new ScaleNode(),
      notes: CMAJOR
    };
  }

  componentDidMount() {
    const start = buildKeyWheel(this.state.start);
  }

  render() {
    return (
      <Scale notes={this.state.notes} />
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);
});
