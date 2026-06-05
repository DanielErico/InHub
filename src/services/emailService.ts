import emailjs from '@emailjs/browser';

// These should be configured in your .env file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_placeholder";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_placeholder";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "public_key_placeholder";

export const emailService = {
  /**
   * Sends an email notification to the tutor regarding course review status.
   */
  async sendCourseFeedbackEmail(
    tutorEmail: string,
    tutorName: string,
    courseTitle: string,
    status: 'approved' | 'rejected' | 'sent back for changes',
    feedback: string
  ): Promise<boolean> {
    try {
      if (EMAILJS_SERVICE_ID === "service_placeholder") {
        console.warn("EmailJS is not configured. Email to", tutorEmail, "was not sent.");
        return false; // Return false to indicate no email was actually sent
      }

      const templateParams = {
        to_email: tutorEmail,
        to_name: tutorName,
        course_title: courseTitle,
        status_label: status.toUpperCase(),
        feedback_message: feedback || "Your course has been approved and is now live!",
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully!', response.status, response.text);
      return true;
    } catch (err) {
      console.error('Failed to send email:', err);
      return false;
    }
  }
};
