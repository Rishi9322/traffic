/**
 * Seed Script — populates the OSTAS DB with demo data.
 * Run: node utils/seed.js
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, initDB } from '../db/index.js';
import { users, reports, feedback } from '../db/schema.js';
import { generateId } from './uuid.js';

const EXPIRY_HOURS = 6;
function expiresAt(hoursFromNow = EXPIRY_HOURS) {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    return d.toISOString();
}
function createdAt(hoursAgo) {
    const d = new Date();
    d.setHours(d.getHours() - hoursAgo);
    return d.toISOString();
}

async function seed() {
    await initDB();

    // ─── USERS ─────────────────────────────────────────────────────────────────
    const adminId = generateId();
    const rahulId = generateId();
    const priyaId = generateId();
    const amitId = generateId();

    const usersData = [
        { id: adminId, username: 'admin', email: 'admin@ostas.com', password: 'Admin@1234', role: 'admin' },
        { id: rahulId, username: 'rahul_m', email: 'rahul@test.com', password: 'Test@1234', role: 'user' },
        { id: priyaId, username: 'priya_s', email: 'priya@test.com', password: 'Test@1234', role: 'user' },
        { id: amitId, username: 'amit_k', email: 'amit@test.com', password: 'Test@1234', role: 'user' },
    ];

    for (const u of usersData) {
        const passwordHash = await bcrypt.hash(u.password, 12);
        await db.insert(users).values({ id: u.id, username: u.username, email: u.email, passwordHash, role: u.role })
            .onConflictDoNothing();
        console.log(`✅ Seeded user: ${u.username}`);
    }

    // ─── REPORTS ───────────────────────────────────────────────────────────────
    const reportAuthors = [rahulId, priyaId, amitId, adminId];
    const reportData = [
        // Mumbai
        { type: 'accident', level: 'heavy', lat: 19.0760, lng: 72.8777, loc: 'Bandra, Mumbai', desc: 'Major accident on the Western Express Highway near Bandra Toll. Multiple vehicles involved. Avoid the route.', status: 'active', author: rahulId, anon: 0, hoursAgo: 1 },
        { type: 'congestion', level: 'heavy', lat: 19.0820, lng: 72.8900, loc: 'Andheri West, Mumbai', desc: 'Severe traffic jam near Andheri station due to a local festival. Expect 45-minute delays.', status: 'active', author: priyaId, anon: 0, hoursAgo: 0.5 },
        { type: 'waterlogging', level: 'medium', lat: 19.0700, lng: 72.8650, loc: 'Dharavi, Mumbai', desc: 'Heavy waterlogging on LBS Marg near Dharavi junction. Road is partially submerged.', status: 'active', author: amitId, anon: 1, hoursAgo: 2 },
        { type: 'roadblock', level: 'heavy', lat: 19.0900, lng: 72.8850, loc: 'Jogeshwari, Mumbai', desc: 'Road blocked near Jogeshwari due to tree fall. One lane completely blocked. Alternate via SV Road.', status: 'resolved', author: rahulId, anon: 0, hoursAgo: 5 },
        { type: 'other', level: 'light', lat: 19.0650, lng: 72.8700, loc: 'Wadala, Mumbai', desc: 'Broken signal at Wadala junction causing minor delays. Police arrived but traffic still slow.', status: 'active', author: priyaId, anon: 0, hoursAgo: 0.3 },

        // Delhi
        { type: 'accident', level: 'heavy', lat: 28.7041, lng: 77.1025, loc: 'Connaught Place, Delhi', desc: 'Two-vehicle collision near CP Inner Circle. Ambulance on site. Sharp left lane closed.', status: 'active', author: amitId, anon: 0, hoursAgo: 1.5 },
        { type: 'congestion', level: 'medium', lat: 28.6800, lng: 77.0800, loc: 'Karol Bagh, Delhi', desc: 'Heavy congestion near Karol Bagh market area. Weekend shopping traffic adding to the mess.', status: 'active', author: rahulId, anon: 1, hoursAgo: 2 },
        { type: 'roadblock', level: 'light', lat: 28.7200, lng: 77.1100, loc: 'Model Town, Delhi', desc: 'Minor roadblock due to water pipe repair. Expected to clear in 30 minutes.', status: 'expired', author: priyaId, anon: 0, hoursAgo: 7 },
        { type: 'congestion', level: 'heavy', lat: 28.6500, lng: 77.0600, loc: 'Nehru Place, Delhi', desc: 'Peak hour congestion at Nehru Place flyover. Vehicles backed up for 3 km towards Saket.', status: 'active', author: amitId, anon: 0, hoursAgo: 0.8 },
        { type: 'other', level: 'medium', lat: 28.7100, lng: 77.0900, loc: 'GTB Nagar, Delhi', desc: 'VIP convoy causing temporary road closure on Ring Road near GTB Nagar metro. Expect 20 min delay.', status: 'active', author: rahulId, anon: 0, hoursAgo: 0.2 },

        // Bangalore
        { type: 'accident', level: 'medium', lat: 12.9716, lng: 77.5946, loc: 'Koramangala, Bangalore', desc: 'Minor fender-bender near Koramangala 4th Block. Left lane clear. Slow moving traffic only.', status: 'active', author: priyaId, anon: 0, hoursAgo: 1 },
        { type: 'congestion', level: 'heavy', lat: 12.9600, lng: 77.6100, loc: 'Silk Board, Bangalore', desc: 'Silk Board junction completely gridlocked. Both flyover and service roads affected. Take Hosur Road alternate.', status: 'active', author: amitId, anon: 1, hoursAgo: 0.5 },
        { type: 'waterlogging', level: 'heavy', lat: 12.9800, lng: 77.5800, loc: 'Indiranagar, Bangalore', desc: 'Major waterlogging on 100 Feet Road near CMH Road. Vehicles stalling. Avoid completely.', status: 'active', author: rahulId, anon: 0, hoursAgo: 3 },
        { type: 'roadblock', level: 'medium', lat: 12.9900, lng: 77.6000, loc: 'Hebbal, Bangalore', desc: 'Metro construction work causing roadblock. One lane open with traffic cops managing flow.', status: 'resolved', author: priyaId, anon: 0, hoursAgo: 4 },
        { type: 'other', level: 'light', lat: 12.9500, lng: 77.5700, loc: 'JP Nagar, Bangalore', desc: 'Procession passing through JP Nagar 3rd Phase. Expect 15-minute delays near 24th Main.', status: 'active', author: amitId, anon: 0, hoursAgo: 0.7 },

        // Chennai
        { type: 'accident', level: 'heavy', lat: 13.0827, lng: 80.2707, loc: 'Anna Salai, Chennai', desc: 'Truck-car collision on Anna Salai near Valluvar Kottam. Right lane blocked. Ambulance dispatched.', status: 'active', author: rahulId, anon: 1, hoursAgo: 2 },
        { type: 'congestion', level: 'medium', lat: 13.0700, lng: 80.2600, loc: 'T. Nagar, Chennai', desc: 'Heavy footfall near Ranganathan Street causing spillover traffic. Parking blocked on both sides.', status: 'active', author: priyaId, anon: 0, hoursAgo: 1 },
        { type: 'waterlogging', level: 'light', lat: 13.0500, lng: 80.2500, loc: 'Adyar, Chennai', desc: 'Minor puddle near Adyar bridge after unexpected shower. Manageable but slow.', status: 'expired', author: amitId, anon: 0, hoursAgo: 8 },

        // Hyderabad
        { type: 'congestion', level: 'heavy', lat: 17.3850, lng: 78.4867, loc: 'HITEC City, Hyderabad', desc: 'Peak hour IT crowd congestion on Mindspace junction. All lanes blocked. MMTS is quicker option.', status: 'active', author: rahulId, anon: 0, hoursAgo: 0.5 },
        { type: 'accident', level: 'light', lat: 17.4000, lng: 78.4700, loc: 'Gachibowli, Hyderabad', desc: 'Motorcycle skid near Gachibowli flyover. Rider injured, police on scene. Slow traffic.', status: 'active', author: priyaId, anon: 0, hoursAgo: 0.3 },
    ];

    for (const r of reportData) {
        const id = generateId();
        const ca = createdAt(r.hoursAgo);
        const ea = r.status === 'expired' ? createdAt(-1) : expiresAt(EXPIRY_HOURS);
        await db.insert(reports).values({
            id, authorId: r.author, type: r.type, congestionLevel: r.level,
            description: r.desc, latitude: r.lat, longitude: r.lng,
            locationName: r.loc, status: r.status, isAnonymous: r.anon,
            upvotes: Math.floor(Math.random() * 20), expiresAt: ea, createdAt: ca, updatedAt: ca,
        }).onConflictDoNothing();
        console.log(`✅ Seeded report: ${r.type} @ ${r.loc}`);
    }

    // ─── FEEDBACK ──────────────────────────────────────────────────────────────
    const feedbackEntries = [
        { name: 'Rahul Mehta', email: 'rahul@test.com', message: 'Great app! Found it very useful during my commute. The map feature is excellent.' },
        { name: 'Priya Singh', email: 'priya@test.com', message: 'Would love a feature to share reports via WhatsApp. Otherwise very helpful app!' },
        { name: 'Amit Kumar', email: 'amit@test.com', message: 'The notification bell is a great feature. Got an alert about an accident and took the alternate route.' },
        { name: 'Sunita Patel', email: 'sunita@example.com', message: 'Found a bug: the location picker sometimes pins at the wrong spot. Please fix.' },
        { name: 'Vikram Sharma', email: 'vikram@example.com', message: 'This app has saved me hours of commute time. Keep up the amazing work!' },
    ];

    for (const f of feedbackEntries) {
        await db.insert(feedback).values({ id: generateId(), ...f }).onConflictDoNothing();
        console.log(`✅ Seeded feedback: ${f.name}`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('Admin credentials: admin@ostas.com / Admin@1234');
    console.log('User credentials: rahul@test.com / Test@1234');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
