import React from 'react';
import ReactDOM from 'react-dom';
import Scale from './scale';
import Input from './input';
import { ScaleNode, buildKeyWheel, pegsToNotes, notesToPegs, CMAJOR, EMPTY } from './util';

class Root extends React.Component {
  constructor(props) {
    super(props);
    const start = new ScaleNode(pegsToNotes([0,2,4,5,7,9,11]), { x: 720, y: 350 });
    this.state = {
      scales: buildKeyWheel(start),
      selected: []
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(i) {
    const selected = [...this.state.selected];
    if (selected.includes(i)) {
      selected.splice(selected.indexOf(i), 1);
    } else {
      selected.push(i);
    }
    this.setState({ selected });
  }

  render() {
    const { selected, scales } = this.state;
    return (
      <div>
        <Input handleClick={this.handleClick} />
        <div style={{
          width: "80%"
        }}>
          {scales.map((node, i) => {
            let isMatch = true;
            selected.forEach(i => {
              if (!node.notes[i]) isMatch = false;
            });
            let selectedNotes = isMatch ? selected: [];
            return (
              <Scale key={i} node={node} selectedNotes={selectedNotes} handleClick={this.handleClick}/>
            )
          })}
        </div>
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);

  // const ctx = this.refs.canvas.getContext('2d');
  const ctx = document.getElementById("c").getContext('2d');
  const center = { x: 120, y: 300 };
  const pegs = notesToPegs(CMAJOR);
  const start = {
    x: center.x + 80 * Math.sin(Math.PI * pegs[0] / 6),
    y: center.y - 80 * Math.cos(Math.PI * pegs[0] / 6)
  };
  ctx.clearRect(center.x - 100, center.y - 100, 200, 200);
  // ctx.strokeStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  pegs.forEach((peg, i) => {
    if (i === 0) return;
    const newPos = {
      x: center.x + 80 * Math.sin(Math.PI * peg / 6),
      y: center.y - 80 * Math.cos(Math.PI * peg / 6)
    };
    let x = ctx.lineTo(newPos.x, newPos.y);
  })
  ctx.closePath(); // draws last line of the triangle
  ctx.stroke();
  console.log("SHOULDVE DONE SOMETHING");
});
