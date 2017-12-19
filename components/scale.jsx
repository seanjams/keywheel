import React from 'react';

//make functional component
class Scale extends React.Component {
  render() {
    const center = { x: 200, y: 200 };
    const noteRadius = 14;
    const scaleRadius = 36;
    return (
      <div style={{
      }}>
        {this.props.notes.map((note, i) => {
          return (
            <div key={i}
              style={{
              position: "absolute",
              width: noteRadius,
              height: noteRadius,
              borderRadius: noteRadius,
              backgroundColor: note ? "#AAF": "white",
              border: "1px solid black",
              fontSize: "0.5em",
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

export default Scale;
