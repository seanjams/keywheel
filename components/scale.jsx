import React from 'react';
import { keyReader, getPegs, chordReader, rotate, updateCanvas } from './util';

class Scale extends React.Component {

  componentDidMount() {
    this.handleCanvas();
  }

  componentDidUpdate() {
    this.handleCanvas();
  }

  handleCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    const radius = 36;
    updateCanvas(ctx, radius, this.props.selectedNotes);
  }

  render() {
    const { node, selectedNotes, rootReferenceEnabled } = this.props;
    const { rank, notes, center } = node;
    const { name, rootIdx } = keyReader(notes);
    const { name: chordName, rootIdx: chordRootIdx } = chordReader(selectedNotes);
    const noteRadius = 14, scaleRadius = 36;
    let pegs = getPegs(notes);
    while (pegs[0] !== rootIdx) pegs = rotate(pegs);

    return (
      <div>
        {notes.map((note, i) => {
          const color = i === chordRootIdx ? "red": "black";
          let backgroundColor;
          if (selectedNotes[i]) {
            backgroundColor = "yellow";
          } else {
            backgroundColor = note ? "#AAF" : "transparent";
          }
          return (
            <div key={i}
              style={{
              position: "absolute",
              width: noteRadius,
              height: noteRadius,
              borderRadius: noteRadius,
              backgroundColor: backgroundColor,
              border: `1px solid ${color}`,
              color: color,
              fontSize: "0.5em",
              textAlign: "center",
              top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
              left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
            }}><span style={{
              position: "relative",
              top: "0.2em"
            }}>{ pegs.includes(i) ? pegs.indexOf(i) + 1 : null }</span></div>
          )
        })}
        <div style={{
          position: "absolute",
          top: center.y - 4,
          left: center.x,
          fontSize: "12px",
          textAlign: "center"
        }}>
          {name.split(" ").map((piece, i) => {
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
