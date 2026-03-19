import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setUser(res.data);
            }).catch(() => {
                localStorage.removeItem('token');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { username, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const register = async (username, email, password, captchaQuestion, captchaAnswer) => {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, { 
            username, 
            email, 
            password,
            captchaQuestion,
            captchaAnswer
        });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updatedFields) => {
        setUser(prev => ({ ...prev, ...updatedFields }));
    };

    return (
        <AuthContext.Provider value={{ user, token: localStorage.getItem('token'), login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
