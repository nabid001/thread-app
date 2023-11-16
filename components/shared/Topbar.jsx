import {
  SignOutButton,
  SignedIn,
  UserButton,
  currentUser,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const Topbar = async () => {
  const user = await currentUser();
  // console.log(user);
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">Threads</p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg"
                  alt="logout"
                  width={24}
                  height={24}
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>

        <UserButton />
        <h3 className="text-light-1">{user?.username}</h3>
      </div>
    </nav>
  );
};

export default Topbar;
