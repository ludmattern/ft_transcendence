const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.get('/', (req, res) => {
  res.send("CHAT");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
