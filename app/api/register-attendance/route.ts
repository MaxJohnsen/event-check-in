import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, mobile, eventId } = await request.json();

    // Check if contact exists
    let contactId;
    const existingContacts = await base('Contacts').select({
      filterByFormula: `{Email} = '${email}'`
    }).firstPage();

    if (existingContacts.length > 0) {
      const existingContact = existingContacts[0];
      contactId = existingContact.id;

      // Check if any information has changed
      const fields = existingContact.fields;
      const hasChanged = 
        fields.Name !== name ||
        fields.Company !== company ||
        fields.Mobile !== mobile;

      if (hasChanged) {
        // Update the contact information
        await base('Contacts').update(contactId, {
          Name: name,
          Company: company,
          Mobile: mobile
        });
      }
    } else {
      // Create a new contact
      const newContact = await base('Contacts').create({
        Name: name,
        Email: email,
        Company: company,
        Mobile: mobile
      });
      contactId = newContact.id;
    }

    // Register attendance
    const attendance = await base('Attendance').create({
      Contact: [contactId],
      Event: [eventId]
    });

    return NextResponse.json({ success: true, attendanceId: attendance.id });
  } catch (error) {
    console.error('Error registering attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
