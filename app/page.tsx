// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }


// 'use client';

// import { useEffect, useState } from 'react';
// import { db } from '../lib/firebase';
// import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import { Calendar } from 'lucide-react'; // Icon

// // Define what a Notice looks like
// interface Notice {
//   id: string;
//   title: string;
//   content: string;
//   createdAt: any;
// }

// export default function Home() {
//   const [notices, setNotices] = useState<Notice[]>([]);

//   useEffect(() => {
//     const fetchNotices = async () => {
//       // Get reference to "notices" collection
//       const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));

//       const querySnapshot = await getDocs(q);
//       const noticesData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       })) as Notice[];

//       setNotices(noticesData);
//     };

//     fetchNotices();
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-bold text-gray-900">Church Notices</h1>
//           <p className="text-gray-600 mt-2">Latest updates and announcements</p>
//         </header>

//         <div className="grid gap-6">
//           {notices.map((notice) => (
//             <div key={notice.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <Calendar className="w-4 h-4 text-blue-500" />
//                 <span className="text-xs text-gray-400 uppercase tracking-wider">
//                   {/* Convert Firebase timestamp to readable date */}
//                   {notice.createdAt?.seconds
//                     ? new Date(notice.createdAt.seconds * 1000).toLocaleDateString()
//                     : 'Just now'}
//                 </span>
//               </div>
//               <h2 className="text-xl font-bold text-gray-800 mb-2">{notice.title}</h2>
//               <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
//             </div>
//           ))}

//           {notices.length === 0 && (
//             <p className="text-center text-gray-500">Loading notices...</p>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }


import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ScrollReveal from '@/components/ScrollReveal';
import { MapPin, Clock, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 pt-20">
      <Navbar />

      {/* 1. Hero Banner Section - Auto-sliding carousel */}
      <HeroBanner />

      {/* 2. Introduction Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">

          {/* Heading fades up */}
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Who We Are</h2>
          </ScrollReveal>

          {/* Paragraph fades up with a short delay */}
          <ScrollReveal animation="fade-up" delay={150}>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              마운트이든 한인교회는 뉴질랜드 감리교단 노던시노드 코리안패리쉬 소속 교회입니다.

            </p>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">우리는 이런 공동체입니다</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              마운트 이든 교회는 말씀 위에 서서 서로를 따뜻하게 안아주는 공동체입니다. 건강한 신앙의 전통을 소중히 여기며, 우리의 일상 속에서 정의와 공의가 실현되는 삶을 함께 추구합니다. 관념이 아닌 실제 삶에 뿌리내린 신앙, 이웃과 지역사회에 축복의 통로가 되는 교회를 꿈꿉니다.
              뉴질랜드 감리교단 노던시노드의 튼튼한 기반 아래 안정적으로 세워진 교회로서, 바로 알고 바로 믿고 바로 서는 공동체를 향해 오늘도 함께 걸어가고 있습니다.

            </p>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">이런 분들과 함께하고 싶습니다.</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
          
이민 생활 속에서 교회에 대한 기대가 조금씩 흔들려온 분들, 아이들이 건강한 신앙 안에서 바르게 자라기를 바라는 부모님들, 그리고 삶과 맞닿아 있는 합리적이고 실용적인 신앙생활을 원하는 청년, 젊은 가정, 그리고 이 땅에서 믿음의 뿌리를 끝까지 지켜오신 분들. 마운트 이든 교회는 바로 그런 분들과 함께하고 싶습니다. <br />
뉴질랜드 감리교단 노던시노드의 튼튼한 기반 아래 안정적으로 세워진 교회로서, 바로 알고 바로 믿고 바로 서는 공동체를 향해 오늘도 함께 걸어가고 있습니다.
새로운 시작을 찾고 계신다면, 이곳에서 함께해요.
            </p>

            {/* <p className="text-gray-600 text-lg leading-relaxed mb-10">
          


            </p> */}
          </ScrollReveal>

          {/* 3 cards stagger in from different directions */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <ScrollReveal animation="fade-left" delay={0}>
              <div className="p-6 bg-gray-50 rounded-xl h-full">
                <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Loving Community</h3>
                <p className="text-gray-500">A family that cares for one another.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={150}>
              <div className="p-6 bg-gray-50 rounded-xl h-full">
                <Clock className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Modern Service</h3>
                <p className="text-gray-500">Inspiring worship and relevant teaching.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="fade-right" delay={300}>
              <div className="p-6 bg-gray-50 rounded-xl h-full">
                <MapPin className="w-10 h-10 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Local Mission</h3>
                <p className="text-gray-500">Serving our neighbors in practical ways.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. Google Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Find Us</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* Contact Info slides in from the left */}
            <ScrollReveal animation="fade-left" delay={100}>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Location</h4>
                    <p className="text-gray-600">449 Mount Eden Road, Mount Eden, <br />Auckland, New Zealand</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Service Time</h4>
                    <p className="text-gray-600">Sundays at 11:30 AM</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Map slides in from the right */}
            <ScrollReveal animation="fade-right" delay={200}>
              <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6382.656091442055!2d174.75900667741848!3d-36.882499781393975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d4632b82dd291%3A0xf748835c68dd93a9!2sMt%20Eden%20Village%20Centre!5e0!3m2!1sko!2snz!4v1770990091280!5m2!1sko!2snz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
