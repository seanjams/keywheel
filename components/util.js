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
  const pegs = [];
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};

export const pegsToNotes = (pegs) => {
  const notes = Array(false, false, false, false, false, false, false, false, false, false, false, false);
  pegs.forEach(peg => {
    if (peg < 0) peg += 12;
    if (peg > 11) peg -= 12;
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
  // console.log(pegs);
  return pegsToNotes(pegs);
};


export const neighbors = node => {
  const neighborKeys = [], result = [];
  const dirs = ["R", "B", "T", "L"];
  const { parentDir, notes } = node;
  const parentNotes = node.parent ? node.parent.notes : null;
  let temp;

  notesToPegs(notes).forEach((peg, i) => {
    temp = tweek(notes, i + 1);
    if (!isEqual(notes, temp) && !isEqual(parentNotes, temp)) neighborKeys.push(temp);
  });

  if (neighborKeys.length === 1) {

    switch (parentDir) {
      case "B":
        return [neighborKeys[0], null, null, null];
      case "R":
        return [null, neighborKeys[0], null, null];
      case "L":
        return [null, null, neighborKeys[0], null];
      case "T":
        return [null, null, null, neighborKeys[0]];
    }

    // switch(parentDir) {
    // case "L":
    //   result.push(null);
    //   result.push(null);
    //   break;
    // case "T":
    //
    //     break;
    // case "B":
    //
    //     break;
    // case "R":
    //
    //     break;
    //
    // }
  } else {
    dirs.forEach(dir => {
      if (dir === parentDir) {
        result.push(null);
      } else {
        result.push(neighborKeys.shift() || null);
      }
    });
    // if(isEqual(notes, pegsToNotes([1,3,4,5,7,9,11]))) console.log(neighborKeys);
    return result;
  }



  // console.log(node.notes, result);
  return result;
};



export const isEqual = (notes1, notes2) => {
  if (!notes1 || !notes2) return false;
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
  const visited = [start.notes];
  let currentNode, neighbs, temp, notSeen;
  const dirs = ["L", "T", "B", "R"];

  while (visited.length < 36) {

    currentNode = queue.shift();
    neighbs = neighbors(currentNode);
    if (isEqual(currentNode.notes, pegsToNotes([1,3,4,6,7,9,11]))) console.log(neighbs);
    //whats happening is our "4" child is generating 3 children, the first of which is in the 4th position
    neighbs.forEach((neighborKey, i) => {

      if (!neighborKey) return;
      notSeen = true;
      temp = new ScaleNode(neighborKey);
      temp.parentDir = dirs[i];

      visited.forEach(key => {
        if (isEqual(key, neighborKey)) notSeen = false;

      })
      console.log(notSeen);

      if (notSeen) {
        // console.log("NOT SEEN", notesToPegs(temp.notes));
        currentNode.addChild(temp);
        visited.push(temp.notes);
        queue.push(temp);
      } else {
        // console.log("SEEN", );
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


// let node = new ScaleNode();

// const test1 = () => {
//   const scaleNode = new ScaleNode();
//   let notes = scaleNode.notes;
//   notes = tweek(notes, 3)
//   notes = tweek(notes, 2)
//   notes = tweek(notes, 7)
//   notes = tweek(notes, 1)
//   console.log(notesToPegs(notes));
// };

// const test2 = () => {
//   const scaleNode = new ScaleNode();
//   const scaleNode2 = new ScaleNode(1);
//   scaleNode.addChild(scaleNode2);
//   scaleNode.removeChild(scaleNode2);
//   console.log(scaleNode.children.length === 0);
// };

// console.log("RUNNNING TESTS");
// test1();
// test2();
