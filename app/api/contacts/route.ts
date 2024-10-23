import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    const records = await base('Contacts').select().all();
    const contacts = records.map((record) => ({
      id: record.id,
      name: record.get('Name'),
      email: record.get('Email'),
      mobile: record.get('Mobile'),
      company: record.get('Company'),
    }));

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
