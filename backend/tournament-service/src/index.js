const express = require('express');
const app = express();
const PORT = 3005;

app.get('/hello', (req, res) => {
	res.send("Hello from Tournament Service");
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
