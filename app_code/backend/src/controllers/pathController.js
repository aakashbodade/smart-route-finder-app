import Hub from "../models/Hub.js";
import { bfsShortestPath } from "../utils/bfs.js";

/** Shortest path between two hubs (BFS) */
export const shortestPath = async (req, res, next) => {
  try {
    const { source, destination } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    const hubs = await Hub.find({}, { id: 1, connectedHubs: 1 });
    const graph = new Map();
    hubs.forEach(h => graph.set(h.id, h.connectedHubs));

    if (!graph.has(source) || !graph.has(destination)) {
      return res.status(404).json({ error: "source or destination not found" });
    }

    const result = bfsShortestPath(graph, source, destination);
    if (!result) return res.status(404).json({ error: "No path found" });

    res.json(result); // { path: [...], distance: number }
  } catch (e) { next(e); }
};
