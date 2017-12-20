import React from 'react';
import ReactDOM from 'react-dom';
import Scale from './scale';
import { ScaleNode, buildKeyWheel, pegsToNotes } from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: new ScaleNode(pegsToNotes([1,3,5,7,9,10,11]))
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
