import { NextResponse } from 'next/server';
import Airtable from 'airtable';

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    const records = await base('Events').select().all();
    const events = records.map((record) => ({
      id: record.id,
      name: record.get('Name') as string,
      date: record.get('Date') as string,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
