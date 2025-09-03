import mongoose from "mongoose";
import Hub from "../models/Hub.js";

/** Create a hub */
export const createHub = async (req, res, next) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "hubId and name required" });
    }

    // Check both hubId and name
    const exists = await Hub.findOne({
      $or: [{ id }, { name }]
    });

    if (exists) {
      if (exists.id === id) {
        return res.status(409).json({ error: "Hub ID already exists" });
      }
      if (exists.name === name) {
        return res.status(409).json({ error: "Hub Name already exists" });
      }
    }

    const hub = await Hub.create({ id , name });
    res.status(201).json(hub);
  } catch (e) {
    next(e);
  }
};


/** List all hubs  */
export const listHubs = async (_req, res, next) => {
  try {
    const hubs = await Hub.find().sort({ id : 1 });
    const connectionsCount = hubs.reduce((sum, h) => sum + (h.connectedHubs?.length || 0), 0);
    const avgPerHub = hubs.length ? +(connectionsCount / hubs.length).toFixed(2) : 0;
    res.json({ hubs, stats: { hubs: hubs.length, connections: connectionsCount, avgPerHub } });
  } catch (e) { next(e); }
};


/** Get a single hub by hubId */
export const getHub = async (req, res, next) => {
  try {
    const hub = await Hub.findOne({ id: req.params.id });
    if (!hub) return res.status(404).json({ error: "Hub not found" });
    res.json(hub);x
  } catch (e) { next(e); }
};

/** Connect two hubs bi-directionally */
export const connectHubs = async (req, res, next) => {
  try {
    const { sourceHubId, targetHubId } = req.body;

    if (!sourceHubId || !targetHubId) {
      return res.status(400).json({ error: "Both hub IDs required" });
    }
    if (sourceHubId === targetHubId) {
      return res.status(400).json({ error: "Cannot connect a hub to itself" });
    }

    const hubA = await Hub.findOne({ id: sourceHubId });
    const hubB = await Hub.findOne({ id: targetHubId });

    if (!hubA || !hubB) {
      return res.status(404).json({ error: "One or both hubs not found" });
    }

    // Check if already connected
    if (hubA.connectedHubs.includes(targetHubId)) {
      return res.status(400).json({ error: "These hubs are already connected" });
    }

    hubA.connectedHubs.push(targetHubId);
    hubB.connectedHubs.push(sourceHubId);

    await hubA.save();
    await hubB.save();

    res.json({
      message: "Connected hubs successfully",
      hubA,
      hubB,
    });
  } catch (e) {
    next(e);
  }
};


/** Disconnect two hubs bi-directionally */
export const disconnectHubs = async (req, res, next) => {
  const { a, b } = req.body;
  if (!a || !b) return res.status(400).json({ error: "Provide hubIds a and b" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [ha, hb] = await Promise.all([
      Hub.findOne({ id: a }).session(session),
      Hub.findOne({ id: b }).session(session)
    ]);
    if (!ha || !hb) throw new Error("Both hubs must exist");

    ha.connectedHubs = ha.connectedHubs.filter((x) => x !== b);
    hb.connectedHubs = hb.connectedHubs.filter((x) => x !== a);

    await ha.save({ session });
    await hb.save({ session });

    await session.commitTransaction();
    res.json({ message: "Disconnected", a: ha, b: hb });
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

