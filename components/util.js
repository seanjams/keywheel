import {uniq} from 'lodash';
export const DIRS = ["TL", "TR", "BL", "BR"],
CMAJOR = [
  true,
  false,
  true,
  false,
  true,
  true,
  false,
  true,
  false,
  true,
  false,
  true
],
EMPTY = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
],
NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B"
],
MAJOR = [2,2,1,2,2,2,1],
MELMINOR = [2,1,2,2,2,2,1],
NEAPOLITAN = [1,2,2,2,2,2,1],
SHAPE = {
  majorTriad: [0,4,7],
  minorTriad: [0,3,7],
  major7: [0,4,7,11],
  minor7: [0,3,7,10],
  dominant: [0,4,7,10],
  diminished: [0,3,6,10]
},
CHORD_COLOR = {
  majorTriad: 'rgba(0,0,255,0.5)',
  minorTriad: 'rgba(255,0,0,0.5)',
  major7: 'rgba(0,255,255,0.5)',
  minor7: 'rgba(255,255,0,0.5)',
  dominant: 'rgba(255,0,255,0.5)',
  diminished: 'rgba(0,255,0,0.5)'
};

export class ScaleNode {
  constructor(notes = CMAJOR, center = { x: 800, y: 400 }) {
    this.rank = 0;
    this.notes = notes;
    this.center = center;
    this.parent = null;
    this.parentCenter = null;
    this.children = [];
  }

  addChild(node) {
    node.parent = this;
    node.parentCenter = this.center;
    node.rank = this.rank + 1;
    this.children.push(node);
  }

  removeChild(node) {
    node.parent = null;
    node.parentCenter = null;
    node.rank = 0;
    this.children.splice(this.children.indexOf(node), 1);
  }
}

export const tweek = (notes, idx) => {
  const pegs = notesToPegs(notes);
  let temp = pegs[idx], tweekStatus = 0;

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
  const { notes, parentCenter, center } = node,
        parentNotes = node.parent ? node.parent.notes : null,
        adjustedPegs = [];
  let neighborKeys = [], temp, parentTweekStatus;

//Check if visited notes contain the tweeked notes
//If so, check if the center we want to put it at is also occupied, this will tell us not to include this neighbor



  for (var i = 0; i < 7; i++) {
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
      newKey.center = getCenter(center, DIRS[i]);
    })
  } else {
    const deltaX = 2 * center.x - parentCenter.x,
          deltaY = 2 * center.y - parentCenter.y;
    neighborKeys.forEach(newKey => {
      if (isSameType(parentNotes, newKey.notes)) {
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

export const buildKeyWheel = start => {
  const queue = [start],
        visited = [start];
  let currentNode, neighbors, newNode;

  while (visited.length < 36) {
    currentNode = queue.shift();
    if (!currentNode) return start;
    neighbors = generateNeighbors(currentNode, visited);
    neighbors.data.forEach(neighborKey => {
      if (!neighborKey) return;
      newNode = new ScaleNode(neighborKey.notes, neighborKey.center);
      currentNode.addChild(newNode);
      queue.push(newNode);
      visited.push(newNode);
    });
  }
  return visited;
};

export const keyReader = notes => {
  const pegs = notesToPegs(notes);
  const result = { name: null, rootIdx: pegs[0] };
  let intervals = [], isMajorMatch, isMinorMatch, isNeaMatch;

  for (let i = 0; i < pegs.length; i++) {
    if (i === pegs.length - 1) {
      intervals.push(12 + pegs[0] - pegs[i]);
    } else {
      intervals.push(pegs[i + 1] -  pegs[i]);
    }
  }

  for (let i = 0; i < 7; i++) {
    isMajorMatch = true;
    isMinorMatch = true;
    isNeaMatch = true;
    for (let j = 0; j < intervals.length; j++) {
      if (intervals[j] !== MAJOR[j]) isMajorMatch = false;
      if (intervals[j] !== MELMINOR[j]) isMinorMatch = false;
      if (intervals[j] !== NEAPOLITAN[j]) isNeaMatch = false;
    }
    if (isMajorMatch) {
      result.name = `${NOTE_NAMES[result.rootIdx]} Maj`;
      return result;
    } else if (isMinorMatch) {
      result.name = `${NOTE_NAMES[result.rootIdx]} mel`;
      return result;
    } else if (isNeaMatch) {
      result.name = `${NOTE_NAMES[result.rootIdx]} neo`;
      return result;
    }

    result.rootIdx += intervals[0];
    intervals = rotate(intervals);
  }
  return null
};



//private helper methods
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

export const includesKey = (nodes, notes) => {
  let notesArr = nodes.map(node => node.notes);
  for (let i = 0; i < notesArr.length; i++) {
    if (isEqual(notesArr[i], notes)) return true;
  }
  return false;
};

// export const includesCenter = (nodes, center) => {
//   let centersArr = nodes.map(node => node.center);
//   for (let i = 0; i < centersArr.length; i++) {
//     if (centersArr[i].x === center.x && centersArr[i].y === center.y) {
//       return true;
//     }
//   }
//   return false;
// };

export const notesToPegs = notes => {
  const pegs = [];
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};

export const pegsToNotes = pegs => {
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

export const getCenter = (center, parentDirection, d = 90) => {
  const deltas = {
    "TL": { x: center.x + d, y: center.y + d },
    "BL": { x: center.x + d, y: center.y - d },
    "TR": { x: center.x - d, y: center.y + d },
    "BR": { x: center.x - d, y: center.y - d }
  };
  return deltas[parentDirection];
};

export const chordReader = notes => {
  const chords = Object.keys(SHAPE);
  const result = { color: "transparent", rootIdx: 0 };
  let chordShape;
  for (var i = 0; i < chords.length; i++) {
    chordShape = pegsToNotes(SHAPE[chords[i]])
    if (isSameType(notes, chordShape)) {
      result.color = CHORD_COLOR[chords[i]];
      let rootIdx = 0, temp = [...notes];
      while (!isEqual(temp, chordShape)) {
        temp = rotate(temp);
        result.rootIdx += 1;
      }
      break;
    }
  }
  if (result.color === "transparent") result.rootIdx = -1;
  return result;
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
//   keyReader(CMAJOR);
// };
//
// console.log("RUNNNING TESTS");
// test1();
