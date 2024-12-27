import express, { Request, Response } from "express";
import dbs from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import verifyToken from "../middleware/authMiddleware.js";

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
interface MyRequest extends Request {
  user?: any;
}

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
});

//@ts-ignore
router.get("/my-blogs", verifyToken, async (req: MyRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const result = await db("blogs_data").select("*").where("user_id", user_id);
    if (result.length === 0) {
      res
        .status(404)
        .json({ message: `User with ID: ${user_id} has no blogs!` });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Something Bad Happened :(" });
    console.log(error);
  }
});

router.get(
  "/my-blogs/:blog_id",
  //@ts-ignore
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { blog_id } = req.params;
      if (!blog_id) {
        res.status(400).json({
          message: "Please provide the correct details to find the blog!",
        });
        return;
      }
      const blog = await db("blogs_data")
        .select("*")
        .where("blog_id", blog_id)
        .first();
      if (!blog) {
        res.status(404).json({ message: `No Blog found with ID: ${blog_id}` });
        return;
      }
      res.status(200).json({ blog });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.get(
  "/my-blogs/:blog_id/get-comments",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const { blog_id } = req.params;
      const result = await db("blog_comments")
        .select("*")
        .where("blog_id", blog_id);
      if (result.length === 0) {
        res
          .status(404)
          .json({ message: `No comments found for blog with ID: ${blog_id}` });
        return;
      }
      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.post(
  "/create-blog",
  //@ts-ignore
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { user_id, blog_title, blog_content } = req.body;
      if (!user_id || !blog_title || !blog_content) {
        res
          .status(400)
          .json({ message: "Please provide all the fields to add the blog!" });
        return;
      }
      const result = await db("blogs_data").insert({
        user_id,
        blog_title,
        blog_content,
      });
      if (!result) {
        res.status(500).json({
          message: "Could not add blog! Please try again.",
        });
        return;
      }
      res
        .status(200)
        .json({ message: "Blog added succesfully!", blog_id: result[0] });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.put(
  "/update-blog/:blog_id",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    const { blog_id } = req.params;
    const user_id = req.user?.user_id;
    const blog = await db("blogs_data").select("*").where("blog_id", blog_id);
    if (blog.length === 0) {
      res
        .status(404)
        .json({ message: `Blog with ID: ${blog_id} does not exist!` });
    }
    // console.log(blog);
    if (blog[0]?.user_id !== user_id) {
      res.status(403).json({
        message: `User with ID: ${user_id} does not have access to edit the blog with ID: ${blog_id}`,
      });
      return;
    }
    const { blog_title, blog_content } = req.body;
    if (blog_title === undefined && blog_content === undefined) {
      res.status(400).json({ message: "Please provide details to update the blog!" });
      return;
    }
    if (blog_title !== undefined) {
      const result = await db("blogs_data")
        .update({ blog_title })
        .where("blog_id", blog_id);
      if (result === 0) {
        res.status(400).json({ message: "Failed to update the blog!" });
        return;
      }
      res.status(200).json({ message: "Blog updated successfully" });
    }

    if (blog_content !== undefined) {
      const result = await db("blogs_data")
        .update({ blog_content })
        .where("blog_id", blog_id);
      if (result === 0) {
        res.status(400).json({ message: "Failed to update the blog!" });
        return;
      }
      res.status(200).json({ message: "Blog updated successfully" });
    }
  }
);

router.delete(
  "/delete-blog/:blog_id",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const { blog_id } = req.params;
      const blogUser = await db("blogs_data")
        .select("user_id")
        .where("blog_id", blog_id)
        .first();
      if (!blogUser) {
        res.status(404).json({ message: `No Blog found with ID: ${blog_id}` });
        return;
      }
      const user_id = req.user?.user_id;
      if (blogUser.user_id !== user_id) {
        res.status(403).json({
          message: `User with ID: ${user_id} does not have access to blog with ID: ${blog_id}`,
        });
        return;
      }
      await db("blogs_data").select("*").where("blog_id", blog_id).del();
      res.status(200).json({ message: "Blog deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.get("/view-blog/:blog_id", async (req: Request, res: Response) => {
  try {
    const { blog_id } = req.params;
    if (!blog_id) {
      res.status(400).json({
        message: "Please provide the correct details to find the blog!",
      });
      return;
    }
    const blog = await db("blogs_data")
      .select("*")
      .where("blog_id", blog_id)
      .first();
    if (!blog) {
      res.status(404).json({ message: `No Blog found with ID: ${blog_id}` });
      return;
    }
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ message: "Something Bad Happened :(" });
    console.log(error);
  }
});

router.post(
  "/view-blog/:blog_id/comment",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const user_id = req.user?.user_id;
      const { comment } = req.body;
      const { blog_id } = req.params;
      if (!comment) {
        res.status(400).json({ message: "Please provide a comment!" });
        return;
      }
      await db("blog_comments").insert({ blog_id, user_id, comment });
      res.status(200).json({ message: "Comment added sucessfully!" });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.get(
  "/view-blog/:blog_id/get-comments",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const { blog_id } = req.params;
      const result = await db("blog_comments")
        .select("*")
        .where("blog_id", blog_id);
      if (result.length === 0) {
        res
          .status(404)
          .json({ message: `No comments found for blog with ID: ${blog_id}` });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.get(
  "/view-blog/:blog_id/like",
  //@ts-ignore  
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const { blog_id } = req.params;
      const user_id = req.user?.user_id;

      if (!blog_id) {
        res.status(400).json({
          message: "Please provide the correct details to find the blog!",
        });
        return;
      }
      const blog = await db("blogs_data")
        .select("*")
        .where("blog_id", blog_id)
        .first();
      if (!blog) {
        res.status(404).json({ message: `No Blog found with ID: ${blog_id}` });
        return;
      }
      const alreadyLiked = await db("blog_likes").select("user_id").where("user_id", user_id).first();
      if (alreadyLiked) {
        res.status(400).json({ message: "You have already liked the post!" });
        return;
      }
      await db("blog_likes").insert({ blog_id, user_id });
      res.status(200).json({ message: "Blog liked sucessfully!" });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

router.get(
  "/view-blog/:blog_id/unlike",
  //@ts-ignore
  verifyToken,
  async (req: MyRequest, res: Response) => {
    try {
      const { blog_id } = req.params;
      const user_id = req.user?.user_id;

      if (!blog_id) {
        res.status(400).json({
          message: "Please provide the correct details to find the blog!",
        });
        return;
      }
      const blog = await db("blogs_data")
        .select("*")
        .where("blog_id", blog_id)
        .first();
      if (!blog) {
        res.status(404).json({ message: `No Blog found with ID: ${blog_id}` });
        return;
      }
      const result = await db("blog_likes").select("*").where("blog_id", blog_id).where("user_id", user_id).first();
      if (!result) {
        res.status(404).json({ message: `User with ID: ${user_id} has not liked the blog with ID: ${blog_id}!` });
        return;
      }
      await db("blog_likes").select("*").where("blog_id", blog_id).where("user_id", user_id).del();
      res.status(200).json({ message: "Blog unliked sucessfully!" });
    } catch (error) {
      res.status(500).json({ message: "Something Bad Happened :(" });
      console.log(error);
    }
  }
);

export default router;
