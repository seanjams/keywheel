import React from 'react';
import { EMPTY } from './util';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: Array(...EMPTY)
    }
  }

  toggleNote(i) {
    const notes = [...this.state.notes];
    notes[i] = !notes[i];
    this.props.handleClick(i);
    this.setState({ notes });
  }

  render() {
    const noteRadius = 30;
    const scaleRadius = 100;
    const center = { x: 200, y: 400 }
    const { notes } = this.state;
    return (
      <div>
        {notes.map((note, i) => {
          return (
            <div key={i}
              onClick={e => {
                e.preventDefault();
                this.toggleNote(i);
              }}
              style={{
              position: "absolute",
              width: noteRadius,
              height: noteRadius,
              borderRadius: noteRadius,
              backgroundColor: note ? "#88D": "white",
              border: "1px solid black",
              textAlign: "center",
              top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
              left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
            }}><span>{i}</span></div>
          )
        })}
      </div>
    )
  }
}

export default Input;
