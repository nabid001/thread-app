"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const UserCard = ({ key, id, name, username, imgUrl, personType }) => {
  const router = useRouter();
  return (
    <article className="user-card">
      <div className="user-card_avetar">
        <Image
          src={imgUrl}
          alt="logo"
          width={48}
          height={48}
          className="rounded-full"
        />
      </div>

      <div className="flex-1 text-ellipsis">
        <h4 className="text-base-semibold text-gray-1">{name}</h4>
        <h4 className="text-small-medium text-gray-1">@{username}</h4>
      </div>

      <Button
        className="user-card_btn"
        onClick={() => router.push(`/profile/${id}`)}
      >
        View
      </Button>
    </article>
  );
};

export default UserCard;
