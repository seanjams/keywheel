import { uniq } from 'lodash';
const CMAJOR = [true, false, true, false, true, true, false, true, false, true, false, true];
const EMPTY = [false, false, false, false, false, false, false, false, false, false, false, false];
const DIRS = ["L", "T", "B", "R"];

export class ScaleNode {
  constructor(notes = CMAJOR, center = { x:700, y:400 }) {
    //consider rendering root different color
    // this.root = root;
    this.notes = notes;
    this.center = center;
    this.parent = null;
    this.parentCenter = null;
    this.children = [];
  }

  addChild(node) {
    node.parent = this;
    node.parentCenter = this.center;
    this.children.push(node);
  }

  removeChild(node) {
    node.parent = null;
    node.parentCenter = null;
    const idx = this.children.indexOf(node);
    this.children.splice(idx, 1);
  }
}

export const tweek = (notes, idx) => {
  const pegs = notesToPegs(notes);
  let temp = pegs[idx];
  let tweekStatus = 0;

  if (idx === 0) {
    pegs[idx] = pegs[1] - pegs[0] + pegs[6] - 12;
  } else if (idx === 6){
    pegs[idx] = 12 + pegs[0] - pegs[6] + pegs[5];
  } else {
    pegs[idx] = pegs[idx + 1] - pegs[idx] + pegs[idx - 1];
  }

  if (temp > pegs[idx]) {
    tweekStatus--;
  } else if (temp < pegs[idx]) {
    tweekStatus++
  }

  return { notes: pegsToNotes(pegs), tweekStatus };
};

export const generateNeighbors = (node, visited) => {
  const adjustedPegs = [];
  const { notes, parentCenter, center } = node;
  const parentNotes = node.parent ? node.parent.notes : null;
  let neighborKeys = [];
  let temp, parentTweekStatus;

  for (var i = 0; i < notesToPegs(notes).length; i++) {
    temp = tweek(notes, i);
    if (!isEqual(notes, temp.notes)) {
      if (isEqual(parentNotes, temp.notes)) {
        parentTweekStatus = temp.tweekStatus;
      } else if (!includesKey(visited, temp.notes)) {
        neighborKeys.push(temp);
      }
      adjustedPegs.push(i + 1);
    };
  }

  if (!parentNotes) {
    while(!isSameType(neighborKeys[0].notes, neighborKeys[1].notes)) {
      neighborKeys = rotate(neighborKeys);
    }
    neighborKeys.forEach((newKey, i) => {
      newKey.center = getCenter(center, 80, DIRS[i]);
    })
  } else {
    const deltaX = 2 * center.x - parentCenter.x;
    const deltaY = 2 * center.y - parentCenter.y;
    neighborKeys.forEach(newKey => {
      if (isSameType(parentNotes, newKey.notes) && !isEqual(parentNotes, newKey.notes)) {
        newKey.center = { x: deltaX, y: parentCenter.y };
      } else if (newKey.tweekStatus === parentTweekStatus) {
        newKey.center = { x: parentCenter.x, y: deltaY };
      } else {
        newKey.center = { x: deltaX, y: deltaY };
      }
    });
  }
  return { data: neighborKeys, adjustedPegs };
};

export const buildKeyWheel = (start) => {
  const queue = [start];
  const visited = [start.notes];
  let currentNode, neighbors, temp;

  while (visited.length < 36) {
    currentNode = queue.shift();
    if (!currentNode) return start;
    neighbors = generateNeighbors(currentNode, visited);
    neighbors.data.forEach(neighborKey => {
      temp = new ScaleNode(neighborKey.notes, neighborKey.center);
      currentNode.addChild(temp);
      queue.push(temp);
      visited.push(neighborKey.notes);
    });
  }
  return start;
};


//////////////////////////////////////////////////////////////////

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

export const includesKey = (notesArr, key) => {
  for (var i = 0; i < notesArr.length; i++) {
    if (isEqual(notesArr[i], key)) return true;
  }
  return false;
};

export const notesToPegs = (notes) => {
  const pegs = [];
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};

export const pegsToNotes = (pegs) => {
  const notes = Array(...EMPTY);
  pegs.forEach(peg => {
    if (peg < 0) peg += 12;
    if (peg > 11) peg -= 12;
    notes[peg] = true;
  });
  return notes;
};

export const isSameType = (notes1, notes2) => {
  let temp = notes2;
  for (let i = 0; i < notes2.length; i++) {
    if (isEqual(notes1, temp)) {
      return true;
    } else {
      temp = rotate(temp);
    }
  }
  return false;
};

export const rotate = arr => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === arr.length - 1) {
      result.push(arr[0]);
    } else {
      result.push(arr[i+1]);
    }
  }
  return result;
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
// export const copy = arr => {
//   const result = [];
//   for (let i = 0; i < arr.length; i++) {
//     result.push(arr[i]);
//   }
//   return result;
// };

// let node = new ScaleNode();

// const test1 = () => {
//   let arr = pegsToNotes([0,2,4,6,7,9,11]);
//   console.log(isSameType(arr, CMAJOR));
// };
//
// console.log("RUNNNING TESTS");
// test1();
