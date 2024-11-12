const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.get('/', (req, res) => {
  res.send("GAME");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
