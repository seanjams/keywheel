import React from 'react';
import ReactDOM from 'react-dom';
import Scale from './scale';
import Input from './input';
import { ScaleNode, buildKeyWheel, pegsToNotes, EMPTY } from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scales: buildKeyWheel(new ScaleNode(pegsToNotes([0,2,4,5,7,9,11]))),
      selectedNotes: []
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(i) {
    const selectedNotes = [...this.state.selectedNotes];
    if (selectedNotes.includes(i)) {
      selectedNotes.splice(selectedNotes.indexOf(i), 1);
    } else {
      selectedNotes.push(i);
    }
    this.setState({ selectedNotes });
  }

  render() {
    const { selectedNotes, scales } = this.state;
    return (
      <div>
        <Input handleClick={this.handleClick} />
        {scales.map((node, i) => {
          let isMatch = true;
          selectedNotes.forEach(i => {
            if (!node.notes[i]) isMatch = false;
          });
          let result = isMatch ? selectedNotes: [];
          return (
            <Scale key={i} node={node} selectedNotes={result} />
          )
        })}
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);
});
