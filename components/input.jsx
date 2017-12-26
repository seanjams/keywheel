import React from 'react';
import Chord from './chord';
import { EMPTY, notesToPegs } from './util';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: Array(...EMPTY)
    };
  }

  toggleNote(i) {
    const notes = [...this.state.notes];
    notes[i] = !notes[i];
    this.props.handleClick(i);
    this.setState({ notes });
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    const center = { x: 80, y: 80 }
    const pegs = notesToPegs(this.state.notes);
    const start = {
      x: center.x + 80 * Math.sin(Math.PI * pegs[0] / 6),
      y: center.y - 80 * Math.cos(Math.PI * pegs[0] / 6)
    };
    ctx.clearRect(center.x - 100, center.y - 100, 200, 200);
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    pegs.forEach((peg, i) => {
      if (i === 0) return;
      const newPos = {
        x: center.x + 80 * Math.sin(Math.PI * peg / 6),
        y: center.y - 80 * Math.cos(Math.PI * peg / 6)
      };
      let x = ctx.lineTo(newPos.x, newPos.y);
      console.log(ctx);
    })
    ctx.closePath(); // draws last line of the triangle
    ctx.stroke();
    console.log("SHOULDVE DONE SOMETHING");
  }

  render() {
    const noteRadius = 30;
    const scaleRadius = 80;
    const center = { x: 120, y: 300 };
    const { notes } = this.state;
    return (
      <div>
        {notes.map((note, i) => {
          return (
            <div key={i}
              onClick={() => this.toggleNote(i)}
              className="input-note"
              style={{
              position: "absolute",
              width: noteRadius,
              height: noteRadius,
              borderRadius: noteRadius,
              backgroundColor: note ? "yellow": "#eee",
              border: "1px solid black",
              textAlign: "center",
              top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
              left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
            }}><span style={{
              position: "relative",
              top: "0.4em"
            }}>{i}</span></div>
          )
        })}
        <canvas id="c" ref="canvas" width="200" height="200" style={{
          position: "absolute",
          top: center.y - scaleRadius + noteRadius / 2,
          left: center.x - scaleRadius + noteRadius / 2
        }}/>
      </div>
    )
  }
}

export default Input;
