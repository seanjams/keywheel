export const CMAJOR = [true, false, true, false, true, true, false, true, false, true, false, true];
import { uniq } from 'lodash';


export class ScaleNode {
  constructor(notes = CMAJOR, root = 0) {
    //consider rendering root different color
    this.root = root;
    this.notes = notes;
    this.parent = null;
    this.parentDir = null;
    this.children = [];
  }

  addChild(node) {
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node) {
    node.parent = null;
    const idx = this.children.indexOf(node);
    this.children.splice(idx, 1);
  }
}



export const notesToPegs = (notes) => {
  // if (!(notes instanceof Array)) {
  //   // console.log(notes);
  // }
  const pegs = [];
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};



export const pegsToNotes = (pegs) => {
  const notes = Array(false, false, false, false, false, false, false, false, false, false, false, false);
  pegs.forEach(peg => {
    notes[peg] = true;
  });
  return notes;
};



export const tweek = (notes, pegNum) => {
  const pegs = notesToPegs(notes);
  const idx = pegNum - 1;
  if (pegNum === 1) {
    pegs[idx] = pegs[1] - pegs[0] + pegs[6] - 12;
  } else if (pegNum === 7){
    pegs[idx] = 12 + pegs[0] - pegs[6] + pegs[5];
  } else {
    pegs[idx] = pegs[idx + 1] - pegs[idx] + pegs[idx - 1];
  }
  return pegsToNotes(pegs);
};



export const neighbors = node => {
  const neighborKeys = [], result = [];
  const dirs = ["R", "B", "T", "L"];
  const { parentDir, notes } = node;
  let temp;

  notesToPegs(notes).forEach((peg, i) => {
    temp = tweek(notes, i + 1);
    if (!isEqual(notes, temp)) neighborKeys.push(temp);
  });

  dirs.forEach(dir => {
    if (dir === parentDir) {
      result.push(null);
    } else {
      result.push(neighborKeys.shift());
    }
  })
  // console.log(result);
  return result;
};



export const isEqual = (notes1, notes2) => {
  if (!notes1 || !notes2) return;
  if (notes1.length === notes2.length) {
    for (let i = 0; i < notes1.length; i++) {
      if (notes1[i] !== notes2[i]) return false;
    }
    return true;
  }
  return false;
};



export const buildKeyWheel = (start) => {
  const queue = [start];
  const visited = [start];
  let currentNode, neighbs, node;
  const dirs = ["L", "T", "B", "R"];

  while (visited.length < 36) {
    currentNode = queue.shift();
    neighbs = neighbors(currentNode);
    neighbs.forEach((neighborKey, i) => {
      if (!neighborKey) return;
      node = new ScaleNode(neighborKey);
      node.parentDir = dirs[i];
      if (!(currentNode.parent && isEqual(neighborKey, currentNode.parent.notes))) {
        if (visited.indexOf(neighborKey) < 0) {
          currentNode.addChild(node);
          visited.push(node);
          queue.push(node);
        }
      }
    });
  }
  // visited.forEach(node => {
  //   console.log(node);
  // });
  return start;
};



export const getCenter = (center, d, dir) => {
  const result = {
    "L": { x: center.x + d, y: center.y + d },
    "B": { x: center.x + d, y: center.y - d },
    "T": { x: center.x - d, y: center.y + d },
    "R": { x: center.x - d, y: center.y - d }
  };
  return result[dir];
};

//
// let node = new ScaleNode();
// console.log(buildKeyWheel);

// const test1 = () => {
//   const scaleNode = new ScaleNode();
//   const scaleNode2 = new ScaleNode(1);
//   scaleNode.addChild(scaleNode2);
//   console.log(scaleNode.children.includes(scaleNode2));
//   console.log(scaleNode2.parent === scaleNode);
// }
//
// const test2 = () => {
//   const scaleNode = new ScaleNode();
//   const scaleNode2 = new ScaleNode(1);
//   scaleNode.addChild(scaleNode2);
//   scaleNode.removeChild(scaleNode2);
//   console.log(scaleNode.children.length === 0);
// }
//
// console.log("RUNNNING");
// test1();
// test2();
