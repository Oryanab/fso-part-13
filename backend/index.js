require("dotenv").config();
const express = require("express");
const { Sequelize, QueryTypes, Model, DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

class Blog extends Model {}
Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "Blog",
  }
).sync();

app.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.findAll();
  //console.log(blogs.map((n) => n.toJSON()));
  console.log(JSON.stringify(blogs, null, 2));
  res.json(blogs);
});

app.post("/api/blogs", async (req, res) => {
  try {
    const { author, url, title, likes } = req.body;
    const blog = await Blog.create({ author, url, title, likes });
    res.json(blog);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

app.post("/api/blogs/editable", async (req, res) => {
  console.log(req.body);
  const { author, url, title, likes } = req.body;
  const blog = Blog.build({ author, url, title, likes });
  blog.likes = 0;
  await blog.save();
  res.json(blog);
});

app.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    console.log(blog.toJSON());
    res.json(blog);
  } else {
    res.status(400).json({ error: "couldnt find" });
  }
});

app.put("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    blog.likes = req.body.likes;
    await blog.save();
    res.json(blog);
  } else {
    res.status(400).json({ error: "couldn't find" });
  }
});

app.delete("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    await blog.destroy();
    res.status(200).json({ msg: "deleted successfully" });
  } else {
    res.status(400).json({ error: "couldn't find" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
