const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const profile = require("../../models/Profile");
const User = require("../../models/User");

//@route POST ai/posts
//@desc create a new post
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-passowrd");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err);
      res.status(500).send("server error");
    }
  }
);

//@route GET  api/posts
//@desc get all posts
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //date : -1  ; gives the post that were posted latest
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

//@route GET  api/posts/:postId
//@desc get all posts
//@access Private
router.get("/:postId", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.postId);
    // if(posts.isEmpty()) res.status(400).send("bad request");

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

//@route Delete   api/posts/:postId
//@desc Delete a post
//@access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    console.log(req.params.id.toString());

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(401).json({ msg: "Post not found" });
    }
    //checkuser
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    await post.remove();
    res.status(200).send("post removed");
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Sever error");
  }
});

//@route PUT  api/posts/like/:postid
//@desc likes  a post if hasnot been liked already
//@access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send("no such post exitst");

    //check if the post has already been liked by the same person
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(400).send("server error");
  }
});

//@route put api/posts/unlike/:id
//@desc unlikes a post if it hasnot been liked
//@access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send("no such post exists");

    //check if the post has already been liked by the same person
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "the post has not been liked" });
    }
    //get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    post.save();
    res.json({ msg: "post unliked" });
  } catch (err) {
    console.log(err);
    res.status(400).send("server error");
  }
});

//@route PUT api/posts/comment/:id
//@desc add comment to post
//@access Private
router.put(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is a required field")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array });
    }

    try {
      const user = await User.findById(req.user.id);
      const post = await Post.findById(req.params.id);
      if (!post) return res.send("no such post exists");

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err);
      res.status(400).send("server error");
    }
  }
);
//@route PUT api/posts/comment/:postid/:commentid
//@desc delete comment
//@access Private
router.put("/comment/:postId/:commentId", auth, async (req, res) => {
 
  try {
    const post = await Post.findById(req.params.postId);
    const comment = await post.comments.find(comment => comment.id == req.params.commentId);
    if (!post) return res.send("no such post exists");
    if(!comment) return res.send("no such comment exist");

    if (comment.user.toString()!== req.user.id) return res.status(401).json({msg:"unauthorized user"});

    const removeIndex = post.comments
    .map(comment => comment.user.toString())
    .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    

    
    await post.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(400).send("server error");
  }
});
module.exports = router;
