import Doctor from "./models/Doctor.js";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const resetDoctors = async () => {
  await Doctor.deleteMany({});
};

export const createDoctor = async ({
  name,
  role,
  fee,
  image,
  availability,
}) => {
  if (!name || !name.trim()) {
    return { success: false, message: "Doctor name is required" };
  }
  if (!role || !role.trim()) {
    return { success: false, message: "Role or specialty is required" };
  }

  const parsedFee = Number(fee);
  if (!Number.isFinite(parsedFee) || parsedFee < 0) {
    return {
      success: false,
      message: "Fee must be a valid, non-negative number",
    };
  }

  const start = availability?.start;
  const end = availability?.end;
  if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) {
    return {
      success: false,
      message: "Availability start/end must be in HH:mm 24-hour format",
    };
  }
  if (start >= end) {
    return {
      success: false,
      message: "Availability start time must be before the end time",
    };
  }

  const existing = await Doctor.findOne({ name: name.trim() });
  if (existing) {
    return {
      success: false,
      message: "A doctor with this name already exists",
    };
  }

  const doctor = await Doctor.create({
    name: name.trim(),
    role: role.trim(),
    fee: parsedFee,
    image: image && image.trim() ? image.trim() : "/doctor.jpg",
    availability: { start, end },
  });

  return { success: true, doctor };
};

export const listDoctors = async () => Doctor.find().sort({ createdAt: 1 });

export const doctorExists = async (name) =>
  Boolean(await Doctor.exists({ name: name.trim() }));
