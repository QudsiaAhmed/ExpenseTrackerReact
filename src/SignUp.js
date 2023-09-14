import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, set, get } from 'firebase/database';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css'; 

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader while signing up
    setMessage('');
  
    if (!isValidEmail(email)) {
      setMessage('Invalid email address. Please enter a valid email.');
      setLoading(false); // Hide loader
      return;
    }
  
    try {
      const dbRef = ref(database, 'users');
      const snapshot = await get(dbRef);
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
  
        for (const userId in userData) {
          if (userData[userId].email === email) {
            setMessage('User already exists. Try signing in.');
            setLoading(false); // Hide loader
            return;
          }
        }
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const newUserRef = ref(database, 'users/' + user.uid);
      const userData = { email: user.email };
      set(newUserRef, userData);
  
      alert('User Signed up');
      console.log('User signed up:', user);
  
      // Reset the input fields
      setEmail('');
      setPassword('');
      setMessage('');
  
      setLoading(false); // Hide loader
      navigate('/signin');
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error Occur. Please try again later.');
  
      // Reset the input fields
      setEmail('');
      setPassword('');
      setMessage('');
  
      setLoading(false); // Hide loader
    }
  };
  

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {message && <p className="error-message">{message}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  );
}

export default SignUp;

