import React from 'react';
import Tone from 'tone';
import { keyReader, getPegs, chordReader, rotate, updateCanvas, getMajor } from './util';

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

  handleClick(pegs, modeIdx = 0) {
    // e.preventDefault();
    Tone.Transport.cancel(0);
    let synth = new Tone.Synth().toMaster();
    let scale = [...pegs];
    for (let i = 0; i < modeIdx; i++) scale = rotate(scale);
    const freqs = [];
    for (let i = 0; i < scale.length; i++) {
      if (scale[i + 1] < scale[i]) scale[i + 1] += 12;
      freqs.push(Tone.Frequency().midiToFrequency(60 + scale[i]));
    }
    freqs.push(freqs[0] * 2);

    const pattern = new Tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, "8n", time);
    }, freqs, "8n").start();
    pattern.loop = 0;

    let transport = Tone.Transport.start();
  }

  render() {
    const { node, selectedNotes, rootReferenceEnabled } = this.props;
    const { rank, notes, center } = node;
    const { name, rootIdx } = keyReader(notes);
    const { name: chordName, rootIdx: chordRootIdx } = chordReader(selectedNotes);
    const noteRadius = 14, scaleRadius = 36;
    let pegs = getPegs(notes), relMajor = getMajor(rootIdx);
    while (pegs[0] !== rootIdx) pegs = rotate(pegs);

    return (
      <div onClick={() => this.handleClick(pegs)}>
        {notes.map((note, i) => {
          const color = i === chordRootIdx ? "red": "black";
          let backgroundColor, numLabel = null;
          if (selectedNotes[i]) {
            backgroundColor = "yellow";
          } else {
            backgroundColor = note ? "#AAF" : "transparent";
          }
          if (pegs.includes(i)) {
            numLabel = i === relMajor[pegs.indexOf(i)] ? "": "b";
            numLabel += `${pegs.indexOf(i) + 1}`;
          }
          return (
            <div key={i}
              onClick={e => {
                e.stopPropagation();
                note ? this.handleClick(pegs, pegs.indexOf(i)): null;
              }}
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
            }}>{ rootReferenceEnabled ? numLabel : i }</span></div>
          );
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
    );
  }
}

export default Scale;

// onMouseEnter={() => {
//   hoverColor = note ? "purple" : backgroundColor;
//   console.log(hoverColor);
// }}
// onMouseLeave={() => {
//   hoverColor = backgroundColor;
// }}
