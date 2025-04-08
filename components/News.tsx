// import { Info } from 'lucide-react'
// import React from 'react'

// interface NAVITEMS {
//   heading: string,
//   subHeading: string
// }
// const newsItems: NAVITEMS[] = [
//   {
//     heading: "E-retailer retag health drinks",
//     subHeading: "4h ago - 345 readers"
//   },
//   {
//     heading: "Lets transport raises $22 million",
//     subHeading: "4h ago - 323 readers"
//   },
//   {
//     heading: "Casual waer is in at India Inc",
//     subHeading: "4h ago - 234 readers"
//   },
//   {
//     heading: "Snaller cities go on loans",
//     subHeading: "4h ago - 112 readers"
//   },
// ]

// const News = () => {
//   return (
//     <div className='hidden md:block w-[25%] bg-white h-fit rounded-lg border border-gray-300'>
//       <div className='flex items-center justify-between p-3'>
//         <h1 className='font-medium'>LinkedIn News</h1>
//         <Info size={18} />
//       </div>
//       <div>
// {
//   newsItems.map((item, index)=>{
//     return (
//       <div key={index} className='px-3 py-2 hover:bg-gray-200 hover:cursor-pointer'>
//         <h1 className='text-sm font-medium'>{item.heading}</h1>
//         <p className='text-xs text-gray-600'>{item.subHeading}</p>
//       </div>
//     )
//   })
// }
//       </div>

//     </div>
//   )
// }

// export default News
import { Info, TrendingUp } from "lucide-react";
import React from "react";

interface NAVITEMS {
  heading: string;
  subHeading: string;
}
const newsItems: NAVITEMS[] = [
  {
    heading: "E-retailer retag health drinks",
    subHeading: "4h ago - 345 readers",
  },
  {
    heading: "Lets transport raises $22 million",
    subHeading: "4h ago - 323 readers",
  },
  {
    heading: "Casual wear is in at India Inc",
    subHeading: "4h ago - 234 readers",
  },
  {
    heading: "Smaller cities go on loans",
    subHeading: "4h ago - 112 readers",
  },
];

const News = () => {
  return (
    <div className="hidden md:block w-[25%] bg-white h-fit rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h1 className="font-medium flex items-center gap-2">
          <TrendingUp size={18} />
          CoreConnect News
        </h1>
        <Info
          size={18}
          className="cursor-pointer hover:text-blue-200 transition-colors duration-200"
        />
      </div>
      <div>
        {newsItems.map((item, index) => {
          return (
            <div
              key={index}
              className="px-4 py-3 hover:bg-blue-50 hover:cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mt-1">
                  {index + 1}
                </div>
                <div>
                  <h1 className="text-sm font-medium text-gray-800">
                    {item.heading}
                  </h1>
                  <p className="text-xs text-gray-500">{item.subHeading}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
        <p className="text-sm text-blue-600 font-medium">Show more</p>
      </div>
    </div>
  );
};

export default News;
