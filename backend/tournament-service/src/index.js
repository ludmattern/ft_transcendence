const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

app.get('/', (req, res) => {
  res.send("TOUNAMENT");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
