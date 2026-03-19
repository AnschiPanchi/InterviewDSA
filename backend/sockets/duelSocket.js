import { judgeDuel } from '../utils/judgeAgent.js';
import User from '../models/User.js';
import { checkAchievements } from '../utils/achievementEngine.js';

// Simple in-memory room storage for MVP
const rooms = new Map();

export default (io) => {
    io.on('connection', (socket) => {
        console.log('User connected to Duel:', socket.id);

        socket.on('join_room', (data) => {
            const { roomId, username } = data;
            socket.join(roomId);

            if (!rooms.has(roomId)) {
                rooms.set(roomId, { 
                    players: [], 
                    status: 'waiting', 
                    submissions: {},
                    language: 'javascript',
                    problem: {
                        title: "Two Sum", 
                        difficulty: "Easy",
                        desc: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
                        tags: ["Array", "Hash Table"]
                    }
                });
            }

            const room = rooms.get(roomId);
            if (room.players.length < 2 && !room.players.find(p => p.username === username)) {
                room.players.push({ id: socket.id, username });
            }

            if (room.players.length === 2) {
                room.status = 'duel';
            }

            io.to(roomId).emit('room_update', room);
        });

        socket.on('submit_code', async (data) => {
            const { roomId, username, code } = data;
            const room = rooms.get(roomId);
            if (!room) return;

            room.submissions[username] = code;
            if (data.language) room.language = data.language;
            
            io.to(roomId).emit('player_submitted', { username });

            // If both submitted, trigger judging
            const players = room.players;
            if (room.submissions[players[0].username] && room.submissions[players[1].username]) {
                room.status = 'judging';
                io.to(roomId).emit('room_update', room);

                try {
                    const result = await judgeDuel(
                        room.problem,
                        room.submissions[players[0].username],
                        room.submissions[players[1].username],
                        players[0].username,
                        players[1].username,
                        room.language || 'javascript'
                    );

                    room.status = 'finished';
                    room.result = result;

                    // Update duel stats for the winner
                    let winnerAchievements = [];
                    try {
                        const winnerUsername = result.winner;
                        if (winnerUsername && winnerUsername !== 'Draw') {
                            const winner = await User.findOne({ username: winnerUsername });
                            if (winner) {
                                winner.duelWins += 1;
                                winnerAchievements = await checkAchievements(winner);
                                await winner.save();
                            }
                        }
                    } catch (err) {
                        console.error('Error updating winner stats:', err);
                    }

                    io.to(roomId).emit('duel_finished', { ...result, earnedAchievements: winnerAchievements });

                    // Cleanup room after delay
                    setTimeout(() => rooms.delete(roomId), 1000 * 60 * 5);
                } catch (error) {
                    console.error('Error during duel judging:', error);
                    room.status = 'error';
                    io.to(roomId).emit('duel_error', { message: 'An error occurred during judging.' });
                }
            }
        });

        socket.on('change_language', ({ roomId, language }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.language = language;
                io.to(roomId).emit('room_update', room);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
