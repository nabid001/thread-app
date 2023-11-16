import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import UserCard from "../../../components/cards/UserCard";
import SearchBar from "@/components/shared/Searchbar";

import { fetchUser, fetchUsers } from "../../../lib/actions/user.actions.js";

const page = async ({ searchParams }) => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo.onboarded) redirect("/");

  const result = await fetchUsers({
    userId: user.id,
    searchString: searchParams.q,
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <section>
      <h1 className="head-text text-light-1">Search page</h1>;
      <SearchBar routeType="search" />
      <div className="flex flex-col mt-14 gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No Users</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default page;
