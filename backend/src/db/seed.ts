import { pool } from '../config/database';

export async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with sample data...');

    // Insert sample event
    const eventResult = await client.query(`
      INSERT INTO events (name, date, status) VALUES
      ('DevCamp 2025', '2025-12-12', 'VOTING')
      RETURNING id
    `);
    const eventId = eventResult.rows[0].id;
    console.log(`✅ Event created with ID: ${eventId}`);

    // Insert rooms
    await client.query(`
      INSERT INTO rooms (event_id, name, capacity, infrastructure) VALUES
      ($1, 'Großer Saal', 100, '["BEAMER", "WHITEBOARD"]'),
      ($1, 'Workshop-Raum A', 30, '["BEAMER", "FLIPCHART"]'),
      ($1, 'Seminarraum B', 20, '["FLIPCHART", "WHITEBOARD"]')
    `, [eventId]);
    console.log('✅ Rooms created');

    // Insert time slots
    await client.query(`
      INSERT INTO time_slots (event_id, start_time, end_time, type, label) VALUES
      ($1, '2025-12-12 09:00:00', '2025-12-12 09:30:00', 'BREAKFAST', 'Frühstück & Anmeldung'),
      ($1, '2025-12-12 09:30:00', '2025-12-12 10:15:00', 'SESSION', 'Session 1'),
      ($1, '2025-12-12 10:30:00', '2025-12-12 11:15:00', 'SESSION', 'Session 2'),
      ($1, '2025-12-12 11:30:00', '2025-12-12 12:15:00', 'SESSION', 'Session 3'),
      ($1, '2025-12-12 12:15:00', '2025-12-12 13:30:00', 'LUNCH', 'Mittagspause'),
      ($1, '2025-12-12 13:30:00', '2025-12-12 14:15:00', 'SESSION', 'Session 4'),
      ($1, '2025-12-12 14:30:00', '2025-12-12 15:15:00', 'SESSION', 'Session 5'),
      ($1, '2025-12-12 18:00:00', '2025-12-12 20:00:00', 'DINNER', 'Abendessen')
    `, [eventId]);
    console.log('✅ Time slots created');

    // Insert sample sessions
    await client.query(`
      INSERT INTO sessions (event_id, title, description, presenter, duration, infrastructure, vote_count) VALUES
      ($1, 'KI in der Bildung', 'Wie künstliche Intelligenz den Bildungssektor revolutioniert', 'Sarah Müller', 45, '["BEAMER"]', 42),
      ($1, 'Agile Methoden im Team', 'Praktische Einführung in Scrum und Kanban', 'Tom Klein', 45, '["FLIPCHART"]', 38),
      ($1, 'Blockchain Basics', 'Grundlagen der Blockchain-Technologie verständlich erklärt', 'Lisa Weber', 30, '["BEAMER"]', 35),
      ($1, 'Progressive Web Apps', 'Von der Webseite zur installierbaren App', 'Max Schmidt', 45, '["BEAMER", "WHITEBOARD"]', 28),
      ($1, 'UX Design Prinzipien', 'Nutzerzentriertes Design in der Praxis', 'Anna Bauer', 45, '["FLIPCHART"]', 31),
      ($1, 'Docker für Einsteiger', 'Container-Technologie leicht gemacht', 'Chris Meyer', 45, '["BEAMER"]', 26),
      ($1, 'TypeScript Best Practices', 'Typsicherer Code für bessere Wartbarkeit', 'Julia Fischer', 30, '["BEAMER"]', 22),
      ($1, 'GraphQL vs REST', 'API-Design-Entscheidungen im Vergleich', 'David Wagner', 45, '["WHITEBOARD"]', 19)
    `, [eventId]);
    console.log('✅ Sessions created');

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
