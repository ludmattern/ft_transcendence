const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.get('/hello', (req, res) => {
	res.send("Hello from Game Service");
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
