import bcrypt from 'bcrypt'
import User from './models/User.js'

const SALT_ROUNDS = 10

export const resetUsers = async () => {
  await User.deleteMany({})
}

const toSafeUser = (userDoc) => {
  const { password, __v, ...safeUser } = userDoc.toObject()
  return safeUser
}

export const createUser = async ({ name, email, password }) => {
  if (!name || !name.trim()) {
    return { success: false, message: 'Name is required' }
  }
  if (!email || !email.trim()) {
    return { success: false, message: 'Email is required' }
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return { success: false, message: 'Email already exists' }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  })

  return { success: true, user: toSafeUser(user) }
}

export const authenticateUser = async ({ email, password }) => {
  if (!email || !password) {
    return { success: false, message: 'Invalid email or password' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    return { success: false, message: 'Invalid email or password' }
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    return { success: false, message: 'Invalid email or password' }
  }

  return { success: true, user: toSafeUser(user) }
}
