const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const User = require('../models/User');
const Post = require('../models/Post');

exports.getUserByUsername = catchAsync(async (req, res, next) => {
   const user = await User.find({ username: req.params.username });

   if (!user)
      return next(
         new AppError(
            `No User found by username ${req.params.username}`,
            404
         )
      );

   res.status(200).json({
      status: 'success',
      user,
   });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id);

   if (!user)
      return res.status(404).json({
         status: 'failed',
         message: `No User found against id ${req.params.id}`,
      });

   console.log(`user`, user);
   res.status(200).json({
      status: 'success',
      user: user.posts || [],
   });
});
exports.getUser = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id);

   if (!user)
      return res.status(404).json({
         status: 'failed',
         message: `No User found against id ${req.params.id}`,
      });

   console.log(`user`, user);
   res.status(200).json({
      status: 'success',
      user,
   });
});

exports.updateMe = catchAsync(async (req, res, next) => {
   console.log('req.user._id', req.user._id);
   const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
   });

   if (!user)
      return res.status(404).json({
         status: 'failed',
         message: `No User found against id ${req.user._id}`,
      });

   res.status(200).json({
      status: 'success',
      user,
   });
});

// edited
exports.addNewUser = catchAsync(async (req, res, next) => {
   const user = await User.create(req.body);

   res.status(201).json({
      status: 'success',
      user,
   });
});

exports.getUsers = catchAsync(async (req, res, next) => {
   let query = User.find().select('-password').lean();
   if (req.query.role) query = query.find({ role: req.query.role });

   let users = await query;

   users.forEach((user) => {
      user.isFollowing = false;
      // console.log(`user`, user);
      if (user.followers && user.followers.length > 0) {
         const followers = user.followers.map((follower) =>
            follower._id.toString()
         );
         if (followers.includes(req.user.id)) {
            user.isFollowing = true;
         }
      }
   });

   users = users.filter(
      (user) => user._id.toString() !== req.user.id
   );

   //  if (req.user.role === 'admin') {
   //     users = await User.find();
   //     users = users.filter((user) => user.role == 'user');
   //  }

   // console.log(`users`, users)

   res.status(200).json({
      success: true,
      users: users.length,
      data: users,
   });
});

exports.getUserByUsername = catchAsync(async (req, res, next) => {
   const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate({
         path: 'posts',
         select:
            'files tags user retweets retweetCount isLiked likes likesCount comments createdAt caption commentsCount likesCount',
         populate: {
            path: 'user',
            select: 'avatar fullname username',
         },
      })
      .populate({
         path: 'savedPosts',
         select: 'files commentsCount likesCount',
      })
      .populate({
         path: 'followers',
         select: 'avatar username fullname',
      })
      .populate({
         path: 'following',
         select: 'avatar username fullname',
      })
      .lean()
      .exec();

   if (!user) {
      return next({
         message: `The user ${req.params.username} is not found`,
         statusCode: 404,
      });
   }

   if (user.posts && user.posts.length > 0) {
      user.posts.username = req.params.username;

      user.posts.forEach((post) => {
         post.isLiked = false;
         const likes = post.likes.map((like) => like.toString());
         if (likes.includes(req.user.id)) {
            post.isLiked = true;
         }

         post.isRetweeted = false;
         const retweets =
            post.retweets &&
            post.retweets.map((retweet) => retweet.toString());
         if (retweets && retweets.includes(req.user.id)) {
            post.isRetweeted = true;
         }
      });
   }
   user.isFollowing = false;
   if (user.posts && user.posts.length > 0) {
      const followers = user.followers.map((follower) =>
         follower._id.toString()
      );

      user.followers.forEach((follower) => {
         follower.isFollowing = false;
         if (req.user.following.includes(follower._id.toString())) {
            follower.isFollowing = true;
         }
      });
      if (followers.includes(req.user.id)) {
         user.isFollowing = true;
      }
   }
   if (user.posts && user.posts.length > 0) {
      user.following.forEach((user) => {
         user.isFollowing = false;
         if (req.user.following.includes(user._id.toString())) {
            user.isFollowing = true;
         }
      });
   }

   user.isMe = req.user.id === user._id.toString();

   res.status(200).json({ success: true, data: user });
});

