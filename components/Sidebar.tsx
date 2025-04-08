// import Image from "next/image";
// import React from "react";
// import ProfilePhoto from "./shared/ProfilePhoto";
// import { getAllPosts } from "@/lib/serveractions";

// const Sidebar = async ({ user }: { user: any }) => {
//   const posts = await getAllPosts();
//   return (
//     <div className="hidden md:block w-[20%] h-fit border bordergray-300 bg-white rounded-lg">
//       <div className="flex relative flex-col items-center">
//         <div className="w-full h-16 overflow-hidden">
//           {user && (
//             <Image
//               src={"/banner.jpg"}
//               alt="Banner"
//               width={200}
//               height={200}
//               className="w-full h-full rounded-t"
//             />
//           )}
//         </div>
//         <div className="my-1 absolute top-10 left-[40%]">
//           <ProfilePhoto src={user ? user?.imageUrl! : "/banner.jpg"} />
//         </div>
//         <div className="border-b border-b-gray-300">
//           <div className="p-2 mt-5 text-center">
//             <h1 className="font-bold hover:underline cursor-pointer">
//               {user
//                 ? `${user?.firstName} ${user?.lastName}`
//                 : "Full name"}
//             </h1>
//             <p className="text-xs">@{user?.username || "username"}</p>
//           </div>
//         </div>
//       </div>
//       <div className="text-xs">
//         <div className="w-full flex justify-between items-center px-3 py-2 hover:bg-gray-200 cursor-pointer">
//           <p>Post Impression</p>
//           <p className="text-blue-500 font-bold">88</p>
//         </div>
//         <div className="w-full flex justify-between items-center px-3 py-2 hover:bg-gray-200 cursor-pointer">
//           <p>Posts</p>
//           <p className="text-blue-500 font-bold">{posts?.length}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
import Image from "next/image";
import React from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { getAllPosts } from "@/lib/serveractions";

const Sidebar = async ({ user }: { user: any }) => {
  const posts = await getAllPosts();
  return (
    <div className="hidden md:block w-[20%] h-fit bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex relative flex-col items-center">
        <div className="w-full h-20 overflow-hidden">
          {user && (
            <Image
              src={"/banner.jpg"}
              alt="Banner"
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute top-12 left-[40%]">
          <ProfilePhoto src={user ? user?.imageUrl! : "/banner.jpg"} />
        </div>
        <div className="border-b border-b-gray-200 w-full">
          <div className="p-4 mt-5 text-center">
            <h1 className="font-bold text-blue-600 hover:underline cursor-pointer transition-colors duration-200">
              {user ? `${user?.firstName} ${user?.lastName}` : "Full name"}
            </h1>
            <p className="text-xs text-gray-600">
              @{user?.username || "username"}
            </p>
          </div>
        </div>
      </div>
      <div className="text-sm">
        <div className="w-full flex justify-between items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200">
          <p className="font-medium">Post Impression</p>
          <p className="text-blue-600 font-bold">88</p>
        </div>
        <div className="w-full flex justify-between items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200">
          <p className="font-medium">Posts</p>
          <p className="text-blue-600 font-bold">{posts?.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
