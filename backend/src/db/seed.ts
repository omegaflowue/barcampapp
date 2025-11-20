import { pool } from '../config/database';

const seedSQL = `
-- Insert sample event
INSERT INTO events (name, date, status) VALUES
    ('DevCamp 2025', '2025-12-12', 'VOTING')
RETURNING id;

-- Store event ID for subsequent inserts
DO $$
DECLARE
    event_id UUID;
    room1_id UUID;
    room2_id UUID;
    room3_id UUID;
    slot1_id UUID;
    slot2_id UUID;
    slot3_id UUID;
BEGIN
    -- Get the event ID
    SELECT id INTO event_id FROM events WHERE name = 'DevCamp 2025';

    -- Insert rooms
    INSERT INTO rooms (event_id, name, capacity, infrastructure) VALUES
        (event_id, 'Großer Saal', 100, '["BEAMER", "WHITEBOARD"]'),
        (event_id, 'Workshop-Raum A', 30, '["BEAMER", "FLIPCHART"]'),
        (event_id, 'Seminarraum B', 20, '["FLIPCHART", "WHITEBOARD"]')
    RETURNING id INTO room1_id, room2_id, room3_id;

    -- Insert time slots
    INSERT INTO time_slots (event_id, start_time, end_time) VALUES
        (event_id, '2025-12-12 10:00:00', '2025-12-12 10:45:00'),
        (event_id, '2025-12-12 11:00:00', '2025-12-12 11:45:00'),
        (event_id, '2025-12-12 13:00:00', '2025-12-12 13:45:00')
    RETURNING id INTO slot1_id, slot2_id, slot3_id;

    -- Insert sample sessions
    INSERT INTO sessions (event_id, title, description, presenter, duration, infrastructure, vote_count) VALUES
        (event_id, 'KI in der Bildung', 'Wie künstliche Intelligenz den Bildungssektor revolutioniert', 'Sarah Müller', 45, '["BEAMER"]', 42),
        (event_id, 'Agile Methoden im Team', 'Praktische Einführung in Scrum und Kanban', 'Tom Klein', 45, '["FLIPCHART"]', 38),
        (event_id, 'Blockchain Basics', 'Grundlagen der Blockchain-Technologie verständlich erklärt', 'Lisa Weber', 30, '["BEAMER"]', 35),
        (event_id, 'Progressive Web Apps', 'Von der Webseite zur installierbaren App', 'Max Schmidt', 45, '["BEAMER", "WHITEBOARD"]', 28),
        (event_id, 'UX Design Prinzipien', 'Nutzerzentriertes Design in der Praxis', 'Anna Bauer', 45, '["FLIPCHART"]', 31),
        (event_id, 'Docker für Einsteiger', 'Container-Technologie leicht gemacht', 'Chris Meyer', 45, '["BEAMER"]', 26),
        (event_id, 'TypeScript Best Practices', 'Typsicherer Code für bessere Wartbarkeit', 'Julia Fischer', 30, '["BEAMER"]', 22),
        (event_id, 'GraphQL vs REST', 'API-Design-Entscheidungen im Vergleich', 'David Wagner', 45, '["WHITEBOARD"]', 19);
END $$;
`;

export async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with sample data...');
    await client.query(seedSQL);
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
