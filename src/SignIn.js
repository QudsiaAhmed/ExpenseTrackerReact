import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, get } from 'firebase/database';
import Main from './Main';
import Logout from './Logout';
import './SignIn.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader while signing in
    setError('');

    try {
      const userInLocalStorage = JSON.parse(localStorage.getItem('user'));

      if (userInLocalStorage) {
        // If a user is already in local storage, don't allow login
        setError('User is already logged in. Please logout first.');
        setLoading(false); // Hide loader
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const dbRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        // Save user information to local storage
        localStorage.setItem('user', JSON.stringify(user));

        console.log('User signed in:', user);
        setEmail('');
        setPassword('');
        setLoading(false); // Hide loader
        navigate('/main'); // Redirect to the home page
      } else {
        setError('User not found. Please sign up.');
        setLoading(false); // Hide loader
        setEmail(''); // Clear email field
        setPassword(''); // Clear password field
      }
    } catch (error) {
      alert('Error Occurred. Please try again later.');
      setLoading(false); // Hide loader
      console.error('Error occurred:', error);
      setEmail(''); // Clear email field
      setPassword(''); // Clear password field
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignIn}>
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
      {localStorage.getItem('user') && <Logout />}
    </div>
  );
}

export default SignIn;
