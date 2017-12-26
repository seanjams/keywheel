import React from 'react';
import { keyReader, notesToPegs, chordColor } from './util';

class Scale extends React.Component {

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    const radius = 36;
    const { selectedNotes } = this.props;
    const pegs = notesToPegs(selectedNotes);
    const start = {
      x: radius * (1 + Math.sin(Math.PI * pegs[0] / 6)),
      y: radius * (1 - Math.cos(Math.PI * pegs[0] / 6))
    };
    ctx.clearRect(0, 0, 200, 200);
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = chordColor(selectedNotes);
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
    const noteRadius = 14;
    const scaleRadius = 36;
    const { node, selectedNotes } = this.props;
    const { rank, notes, center } = node;
    return (
      <div>
        {notes.map((note, i) => {
          let noteColor;
          if (selectedNotes[i]) {
            noteColor = "yellow";
          } else {
            noteColor = note ? "#AAF" : "transparent";
          }
          return (
            <div key={i}
              style={{
              position: "absolute",
              width: noteRadius,
              height: noteRadius,
              borderRadius: noteRadius,
              backgroundColor: noteColor,
              border: "1px solid black",
              fontSize: "0.5em",
              textAlign: "center",
              top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
              left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
            }}><span style={{
              position: "relative",
              top: "0.2em"
            }}>{i}</span></div>
          )
        })}
        <div style={{
          position: "absolute",
          top: center.y - 4,
          left: center.x,
          fontSize: "12px",
          textAlign: "center"
        }}>
          {keyReader(notes).split(" ").map((piece, i) => {
            return (
              <p key={i}>{piece}</p>
            );
          })}
        </div>
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

export default Scale;
