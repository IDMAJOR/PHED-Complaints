import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  key: { type: String, required: true },
  agentname: { type: String, required: true },
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
