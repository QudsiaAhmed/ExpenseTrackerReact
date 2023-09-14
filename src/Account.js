import React, { useState, useEffect } from 'react';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { database, auth } from './firebase';
import Categories from './Categories';
import './Account.css';
import Logout from './Logout';

const defaultAccounts = ['Cash', 'Savings'];
const defaultCategories = ['Food', 'Groceries', 'Petrol', 'Bills'];
const Account = () => {
  const user = auth.currentUser;

  const [accounts, setAccounts] = useState(() => {
    const storedAccounts = localStorage.getItem('accounts');
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  });

  const [newAccount, setNewAccount] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    account: '',
    amount: 0,
    type: '',
    date: new Date().toISOString(),
    category: '', // Add a category field to the transaction
  });

  const [transactionHistory, setTransactionHistory] = useState(() => {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
  });

  const [totalAmount, setTotalAmount] = useState(() => {
    const storedTotalAmount = localStorage.getItem('totalAmount');
    return storedTotalAmount ? parseFloat(storedTotalAmount) : 0;
  });

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
          localStorage.setItem('userCategories', JSON.stringify(categoriesArray));
        } else {
          setUserCategories([]);
          localStorage.removeItem('userCategories');
        }
      });
    }
  }, [user]);

  const updateTransactionHistory = (newTransactionData) => {
    setTransactionHistory([...transactionHistory, newTransactionData]);

    if (newTransactionData.type === 'income') {
      setTotalAmount((prevTotalAmount) => prevTotalAmount + parseFloat(newTransactionData.amount));
    } else if (newTransactionData.type === 'expense') {
      setTotalAmount((prevTotalAmount) => prevTotalAmount - parseFloat(newTransactionData.amount));
    }
  };

  const createAccount = () => {
    if (user && newAccount.trim() !== '') {
      const existingAccount = accounts.find((account) => account.name === newAccount);
      if (existingAccount) {
        setAlertMessage('An account with the same name already exists.');
        setNewAccount('');
        return;
      }
      const accountData = { name: newAccount, userId: user.uid, balance: 0 };
      const accountsRef = ref(database, `accounts/${user.uid}`);
      push(accountsRef, accountData);
      setNewAccount('');
      setAlertMessage('');
    }
  };

  const deleteAccount = (accountToDelete) => {
    if (defaultAccounts.includes(accountToDelete)) return;
    const accountToDeleteKey = accounts.find((account) => account.name === accountToDelete)?.key;
    if (accountToDeleteKey) {
      const updatedAccounts = accounts.filter((account) => account.key !== accountToDeleteKey);
      const accountRef = ref(database, `accounts/${user.uid}/${accountToDeleteKey}`);

      const transactionsToDelete = transactionHistory.filter(
        (transaction) => transaction.account === accountToDelete
      );

      remove(accountRef)
        .then(() => {
          const updatedTransactionHistory = transactionHistory.filter(
            (transaction) => transaction.account !== accountToDelete
          );
          setTransactionHistory(updatedTransactionHistory);

          setAccounts(updatedAccounts);

          const total = updatedAccounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
          setTotalAmount(total);
          localStorage.setItem('totalAmount', total.toString());
        })
        .catch((error) => console.error('Error deleting account:', error));

      transactionsToDelete.forEach((transaction) => {
        const transactionRef = ref(database, `transactions/${user.uid}/${transaction.key}`);
        remove(transactionRef)
          .catch((error) => console.error('Error deleting transaction:', error));
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    const accountsRef = ref(database, `accounts/${user.uid}`);
    onValue(accountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const accountData = snapshot.val();
        const accountList = Object.keys(accountData).map((key) => ({ key, ...accountData[key] }));

        const defaultAccountsExist = defaultAccounts.every((defaultAccount) =>
          accountList.some((account) => account.name === defaultAccount)
        );

        if (!defaultAccountsExist) {
          defaultAccounts.forEach((defaultAccount) => {
            if (!accountList.some((account) => account.name === defaultAccount)) {
              const defaultAccountData = {
                name: defaultAccount,
                userId: user.uid,
                balance: 0,
              };
              push(accountsRef, defaultAccountData);
              accountList.push({ key: '', ...defaultAccountData });
            }
          });
        }

        const uniqueAccountsList = [];
        accountList.forEach((account) => {
          if (!uniqueAccountsList.some((uniqueAccount) => uniqueAccount.name === account.name)) {
            uniqueAccountsList.push(account);
          }
        });

        const total = uniqueAccountsList.reduce((sum, account) => sum + parseFloat(account.balance), 0);
        setTotalAmount(total);
        setAccounts(uniqueAccountsList);

        localStorage.setItem('accounts', JSON.stringify(uniqueAccountsList));
        localStorage.setItem('totalAmount', total.toString());
      } else {
        const defaultAccountsData = defaultAccounts.map((defaultAccount) => ({
          name: defaultAccount,
          userId: user.uid,
          balance: 0,
        }));
        defaultAccountsData.forEach((defaultAccountData) => {
          push(accountsRef, defaultAccountData);
        });
        setAccounts(defaultAccountsData);
        localStorage.setItem('accounts', JSON.stringify(defaultAccountsData));
        const initialTotal = defaultAccountsData.reduce((sum, account) => sum + parseFloat(account.balance), 0);
        setTotalAmount(initialTotal);
        localStorage.setItem('totalAmount', initialTotal.toString());
      }
    });

    const transactionsRef = ref(database, `transactions/${user.uid}`);
    onValue(transactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const transactionData = snapshot.val();
        const transactionList = Object.keys(transactionData).map((key) => ({
          key,
          ...transactionData[key],
        }));
        setTransactionHistory(transactionList);

        const total = transactionList.reduce((sum, transaction) => {
          if (transaction.type === 'income') {
            return sum + parseFloat(transaction.amount);
          } else if (transaction.type === 'expense') {
            return sum - parseFloat(transaction.amount);
          }
          return sum;
        }, 0);
        setTotalAmount(total);

        localStorage.setItem('transactions', JSON.stringify(transactionList));
        localStorage.setItem('totalAmount', total.toString());
      } else {
        setTransactionHistory([]);
        setTotalAmount(0);

        localStorage.removeItem('transactions');
        localStorage.removeItem('totalAmount');
      }
    });
  }, [user]);

  const handleTransactionSubmit = () => {
    if (!user) return;

    if (!newTransaction.account || !newTransaction.amount || !newTransaction.type || !newTransaction.category) {
      alert('Please fill in all fields.');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if ((newTransaction.type === 'income' && amount <= 0) ||
        (newTransaction.type === 'expense' && amount < 0)) {
      alert('Enter Amount in postive number.');
      return;
    }

    const selectedAccount = accounts.find((account) => account.name === newTransaction.account);

    if (!selectedAccount) {
      alert('Account not found.');
      return;
    }

    const updatedBalance = newTransaction.type === 'income' ?
      selectedAccount.balance + amount :
      selectedAccount.balance - amount;

    if (updatedBalance < 0) {
      alert('Not enough balance in the selected account.');
      return;
    }

    const accountRef = ref(database, `accounts/${user.uid}/${selectedAccount.key}`);

    update(accountRef, { balance: updatedBalance })
      .then(() => {
        const newTransactionData = {
          account: newTransaction.account,
          amount: amount,
          type: newTransaction.type,
          date: newTransaction.date,
          category: newTransaction.category,
        };

        const transactionsRef = ref(database, `transactions/${user.uid}`);
        push(transactionsRef, newTransactionData);

        updateTransactionHistory(newTransactionData);

        const updatedAccounts = accounts.map((account) => {
          if (account.key === selectedAccount.key) {
            return { ...account, balance: updatedBalance };
          }
          return account;
        });
        setAccounts(updatedAccounts);

        const total = updatedAccounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
        setTotalAmount(total);
        localStorage.setItem('totalAmount', total.toString());

        setNewTransaction({ account: '', amount: 0, type: '', date: new Date().toISOString(), category: '' });
        setAlertMessage('');
      })
      .catch((error) => {
        console.error('Error updating balance in the database:', error);
        alert('Error updating balance. Please try again later.');
      });
  };

  const uniqueAccounts = Array.from(new Set(accounts.map((account) => account.name)));

  return (
    <div className="account-container">
      <Logout />
      <h1 className="account-title">Accounts</h1>
      <p className="account-description">
        Users will be able to view all of their financial accounts.
      </p>

      <h2 className="account-section-title">All Accounts:</h2>
      <ul className="account-list">
        {accounts.map((account, index) => (
          <li key={index} className="account-item">
            {account.name} - Balance: ${parseFloat(account.balance).toFixed(2)}
            {!defaultAccounts.includes(account.name) && (
              <button onClick={() => deleteAccount(account.name)} className="delete-button">
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="account-section-title">Create Account:</h2>
      <div className="account-create">
        <input
          type="text"
          placeholder="Enter account name"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          className="account-input"
        />
        <button onClick={createAccount} className="create-button">
          Create
        </button>
        {alertMessage && <p className="alert-message">{alertMessage}</p>}
      </div>
      <Categories user={user} />

      <h2 className="account-section-title">Total Amount: ${parseFloat(totalAmount).toFixed(2)}</h2>

      <h2 className="account-section-title">Add Transaction:</h2>
      <div className="account-transaction">
        <select
          value={newTransaction.account}
          onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
          className="account-input"
        >
          <option value="">Select Account</option>
          {uniqueAccounts.map((accountName, index) => (
            <option key={index} value={accountName}>
              {accountName}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          className="account-input"
        />
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
          className="account-input"
        >
          <option value="">Select Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
  value={newTransaction.category}
  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
  className="account-input"
>
  <option value="">Select Category</option>
  {/*  options for default categories */}
  {defaultCategories.map((category, index) => (
    <option key={index} value={category}>
      {category}
    </option>
  ))}
  {/*  options for user-added categories */}
  {userCategories.map((category, index) => (
    <option key={index} value={category}>
      {category}
    </option>
  ))}
</select>

        <button onClick={handleTransactionSubmit} className="transaction-button">
          Add Transaction
        </button>
      </div>

      <h2 className="account-section-title">Transaction History:</h2>
      <table className="account-transaction-history">
        <thead>
          <tr>
            <th>Account</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactionHistory.map((transaction, index) => (
            <tr key={index} className="transaction-item">
              <td>{transaction.account}</td>
              <td>${parseFloat(Math.abs(transaction.amount)).toFixed(2)}</td>
              <td>{transaction.type}</td>
              <td>{transaction.category}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Account;
