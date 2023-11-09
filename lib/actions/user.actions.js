"use server";

const { connectToDB } = require("../mongoose");
import User from "../models/user.model";
import Thread from "../models/thread.model";

export const updateUser = async ({
  userId,
  name,
  username,
  bio,
  path,
  image,
}) => {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        image,
        bio,
        onboarded: true,
      },
      {
        upsert: true,
      }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(`Failed to create/update user ${error.message}`);
  }
};

export const fetchUser = async (userId) => {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: "community",
    //   model: Community
    // })
  } catch (error) {
    throw new Error(`Failed to fetch user ${error.message}`);
  }
};

export const fetchUserPost = async (userId) => {
  connectToDB();

  try {
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return threads;
  } catch (error) {
    throw new Error(`Failed to fetch user ${error.message}`);
  }
};

export const fetchUsers = async ({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortyBy = "desc",
}) => {
  connectToDB();

  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortyBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    throw new Error(`Failed to fetch users ${error.message}`);
  }
};

export const getActivity = async (userId) => {
  connectToDB();

  try {
    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    throw new Error(`Failed to get activity users ${error.message}`);
  }
};
