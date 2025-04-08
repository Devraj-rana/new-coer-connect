// "use client";
// import React, { useState } from "react";
// import ProfilePhoto from "./shared/ProfilePhoto";
// import { Input } from "./ui/input";
// import { PostDialog } from "./PostDialog";
// import { toast } from "react-toastify";

// const PostInput = ({ user }: { user: any }) => {
//   const [open, setOpen] = useState<boolean>(false);
//   const inputHandler = () => {
//     if (!user) {
//       toast.error("Please Login first")
//       return
//     }
//     setOpen(true);
//   };
//   return (
//     <div className="bg-white p-4 m-2 md:m-0 border border-gray-300 rounded-lg">
//       <div className="flex items-center gap-3">
//         <ProfilePhoto src={user?.imageUrl || "./default-avator.png"} />
//         <Input
//           type="text"
//           placeholder="Start a post"
//           className="rounded-full hover:bg-gray-100 h-12 cursor-pointer"
//           onClick={inputHandler}
//         />
//         <PostDialog
//           setOpen={setOpen}
//           open={open}
//           src={user?.imageUrl}
//           fullName={user ? `${user?.firstName} ${user?.lastName}` : "Full name"}
//         />
//       </div>
//     </div>
//   );
// };

// export default PostInput;
"use client";
import React, { useState } from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { Input } from "./ui/input";
import { PostDialog } from "./PostDialog";
import { toast } from "react-toastify";
import { PenLine } from "lucide-react";

const PostInput = ({ user }: { user: any }) => {
  const [open, setOpen] = useState<boolean>(false);
  const inputHandler = () => {
    if (!user) {
      toast.error("Please Login first");
      return;
    }
    setOpen(true);
  };
  return (
    <div className="bg-white p-5 m-2 md:m-0 rounded-lg shadow-md border-t-4 border-t-blue-600">
      <div className="flex items-center gap-3">
        <ProfilePhoto src={user?.imageUrl || "./default-avator.png"} />
        <Input
          type="text"
          placeholder="Share your thoughts..."
          className="rounded-full bg-gray-50 hover:bg-gray-100 h-12 cursor-pointer transition-colors duration-200 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
          onClick={inputHandler}
        />
        <div className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 cursor-pointer transition-colors duration-200">
          <PenLine size={20} />
        </div>
        <PostDialog
          setOpen={setOpen}
          open={open}
          src={user?.imageUrl}
          fullName={user ? `${user?.firstName} ${user?.lastName}` : "Full name"}
        />
      </div>
    </div>
  );
};

export default PostInput;
