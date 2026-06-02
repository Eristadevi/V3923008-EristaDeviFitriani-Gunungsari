import { config } from "dotenv";
import app from "./src/app.js";

config({ quiet: true });

const port = process.env.PORT || 8100;

app.listen(port, () => {
  console.log(`Server running on localhost:${port}`);
});