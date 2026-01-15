import axios from 'axios';

async function createTestUser() {
    try {
        console.log('Creating admin user...');
        const signupResponse = await axios.post('http://localhost:5001/api/auth/signup', {
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@fundwatch.com',
            password: 'password123',
            role: 'ADMIN'
        });
        console.log('✅ Admin user created:', signupResponse.data);
    } catch (signupError) {
        if (signupError.response?.data?.message?.includes('already exists')) {
            console.log('ℹ️  Admin user already exists');
        } else {
            console.error('❌ Signup error:', signupError.response?.data || signupError.message);
        }
    }

    try {
        console.log('\nTesting login...');
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@fundwatch.com',
            password: 'password123'
        });
        console.log('✅ Login successful!');
        console.log('User:', loginResponse.data);
    } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
    }

    // Create additional test users
    const testUsers = [
        { username: 'approver', firstName: 'Finance', lastName: 'Manager', email: 'approver@fundwatch.com', role: 'STAFF' },
        { username: 'encoder', firstName: 'Data', lastName: 'Encoder', email: 'encoder@fundwatch.com', role: 'USER' }
    ];

    for (const user of testUsers) {
        try {
            await axios.post('http://localhost:5001/api/auth/signup', { ...user, password: 'password123' });
            console.log(`✅ Created ${user.role} user: ${user.email}`);
        } catch (err) {
            if (err.response?.data?.message?.includes('already exists')) {
                console.log(`ℹ️  ${user.email} already exists`);
            } else {
                console.error(`❌ Error creating ${user.email}:`, err.response?.data?.message);
            }
        }
    }
}

createTestUser();
