import mongoose from "mongoose";

const HubSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, index: true, trim: true },
        name: {
            type: String, required: true,
            unique: true,       // name must also be unique
            trim: true
        },
        // store neighbor hubIds (undirected graph)
        connectedHubs: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => Array.isArray(arr) && new Set(arr).size === arr.length,
                message: "Duplicate connection ids are not allowed"
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Hub", HubSchema);
