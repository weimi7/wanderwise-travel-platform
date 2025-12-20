'use strict';

const bookingConfirmationTemplate = ({ name, destination, date, amount }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Booking Confirmed 🎉</h2>
      <p>Hello ${name},</p>
      <p>Your booking with <strong>WanderWise</strong> has been successfully confirmed.</p>
      <table cellpadding="6">
        <tr>
          <td><strong>Reference</strong></td>
          <td>${destination}</td>
        </tr>
        <tr>
          <td><strong>Date</strong></td>
          <td>${date}</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td>LKR ${amount}</td>
        </tr>
      </table>
      <p>We wish you a wonderful journey 🌍</p>
      <p>— WanderWise Team</p>
    </div>
  `;
};

module.exports = bookingConfirmationTemplate;
