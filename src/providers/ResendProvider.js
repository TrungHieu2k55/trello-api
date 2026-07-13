import { Resend } from 'resend'

const resendInstance = new Resend(process.env.RESEND_API_KEY)

const ADMIN_SENDER_EMAIL = process.env.ADMIN_SENDER_EMAIL

//Function gửi mail
const sendMail = async ({ to, subject, html }) => {

  try {
    const data = await resendInstance.emails.send({
      from: ADMIN_SENDER_EMAIL,
      to,
      subject,
      html
    })

    return data
  } catch (error) {
    throw error
  }
}

export const ResendProvider = {
  sendMail
}
