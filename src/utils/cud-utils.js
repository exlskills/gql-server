export const cudArrayElements = (cudArray, objArray, noDups = true) => {
  let processed = 0;
  let modified = 0;
  cudArray.forEach(e => {
    processed++;
    if (e.cudAction === 'C') {
      let pos = -1;
      if (noDups) {
        pos = objArray.indexOf(e.valueToAssign);
      }
      if (pos < 0) {
        objArray.push(e.valueToAssign);
        modified++;
      }
    } else {
      const pos = objArray.indexOf(e.valueToFind);
      if (pos >= 0) {
        objArray.splice(pos, 1);
        // always "modified" even if add is skipped due to dups
        modified++;
        if (e.cudAction === 'U') {
          let pos1 = -1;
          if (noDups) {
            pos1 = objArray.indexOf(e.valueToAssign);
          }
          if (pos1 < 0) {
            objArray.push(e.valueToAssign);
          }
        }
      }
    }
  });
  return { processed, modified };
};
