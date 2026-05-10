import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <FaHome className="w-4 h-4 mr-2" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <FaChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                            {item.link ? (
                                <Link to={item.link} className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white md:ml-2 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400" aria-current="page">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
