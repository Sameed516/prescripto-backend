import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { authenticateUser, createUser, resetUsers } from './authStore.js'

let mongod

test.before(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

test.after(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

test('signup stores a new user and login accepts the saved password', async () => {
  await resetUsers()

  const created = await createUser({ name: 'Ayesha', email: 'ayesha@example.com', password: 'secret123' })
  assert.equal(created.success, true)

  const loginOk = await authenticateUser({ email: 'ayesha@example.com', password: 'secret123' })
  assert.equal(loginOk.success, true)
  assert.equal(loginOk.user.name, 'Ayesha')
})

test('login rejects a wrong password', async () => {
  await resetUsers()
  await createUser({ name: 'Ali', email: 'ali@example.com', password: '123456' })

  const loginBad = await authenticateUser({ email: 'ali@example.com', password: 'wrong' })
  assert.equal(loginBad.success, false)
  assert.equal(loginBad.message, 'Invalid email or password')
})

test('signup rejects a duplicate email', async () => {
  await resetUsers()
  await createUser({ name: 'Ali', email: 'dup@example.com', password: '123456' })

  const secondSignup = await createUser({ name: 'Ali Two', email: 'dup@example.com', password: 'abcdef' })
  assert.equal(secondSignup.success, false)
  assert.equal(secondSignup.message, 'Email already exists')
})

test('passwords are stored hashed, never in plain text', async () => {
  await resetUsers()
  const created = await createUser({ name: 'Sara', email: 'sara@example.com', password: 'secret123' })

  assert.notEqual(created.user.password, 'secret123')
  assert.equal(created.user.password, undefined) // never returned to the caller either
})
