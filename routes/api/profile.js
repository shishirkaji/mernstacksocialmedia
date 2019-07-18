const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const request = require("request");
const config = require("config");

//@route GET api/profile/me
//@des searches the database with the x-auth-token and returns the profile for the user id returned from the middleware
//@access Private via token

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({
        msg: "there is no profile for this user"
      });
    }
    res.status(200).send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
  res.status(200).send(profile.user.id);
});

//@route POST api/profile
//@des create or update user profile
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is requried ")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // console.log("help hlep"+req.user.id);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;
    //Building a Profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    profileFields.skills = skills.split(",").map(skill => skill.trim());
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      //update
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        console.log("profile updated");
        return res.status(200).send({ profile: profile, msg: "updated" });
      }
      //create new profile
      profile = new Profile(profileFields);
      profile.save().then(() => {
        console.log("saved a new profile");
        return res.send(profile);
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/profile
//@desc returns all the profiles
//@access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
});

//@route GET api/profile/user/:user_id
//@access Public
//@desc get profile by user_id
router.get("/user/:user_id", async (req, res) => {
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]); // populates fetches data from User collections and returns name and avatar too
    if (!profiles) res.status(400).json({ msg: "there is no such profile" });
    res.json(profiles);
  } catch (err) {
    if (err.kind == "objectid") {
      res.status(400).json({ msg: "profile not found" });
    }
    console.log(err);
    res.status(500).send("server Error");
  }
});

//@route GET api/profile
//@access AUTH token
//@desc delete profile use and profile
router.delete("/", auth, async (req, res) => {
  try {
    //@todo - remove users posts

    //remove profile
    await User.findOneAndRemove({ _id: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });

    res.json({ msg: "user removed !" });
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
});

//@route PUT api/profile/experience
//@access Auth  token
//@desc Add profile expreience

router.put("/experience", [
  auth,
  [
    check("title", "title is required")
      .not()
      .isEmpty(),
    check("company", "title is required")
      .not()
      .isEmpty(),
    check("from", "title is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
]);

//@route DELETE api/profile/experience
//@access Private with JWT TOKEN
//@desc Add profile expreience

router.delete("/experience/:expId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.expId);

    profile.experience.splice(removeIndex, 1);
    profile.save();
    res.status(200).send("experience deleted");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

//@route PUT api/profile/education
//@access Auth  token
//@desc Add profile education

router.put("/education", [
  auth,
  [
    check("school", "title is required")
      .not()
      .isEmpty(),
    check("degree", "title is required")
      .not()
      .isEmpty(),
    check("from", "title is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, from, to, current, description } = req.body;

    const newEdu = {
      school,
      degree,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
]);

//@route DELETE api/profile/education/:eduId
//@access Private with JWT TOKEN
//@desc delete education from profile
router.delete("/education/:eduId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // console.log(profile);
    //get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.eduId);
    console.log("remove index : " + removeIndex);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});


//@route Get api/profile/github/:username
//@access Public
//@desc get user repos
router.get('/github/:username',(req, res)=>{
  try{
    const options = {
      uri : `https://api.github.com/users/${req.params.username}/repos?per_page=5&
      sort=created:asc&client_id=${config.get('githubClientId')}&
      client_secret = ${config.get('githubSecret')}`,
      method :'GET',
      headers:{'user-agent':'node.js'}
    };
    request(options,(error,response, body)=>{
      if(error) console.log(error);
      if(response.statusCode!==200){
        return res.status(404).json({msg:'No Github profile found'});
      } 
    

    res.json(JSON.parse(body))
  });
  
  }
  
  catch(err){
    console.log(err.message);
    res.status(500).send("server error");

  }
});

module.exports = router;
