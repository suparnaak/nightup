// src/pages/Home.tsx
import React from "react";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const mockEvents = [
  {
    id: 1,
    title: "Summer Night Festival",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
    date: "2025-03-20",
    location: "New York",
    category: "Music",
  },
  {
    id: 2,
    title: "Art Gallery Opening",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop",
    date: "2025-03-22",
    location: "Los Angeles",
    category: "Art",
  },
  {
    id: 3,
    title: "Tech Meetup Night",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
    date: "2025-03-25",
    location: "Chicago",
    category: "Technology",
  },
];

const Home: React.FC = () => {
  return (
    <UserLayout>
      {/* ===== BANNER SECTION ===== */}
      <section
        className="relative w-full h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-purple-900 bg-opacity-50 flex flex-col justify-center items-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Discover Amazing Events Near You
          </h1>
          <div className="flex items-center w-full max-w-xl">
            <Input
              type="text"
              placeholder="Search events, artists, venues..."
              className="flex-1 px-6 py-3 rounded-l-full"
              label=""
              name=""
              value=""
              onChange={() => {}}
            />
            <Button
              label="Search"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-r-full"
            />
          </div>
        </div>
      </section>

      {/* ===== FILTER SECTION ===== */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-sm mb-1 font-medium">Category</label>
            <select className="px-4 py-2 rounded-md border border-gray-300 text-sm w-full md:w-64">
              <option>All Categories</option>
              <option>Concert</option>
              <option>Party</option>
              <option>Workshop</option>
            </select>
          </div>
          {/* Date Filter */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-sm mb-1 font-medium">Date</label>
            <Input
              type="date"
              className="px-4 py-2 rounded-md border border-gray-300 text-sm w-full md:w-64"
              label=""
              name=""
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="text-center mt-6">
          <Button
            label="View All Events"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md"
          />
        </div>
      </section>

      {/* ===== LATEST EVENTS SECTION ===== */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Latest Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600">
                  {event.location} &bull; {event.date}
                </p>
                <p className="mt-2 text-purple-600 font-medium">
                  Book Now
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
};

export default Home;
