// "use client";
// import React from "react";
// import ProfilePhoto from "./shared/ProfilePhoto";
// import { useUser } from "@clerk/nextjs";
// import { Button } from "./ui/button";
// import { Trash2 } from "lucide-react";
// import { Badge } from "./ui/badge";
// import { IPostDocument } from "@/models/post.model";
// import PostContent from "./PostContent";
// import SocialOptions from "./SocialOptions";
// import ReactTimeago from "react-timeago";
// import { deletePostAction } from "@/lib/serveractions";

// const Post = ({ post }: { post: IPostDocument }) => {
//   const { user } = useUser();
//   const fullName = post?.user?.firstName + " " + post?.user?.lastName;
//   const loggedInUser = user?.id === post?.user?.userId;

//   return (
//     <div className="bg-white my-2 mx-2 md:mx-0 rounded-lg border border-gray-300">
//       <div className=" flex gap-2 p-4">
//         <ProfilePhoto src={post?.user?.profilePhoto!} />
//         <div className="flex items-center justify-between w-full">
//           <div>
//             <h1 className="text-sm font-bold">
//               {fullName}{" "}
//               <Badge variant={"secondary"} className="ml-2">
//                 You
//               </Badge>
//             </h1>
//             <p className="text-xs text-gray-500">
//               @{user?.username || "username"}
//             </p>

//             <p className="text-xs text-gray-500">
//               <ReactTimeago date={new Date(post.createdAt)} />
//             </p>
//           </div>
//         </div>
//         <div>
//           {loggedInUser && (
//             <Button
//               onClick={() => {
//                 const res = deletePostAction(post._id);
//               }}
//               size={"icon"}
//               className="rounded-full"
//               variant={"outline"}
//             >
//               <Trash2 />
//             </Button>
//           )}
//         </div>
//       </div>
//       <PostContent post={post} />
//       <SocialOptions post={post} />
//     </div>
//   );
// };

// export default Post;
"use client";
import React from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "./ui/badge";
import { IPostDocument } from "@/models/post.model";
import PostContent from "./PostContent";
import SocialOptions from "./SocialOptions";
import ReactTimeago from "react-timeago";
import { deletePostAction } from "@/lib/serveractions";

const Post = ({ post }: { post: IPostDocument }) => {
  const { user } = useUser();
  const fullName = post?.user?.firstName + " " + post?.user?.lastName;
  const loggedInUser = user?.id === post?.user?.userId;

  return (
    <div className="bg-white my-3 mx-2 md:mx-0 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="flex gap-3 p-4 border-b border-gray-100">
        <ProfilePhoto src={post?.user?.profilePhoto!} />
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-sm font-bold text-gray-800">
              {fullName}{" "}
              {loggedInUser && (
                <Badge
                  variant={"secondary"}
                  className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  You
                </Badge>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              @{user?.username || "username"}
            </p>

            <p className="text-xs text-gray-500">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            size={"icon"}
            className="rounded-full hover:bg-gray-100"
            variant={"ghost"}
          >
            <MoreHorizontal size={18} />
          </Button>
          {loggedInUser && (
            <Button
              onClick={() => {
                const res = deletePostAction(post._id);
              }}
              size={"icon"}
              className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
              variant={"ghost"}
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>
      <PostContent post={post} />
      <SocialOptions post={post} />
    </div>
  );
};

export default Post;
