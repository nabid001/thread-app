import { fetchUserPost } from "../../lib/actions/user.actions.js";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

const ThreadsTab = async ({ currentUserId, accountId, accountType }) => {
  let result = await fetchUserPost(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUser={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: result.author.id,
                }
          } // TODO:
          community={thread.community} // TODO:
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
