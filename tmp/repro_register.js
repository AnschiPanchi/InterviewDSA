import axios from 'axios';

const testRegistration = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: 'password123',
            captchaQuestion: '5 + 3',
            captchaAnswer: '8'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', err.response?.data);
    }
};

testRegistration();
