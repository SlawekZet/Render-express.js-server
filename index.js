import express from "express";
import { getUrl, shortenUrl } from "./src/urls.js";
import { connectToDatabase } from "./src/dbconnect.js";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 3333;

app.use(express.json());

connectToDatabase();

// defining the routes
//get a record from the db based on the originalUrl passed in the body
app.get("/get-url", getUrl);

//shorten a provided url
app.post("/shorten", shortenUrl);

app.listen(PORT, () => {
  console.log(`Server is running o the port ${PORT}`);
});
