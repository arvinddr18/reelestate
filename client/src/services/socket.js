const socketService = {
connect(userId) {
console.log('Socket connection paused for Vercel deployment.');
return;
},
disconnect() {
console.log('Socket disconnected.');
}
};

export default socketService;