exports.follow = catchAsync(async (req, res, next) => {
   // make sure the user exists
   const user = await User.findById(req.params.id);

   if (!user) {
      return next({
         message: `No user found for id ${req.params.id}`,
         statusCode: 404,
      });
   }

   // make the sure the user is not the logged in user
   if (req.params.id === req.user.id) {
      return next({
         message: "You can't unfollow/follow yourself",
         status: 400,
      });
   }

   // only follow if the user is not following already
   if (user.followers.includes(req.user.id)) {
      return next({
         message: 'You are already following him',
         status: 400,
      });
   }

   const newUser = await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id },
      $inc: { followersCount: 1 },
   });
   const newLoggedUser = await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id },
      $inc: { followingCount: 1 },
   });

   res.status(200).json({
      success: true,
      newUser,
      newLoggedUser,
   });
});

exports.unfollow = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id);

   if (!user) {
      return next({
         message: `No user found for ID ${req.params.id}`,
         statusCode: 404,
      });
   }

   // make the sure the user is not the logged in user
   if (req.params.id === req.user.id) {
      return next({
         message: "You can't follow/unfollow yourself",
         status: 400,
      });
   }

   await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id },
      $inc: { followersCount: -1 },
   });
   await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id },
      $inc: { followingCount: -1 },
   });

   res.status(200).json({ success: true, data: {} });
});

exports.feed = catchAsync(async (req, res, next) => {
   console.log('FEED');
   //  console.log(`req.user`, req.user)
   const following = req.user.following;

   const users = await User.find()
      .where('_id')
      .in(following.concat([req.user._id]))
      .exec();

   const postIds = users.map((user) => user.posts).flat();

   const posts = await Post.find()
      .populate({
         path: 'comments',
         select: 'text',
         populate: {
            path: 'user',
            select: 'avatar fullname username',
         },
      })
      .populate({ path: 'user', select: 'avatar fullname username' })
      .sort('-createdAt')
      .where('_id')
      .in(postIds)
      .lean()
      .exec();

   posts.map((post) => {
      // is the loggedin user liked the post
      post.isLiked = false;
      const likes = post.likes.map((like) => like.toString());
      if (likes.includes(req.user.id)) {
         post.isLiked = true;
      }

      post.isRetweeted = false;
      const retweets =
         post.retweets &&
         post.retweets.map((retweet) => retweet.toString());
      if (retweets && retweets.includes(req.user.id)) {
         post.isRetweeted = true;
      }

      // is the loggedin saved this post
      post.isSaved = false;
      const savedPosts = req.user.savedPosts.map((post) =>
         post.toString()
      );
      if (savedPosts.includes(post._id)) {
         post.isSaved = true;
      }

      // is the post belongs to the loggedin user
      console.log(`post`, post);
      post.isMine = false;
      if (post.user._id.toString() === req.user._id) {
         post.isMine = true;
      }

      // is the comment belongs to the loggedin user
      post.comments.map((comment) => {
         comment.isCommentMine = false;
         if (comment.user._id.toString() === req.user.id) {
            comment.isCommentMine = true;
         }
      });

      return post;
   });

   res.status(200).json({ success: true, data: posts });
});

exports.updateUser = catchAsync(async (req, res, next) => {
   // 1) Create error if user POSTs password data
   if (req.body.password || req.body.passwordConfirm) {
      return next(
         new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
         )
      );
   }
   console.log(`req.params.id`, req.params.id);
   console.log(`req.body`, req.body);

   const user = await User.findById(req.params.id);

   const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
         new: true,
         runValidators: true,
      }
   );

   if (!updateUser)
      return next(new AppError(`Error updating User`, 500));

   res.status(200).json({
      user: updateUser,
   });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
   const user = await User.findByIdAndDelete(req.params.id);

   if (!user) {
      return next(
         new AppError(
            `No Task found against id ${req.params.id}`,
            404
         )
      );
   }

   res.status(200).json({
      status: 'success',
      user,
   });
});

exports.addSupport = catchAsync(async (req, res, next) => {
   const user = await User.create(req.body);

   res.status(200).json({
      status: 'success',
      user,
   });
});

exports.getSupport = catchAsync(async (req, res, next) => {
   let users;
   users = await User.find();
   users = users.filter((user) => user.role == 'support');

   res.status(200).json({
      status: 'success',
      length: users.length,
      users,
   });
});

exports.deleteSupport = catchAsync(async (req, res, next) => {
   const user = await User.findByIdAndDelete(req.params.id);

   if (!user) {
      return next(
         new AppError(
            `No Task found against id ${req.params.id}`,
            404
         )
      );
   }

   res.status(200).json({
      status: 'success',
      user,
   });
});
