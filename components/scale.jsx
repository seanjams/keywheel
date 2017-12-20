import React from 'react';
import { getCenter } from './util';

const Scale = ({start, center, num}) => {
  const noteRadius = 14;
  const scaleRadius = 36;
  return (
    <div>
      {start.notes.map((note, i) => {
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
      <div style={{
        position: "absolute",
        top: center.y,
        left: center.x
      }}>{num}</div>
      {start.children.map((node, i) => {
        return (
          <Scale key={i} start={node} center={node.center} num={num + 1}/>
        );
      })}
    </div>
  )
}

export default Scale;

//
// class Scale extends React.Component {
//   render() {
//     const center = this.props.center;
//     const noteRadius = 14;
//     const scaleRadius = 36;
//     return (
//       <div>
//         {this.props.start.notes.map((note, i) => {
//           return (
//             <div key={i}
//               style={{
//               position: "absolute",
//               width: noteRadius,
//               height: noteRadius,
//               borderRadius: noteRadius,
//               backgroundColor: note ? "#AAF": "white",
//               border: "1px solid black",
//               fontSize: "0.5em",
//               textAlign: "center",
//               top: center.y - scaleRadius * Math.cos(Math.PI * i / 6),
//               left: center.x + scaleRadius * Math.sin(Math.PI * i / 6)
//             }}><span>{i}</span></div>
//           )
//         })}
//         <div style={{
//           position: "absolute",
//           top: center.y,
//           left: center.x
//         }}>{this.props.num}</div>
//         {this.props.start.children.map((node, i) => {
//           return (
//             <Scale key={i} start={node} center={node.center} num={this.props.num + 1}/>
//           );
//         })}
//       </div>
//     )
//   }
// }
