import twilio from 'twilio'

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env

const isConfigured = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER)

const client = isConfigured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null

/**
 * Sends an SMS. If Twilio credentials aren't set in .env yet, it logs the
 * message to the console instead of throwing — so the reminder flow still
 * works end-to-end while you're developing without a real Twilio account.
 */
export const sendSms = async (toNumber, message) => {
  if (!isConfigured) {
    console.log(`[SMS - not sent, Twilio not configured] To: ${toNumber} | ${message}`)
    return { success: true, simulated: true }
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: TWILIO_FROM_NUMBER,
      to: toNumber,
    })
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error(`[SMS] Failed to send to ${toNumber}:`, error.message)
    return { success: false, message: error.message }
  }
}
