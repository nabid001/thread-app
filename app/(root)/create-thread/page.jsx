import PostThread from "../../../components/forms/PostThread.jsx";
import { fetchUser } from "../../../lib/actions/user.actions.js";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">page</h1>

      <PostThread userId={userInfo._id} />
    </>
  );
};

export default page;
