import app from './src/app.js';

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, (error) => {
        if(!error)
            console.log("Server is Successfully Running, and App is listening on port "+ PORT)
        else 
            console.log("Error occurred, server can't start", error);
    }
);

export default server;