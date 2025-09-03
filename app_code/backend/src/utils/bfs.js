
export function bfsShortestPath(graph, start, goal) {
  if (start === goal) return { path: [start], distance: 0 };

  const queue = [start];
  const visited = new Set([start]);
  const prev = new Map(); // child -> parent

  while (queue.length) {
    const cur = queue.shift();
    for (const nxt of graph.get(cur) || []) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      prev.set(nxt, cur);

      if (nxt === goal) {
      
        const path = [goal];
        let p = goal;
        while (prev.has(p)) {
          p = prev.get(p);
          path.push(p);
        }
        path.reverse();
        return { path, distance: path.length - 1 };
      }
      queue.push(nxt);
    }
  }
  return null; 
}
