const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.get('/hello', (req, res) => {
	res.send("Hello from Auth Service");
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
