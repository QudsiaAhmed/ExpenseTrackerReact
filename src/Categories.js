import React, { useState, useEffect } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { database, auth } from './firebase';
import './Account.css';

const defaultCategories = ['Food', 'Groceries', 'Petrol', 'Bills']; // Define default categories here

const Categories = ({ user }) => {
  const [category, setCategory] = useState('');
  const [userCategories, setUserCategories] = useState(() => {
    const storedUserCategories = localStorage.getItem('userCategories');
    return storedUserCategories ? JSON.parse(storedUserCategories) : [];
  });

  useEffect(() => {
    if (user) {
      const categoriesRef = ref(database, `categories/${user.uid}`);

      onValue(categoriesRef, (snapshot) => {
        if (snapshot.exists()) {
          const categoriesData = snapshot.val();
          const categoriesArray = Object.values(categoriesData);
          setUserCategories(categoriesArray);

          // Save user categories to local storage
          localStorage.setItem('userCategories', JSON.stringify(categoriesArray));
        } else {
          setUserCategories([]);

          // Remove user categories from local storage
          localStorage.removeItem('userCategories');
        }
      });
    }
  }, [user]);

  const allCategories = [...defaultCategories, ...userCategories];

  const handleAddCategory = () => {
    if (!user) {
      alert('You must be signed in to add categories.');
      return;
    }

    if (category.trim() === '') {
      // Don't add empty categories
      return;
    }

    // Check if the category already exists
    if (allCategories.includes(category)) {
      alert('Category already exists.');
      setCategory('');
      return;
    }

    // Add the new category to the list and push it to the database
    const newCategoryRef = push(ref(database, `categories/${user.uid}`), category);
    setCategory('');
  };

  return (
    <div className="categories-container">
      <h2 className="categories-title">Categories</h2>
      <div>
        <h3>Expense categories</h3>
        <ul className="categories-list">
          {allCategories.map((cat, index) => (
            <li key={index} className="categories-item">{cat}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Add a category</h3>
        <input
          type="text"
          placeholder="Enter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        {user ? (
          <button onClick={handleAddCategory} className="categories-button">Add Category</button>
        ) : (
          <button disabled className="categories-button">Add Category</button>
        )}
      </div>
    </div>
  );
};

export default Categories;
