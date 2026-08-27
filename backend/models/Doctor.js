import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    role: { type: String, required: true, trim: true }, // e.g. 'Senior Dentist', 'Orthodontist'
    fee: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "/doctor.jpg" },
    availability: {
      start: { type: String, required: true }, // 'HH:mm', 24hr
      end: { type: String, required: true }, // 'HH:mm', 24hr
    },
  },
  { timestamps: true },
);

export default mongoose.model("Doctor", doctorSchema);
