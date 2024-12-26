import express, { Request, Response } from "express";
import dbs from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

const router = express.Router();
const { db, checkConnection } = dbs;
configDotenv();

type RegisterUserData = {
  name: string;
  email_id: string;
  password: string;
};
type LoginUserData = {
  user_id: number;
  password: string;
};

checkConnection();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email_id, password }: RegisterUserData = req.body;
    if (!name || !email_id || !password) {
      res
        .send(400)
        .json({ message: "Please provide full details to register!" });
      return;
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const result = await db("user_data").insert({
      name,
      email_id,
      password: hashedPass,
    });
    if (!result) {
      res.status(500).json({
        message: "Could not add user in the database! Please try again!",
      });
      return;
    }
    res
      .status(200)
      .json({ message: "User succesfully added!", user_id: result[0] });
  } catch (error) {
    res.status(500).json({ message: "Something Bad Happened :(" });
    console.log(error);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { user_id, password }: LoginUserData = req.body;
    if (!user_id || !password) {
      res.status(400).json({ message: "Missing email or password!" });
      return;
    }
    const result = await db("user_data")
      .select("*")
      .where("user_id", user_id)
      .first();
    if (!result) {
      res.status(404).json({ message: `No user found with ID: ${user_id}!` });
      return;
    }
    const validUser = await bcrypt.compare(password, result.password);
    if (!validUser) {
      res.status(401).json({ message: "Invalid Password!" });
      return;
    }
    // @ts-ignore
    const token = jwt.sign({ user_id }, process.env.JWT_KEY, {
      expiresIn: "2h",
    });
    res.status(200).json({ message: "Signed In Succesfully!", token: token });
  } catch (error) {
    res.status(500).json({ message: "Something Bad Happened :(" });
    console.log(error);
  }
});

router.get("/all-blogs", async (req: Request, res: Response) => {
    try {
        const result = await db("blogs_data").select("*");
        if (result.length === 0) {
            res.status(404).json({ message: "No blogs found!" });
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Something Bad Happened :(" });
        console.log(error);
    }
})

export default router;
