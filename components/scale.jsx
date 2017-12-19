import React from 'react';
import { getCenter } from './util';

//make functional component
class Scale extends React.Component {



  render() {
    const center = this.props.center;

    const noteRadius = 14;
    const scaleRadius = 36;
    return (
      <div>
        {this.props.start.notes.map((note, i) => {
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
        {this.props.start.children.map((node, i) => {
          let dir = node.parentDir;
          console.log(getCenter(center, 100, dir));
          return (
            <Scale key={i} start={node} center={getCenter(center, 100, dir)} />
          );
        })}
      </div>
    )
  }
}

export default Scale;
