import React from 'react';
import Chord from './chord';
import { NOTE_NAMES, EMPTY, notesToPegs, chordReader } from './util';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [...EMPTY]
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
    const radius = 80;
    const pegs = notesToPegs(this.state.notes);
    const start = {
      x: radius * (1 + Math.sin(Math.PI * pegs[0] / 6)),
      y: radius * (1 - Math.cos(Math.PI * pegs[0] / 6))
    };
    ctx.clearRect(0, 0, 2 * radius, 2 * radius);
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = chordReader(this.state.notes).color;
    //draw chord
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    pegs.forEach((peg, i) => {
      if (i === 0) return;
      const newPos = {
        x: radius * (1 + Math.sin(Math.PI * peg / 6)),
        y: radius * (1 - Math.cos(Math.PI * peg / 6))
      };
      let x = ctx.lineTo(newPos.x, newPos.y);
    })
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
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
              backgroundColor: note ? "yellow": "transparent",
              border: "1px solid black",
              textAlign: "center",
              top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
              left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
            }}><span style={{
              position: "relative",
              top: "0.4em"
            }}>{ NOTE_NAMES[i] }</span></div>
          )
        })}
        <canvas ref="canvas"
          width={2 * scaleRadius}
          height={2 * scaleRadius}
          style={{
          position: "absolute",
          top: center.y - scaleRadius + noteRadius / 2,
          left: center.x - scaleRadius + noteRadius / 2
        }}/>
      </div>
    )
  }
}

export default Input;
