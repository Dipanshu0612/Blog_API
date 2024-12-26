import express, { Request, Response } from "express";
import routes from "./routes/blogRoutes.js";

const app = express();

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello! Welcome to D's Blog API!",
    description:
      "Write and view blogs, comment and like at others blogs with these APIs!",
  });
});

app.use("/", routes);

app.listen(3002, () => {
  console.log("Listening from Port 3002! 🙋🏻‍♂️");
});
