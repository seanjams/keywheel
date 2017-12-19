export const CMAJOR = [true, false, true, false, true, true, false, true, false, true, false, true];
export const EMPTY_SCALE = () => {
  return [false, false, false, false, false, false, false, false, false, false, false, false];
}


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
  if (!(notes instanceof Array)) {
    console.log(notes);
  }
  const pegs = [];
  // console.log(notes);
  notes.forEach((note, i) => {
    if (note) pegs.push(i)
  });
  return pegs;
};



export const pegsToNotes = (pegs) => {
  const notes = EMPTY_SCALE();
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



export const neighbors = notes => {
  const neighbors = [];
  const pegs = notesToPegs(notes);
  let temp;

  pegs.forEach((peg, num) => {
    temp = tweek(notes, num + 1);
    if (!isEqual(notes, temp)) {
      neighbors.push(temp)
    }
  })
  return neighbors;
};



export const isEqual = (notes1, notes2) => {
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

  while (visited.length < 36) {
    currentNode = queue.pop();
    neighbs = neighbors(currentNode.notes);
    neighbs.forEach(neighborKey => {
      node = new ScaleNode(neighborKey);
      if (!currentNode.parent || !isEqual(neighborKey, currentNode.parent.notes)) {
        currentNode.addChild(node);
        visited.push(node);
        queue.push(node);
      }
    });
  }
  visited.forEach(notes => {
    notesToPegs(notes);
  });
  return start;
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
