import { Bell, BriefcaseBusiness, Home, MessageCircleMore, Users, GraduationCap, FileText } from 'lucide-react'
import Link from 'next/link';
import React from 'react';
import { useUser } from '@clerk/nextjs';

// method-1 to create type
// type NAVITEMS = {
//     src:string,
//     icon:JSX.Element,
//     text:string
// }

// m-2 to create type
interface NAVITEMS {
    src:string,
    icon:JSX.Element,
    text:string,
    roles?: string[]
}

const NavItems = () => {
  const { user } = useUser();
  
  const navItems:NAVITEMS[] = [
    {
        src: "/",
        icon: <Home />,
        text: "Home",
    },
    {
        src: "/",
        icon: <Users />,
        text: "My Network",
    },
    {
        src: "/classes",
        icon: <GraduationCap />,
        text: "Classes",
        roles: ['teacher'] // Only show for teachers
    },
    {
        src: "/quiz/create",
        icon: <FileText />,
        text: "Create Quiz",
        roles: ['teacher'] // Only show for teachers
    },
    {
        src: "/",
        icon: <BriefcaseBusiness />,
        text: "Jobs",
    },
    {
        src: "/",
        icon: <MessageCircleMore />,
        text: "Messaging",
    },
    {
        src: "/",
        icon: <Bell />,
        text: "Notification",
    },
  ];

  // Filter nav items based on user role (you might want to get role from your profile data)
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; // Show items without role restrictions to everyone
    // Here you would check the user's role from your database
    // For now, we'll show all items
    return true;
  });
  return (
    <div className='flex gap-8'>
        {
            filteredNavItems.map((navItem, index)=>{
                return (
                    <div key={index} className='flex flex-col items-center cursor-pointer text-[#666666] hover:text-black'>
                        <span>{navItem.icon}</span>
                        <Link className='text-xs' href={navItem.src}>{navItem.text}</Link>
                    </div>
                )
            })
        }
    </div>
  )
}

export default NavItems