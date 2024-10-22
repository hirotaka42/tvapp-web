import React, { useState } from 'react';

type Tab = {
  title: string;
  query: string;
};

type TabProps = {
  tabs: Tab[];
};

export const TabsWithUnderline: React.FC<TabProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabs">
      <div className="block overflow-x-auto">
        <ul className="flex mb-2 transition-all duration-300">
          {tabs.map((tab, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab(index)}
                className={`inline-block py-4 px-6 text-brack-500 hover:text-gray-800 dark:text-white font-medium border-b-4 border-transparent ${
                  activeTab === index ? 'border-b-indigo-600 text-indigo-600' : 'border-gray-500'
                } tablink whitespace-nowrap text-md font-bold tracking-tight`}
                role="tab"
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        {tabs.map((tab, index) => (
          <div
            key={index}
            role="tabpanel"
            className={`tabcontent ${activeTab === index ? '' : 'hidden'}`}
          >
            <p className="text-brack-500 dark:text-white">
              {tab.query}
            </p>
            <p className="mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
                porta risus. Donec finibus dapibus nibh non ultricies. Donec ultricies
                nibh nec sem imperdiet malesuada. Fusce a sodales sem. Morbi eget
                eleifend nisl. Integer consequat dolor nulla, sit amet dignissim dolor
                fringilla sit amet. Donec nisl quam, luctus vitae felis id, suscipit
                fringilla massa. Aliquam eget fringilla lacus, et vestibulum sem.
                Pellentesque interdum velit in laoreet auctor. Integer vitae dui
                sodales, mattis est a, mollis odio. Vivamus vel eros sed eros gravida
                faucibus. In non facilisis neque, vel lacinia tellus. Integer in mattis
                enim, sed molestie enim. Maecenas et ultricies massa, vel laoreet lorem.
                Quisque ex sem, maximus fringilla ligula ut, bibendum facilisis massa.
            </p>

          </div>
        ))}
      </div>
    </div>
  );
};

export default TabsWithUnderline;