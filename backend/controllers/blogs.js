const router = require("express").Router();

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
  //console.log(blogs.map((n) => n.toJSON()));
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

module.exports = router;
