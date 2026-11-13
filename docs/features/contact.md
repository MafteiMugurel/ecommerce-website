# Contact

## What the user sees
`/contact` (from the ☰ menu): the store’s contact details (address, phone, email, opening hours – placeholder values) and a form with **name, email, subject, message**.

## Flow
1. The user fills in the form (all fields required; length limits: name 100, email 200, subject 200, message 5000).
2. “Send message” → the message is saved in the `messages` collection.
3. A confirmation appears and the form is cleared; an error message appears if sending fails.

Anyone can send; **only admins can read** messages – in the dashboard (“Latest contact messages”) and in the Firebase console. No email is sent automatically.

## Changing the contact details
See [How to change things](../07-how-to-change-things.md#-change-the-contact-details-address-phone-opening-hours).

## Files
`src/pages/ContactPage.tsx` · `src/services/messageService.ts`
