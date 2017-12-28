// import {uniq} from 'lodash';
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
  major: [0,4,7],
  minor: [0,3,7],
  major7: [0,4,7,11],
  minor7: [0,3,7,10],
  dom: [0,4,10],
  dom5: [0,4,7,10],
  dom9: [0,2,4,10],
  dim: [0,3,6],
  // dimbb7: [0,3,6,9],
  dimb7: [0,3,6,10],
  sus2: [0,2,7],
  sus4: [0,5,7],
  pentatonic: [0,2,4,7,9],
  dimPentatonic: [0,3,6,8,10],
},
CHORD_COLOR = {
  major: 'rgba(100,100,255,0.5)',
  minor: 'rgba(255,100,100,0.5)',
  major7: 'rgba(155,0,255,0.5)',
  minor7: 'rgba(255,0,155,0.5)',
  dom: 'rgba(255,100,0,0.5)',
  dom5: 'rgba(255,100,0,0.5)',
  dom9: 'rgba(255,155,0,0.5)',
  dim: 'rgba(100,255,100,0.5)',
  // dimbb7: 'rgba(0,155,0,0.5)',
  dimb7: 'rgba(0,255,0,0.5)',
  sus2: 'rgba(255,255,0,0.5)',
  sus4: 'rgba(255,255,0,0.5)',
  pentatonic: 'rgba(255,0,0,0.5)',
  dimPentatonic: 'rgba(0,200,0,0.5)',
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
  const pegs = getPegs(notes);
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

  return { notes: getNotes(pegs), tweekStatus };
};

export const generateNeighbors = (node, visited) => {
  const { notes, parentCenter, center } = node,
        parentNotes = node.parent ? node.parent.notes : null,
        adjustedPegs = [];
  let neighbors = [], temp, parentTweekStatus;

//Check if visited notes contain the tweeked notes
//If so, check if the center we want to put it at is also occupied, this will tell us not to include this neighbor

  for (var i = 0; i < 7; i++) {
    temp = tweek(notes, i);
    if (!isEqual(notes, temp.notes)) {
      if (isEqual(parentNotes, temp.notes)) {
        parentTweekStatus = temp.tweekStatus;
      } else if (!includesKey(visited, temp.notes)) {
        neighbors.push(temp);
      }
      adjustedPegs.push(i + 1);
    };
  }

  if (!parentNotes) {
    while(!isSameType(neighbors[0].notes, neighbors[1].notes)) {
      neighbors = rotate(neighbors);
    }
    neighbors.forEach((neighbor, i) => {
      neighbor.center = getCenter(center, DIRS[i]);
    })
  } else {
    const deltaX = 2 * center.x - parentCenter.x,
          deltaY = 2 * center.y - parentCenter.y;
    neighbors.forEach(neighbor => {
      if (isSameType(parentNotes, neighbor.notes)) {
        neighbor.center = { x: deltaX, y: parentCenter.y };
      } else if (neighbor.tweekStatus === parentTweekStatus) {
        neighbor.center = { x: parentCenter.x, y: deltaY };
      } else {
        neighbor.center = { x: deltaX, y: deltaY };
      }
    });
  }
  return { neighbors, adjustedPegs };
};

export const buildKeyWheel = start => {
  const queue = [start],
        visited = [start];
  let currentNode, neighbors, newNode;

  while (visited.length < 36) {
    currentNode = queue.shift();
    if (!currentNode) return start;
    neighbors = generateNeighbors(currentNode, visited).neighbors;
    neighbors.forEach(neighbor => {
      if (!neighbor) return;
      newNode = new ScaleNode(neighbor.notes, neighbor.center);
      currentNode.addChild(newNode);
      queue.push(newNode);
      visited.push(newNode);
    });
  }
  return visited;
};

export const keyReader = notes => {
  const pegs = getPegs(notes);
  let rootIdx = pegs[0], intervals = getIntervals(pegs),
      isMajorMatch, isMinorMatch, isNeaMatch, name;

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
      name = `${NOTE_NAMES[rootIdx]} Maj`;
      break;
    } else if (isMinorMatch) {
      name = `${NOTE_NAMES[rootIdx]} mel`;
      break;
    } else if (isNeaMatch) {
      name = `${NOTE_NAMES[rootIdx]} neo`;
      break;
    }

    rootIdx += intervals[0];
    intervals = rotate(intervals);
  }
  return { name, rootIdx };
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

export const getPegs = notes => {
  const pegs = [];
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};

export const getNotes = pegs => {
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
  const rotated = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === arr.length - 1) {
      rotated.push(arr[0]);
    } else {
      rotated.push(arr[i+1]);
    }
  }
  return rotated;
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
  let color = "transparent", rootIdx = 0;
  let chordShape;
  for (var i = 0; i < chords.length; i++) {
    chordShape = getNotes(SHAPE[chords[i]])
    if (isSameType(notes, chordShape)) {
      let temp = [...notes];
      while (!isEqual(temp, chordShape)) {
        temp = rotate(temp);
        rootIdx += 1;
      }
      color = CHORD_COLOR[chords[i]];
      name = `${NOTE_NAMES[rootIdx]} ${chords[i]}`;
      break;
    }
  }
  if (color === "transparent") {
    rootIdx = -1;
    name = "";
  }
  return { color, name, rootIdx };
};

export const getIntervals = pegs => {
  const intervals = [];
  for (let i = 0; i < pegs.length; i++) {
    if (i === pegs.length - 1) {
      intervals.push(12 + pegs[0] - pegs[i]);
    } else {
      intervals.push(pegs[i + 1] -  pegs[i]);
    }
  }
  return intervals;
};

export const updateCanvas = (ctx, radius, notes) => {
  const pegs = getPegs(notes);
  const start = {
    x: radius * (1 + Math.sin(Math.PI * pegs[0] / 6)),
    y: radius * (1 - Math.cos(Math.PI * pegs[0] / 6))
  };
  ctx.clearRect(0, 0, 2 * radius, 2 * radius);
  if (pegs.length < 3) return;
  ctx.strokeStyle = 'green';
  ctx.fillStyle = chordReader(notes).color;
  //draw chord
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  pegs.forEach((peg, i) => {
    if (i === 0) return;
    const newPos = {
      x: radius * (1 + Math.sin(Math.PI * peg / 6)),
      y: radius * (1 - Math.cos(Math.PI * peg / 6))
    };
    let x = ctx.lineTo(newPos.x, newPos.y);
  })
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
};

export const getMajor = rootIdx => {
  let temp = rootIdx;
  const pegs = [temp];
  for (let i = 0; i + 1 < MAJOR.length; i++) {
    temp += MAJOR[i];
    pegs.push(temp % 12);
  }
  return pegs;
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
