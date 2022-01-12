const router = require("express").Router();
const { Op } = require("sequelize");
const sequelize = require("sequelize");

const { Blog, User } = require("../models/index");
const { tokenExtractor } = require("./middleware/blogsMiddleware");

router.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ["UserId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  console.log(JSON.stringify(blogs, null, 2));
  res.json(blogs);
});

router.post("/api/blogs", tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const blog = await Blog.create({
      ...req.body,
      UserId: user.dataValues.id,
      date: new Date(),
    });
    res.json(blog);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post("/api/blogs/editable", async (req, res) => {
  console.log(req.body);
  const { author, url, title, likes } = req.body;
  const blog = Blog.build({ author, url, title, likes });
  blog.likes = 0;
  await blog.save();
  res.json(blog);
});

router.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    console.log(blog.toJSON());
    res.json(blog);
  } else {
    res.status(400).json({ error: "couldnt find" });
  }
});

router.put("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    blog.likes = req.body.likes;
    await blog.save();
    res.json(blog);
  } else {
    res.status(400).json({ error: "couldn't find" });
  }
});

router.delete("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    await blog.destroy();
    res.status(200).json({ msg: "deleted successfully" });
  } else {
    res.status(400).json({ error: "couldn't find" });
  }
});

router.get("/api/blogs/order/top-likes", async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ["UserId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    order: [["likes", "DESC"]],
  });
  res.status(200).json(blogs);
});

router.get("/api/blogs/find/:search", async (req, res) => {
  if (req.params.search) {
    const blog = await Blog.findAll({
      attributes: { exclude: ["UserId"] },
      include: {
        model: User,
        attributes: ["name"],
      },
      where: {
        title: {
          [Op.substring]: req.params.search,
        },
      },
    });
    res.status(200).json(blog);
  } else {
    res.status(400).json({ error: "couldn't find" });
  }
});

router.get("/api/authors", async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: [
      "author",
      [sequelize.fn("COUNT", sequelize.col("title")), "total_posts"],
      [sequelize.fn("COUNT", sequelize.col("likes")), "total_likes"],
    ],
    group: "author",
  });
  res.status(200).json(blogs);
});
module.exports = router;
