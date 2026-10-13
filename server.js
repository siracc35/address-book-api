const app = require('./src/app');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Address Book API: http://localhost:${port}/api-docs`));
