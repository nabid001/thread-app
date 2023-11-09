"use server";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

export const createThread = async ({ text, author, path, communityId }) => {
  connectToDB();

  try {
    const createThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    // Update user model

    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread },
    });

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Failed to create thread ${error.message}`);
  }
};

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
};

export const fetchThreadById = async (threadId) => {
  connectToDB();
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      // .populate({
      //   path: "community",
      //   model: Community,
      //   select: "_id id name image",
      // }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error) {
    throw new Error(`Failed to fetchThreadById ${error.message}`);
  }
};

export const addCommentToThread = async (
  threadId,
  commentText,
  userId,
  path
) => {
  connectToDB();

  try {
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create a new thread with comment text
    const commentThread = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // Save the new thread
    const saveCommentThread = await commentThread.save();

    // Update the original thread to include the new comment
    originalThread.children.push(saveCommentThread._id);

    // Save the original thread
    await originalThread.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error.message);
    throw new Error(`Failed to comment ${error.message}`);
  }
};
