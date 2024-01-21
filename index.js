import express from "express";
import { getUrl, getOrgUrl, shortenUrl } from "./src/urls.js";
import { connectToDatabase } from "./src/dbconnect.js";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 3333;

app.use(express.json());

connectToDatabase();

//get a record from the db based on the originalUrl passed in the body
app.post("/get-url", getUrl);

//get an original url based on the short url path passed in the body
app.post("/get-org-url", getOrgUrl);

//shorten a provided url
app.post("/shorten", shortenUrl);

app.listen(PORT, () => {
  console.log(`Server is running o the port ${PORT}`);
});
