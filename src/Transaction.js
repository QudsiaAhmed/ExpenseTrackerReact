// import React, { useState } from 'react';

// const Transaction = ({ user, accounts, updateAccountBalance }) => {
//   const [transactionAmount, setTransactionAmount] = useState('');
//   const [transactionType, setTransactionType] = useState(''); // Initialize to an empty string
//   const [selectedAccount, setSelectedAccount] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   // Define the formatDate function
//   const formatDate = (date) => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(date).toLocaleDateString(undefined, options);
//   };

//   const handleTransaction = async () => {
//     if (!user || !transactionAmount.trim() || !selectedAccount || !transactionType) {
//       setAlertMessage('Please fill in all fields.');
//       return;
//     }

//     const amount = parseFloat(transactionAmount);
//     if (isNaN(amount)) {
//       setAlertMessage('Please enter a valid amount.');
//       return;
//     }

//     const transactionData = {
//       amount,
//       type: transactionType,
//       account: selectedAccount,
//       userId: user.uid,
//       date: formatDate(new Date()),
//     };

//     try {
//       if (transactionType === 'income' || transactionType === 'expense') {
//         // Update the account balance for income and expense transactions
//         await updateAccountBalance(
//           transactionData.account,
//           transactionData.amount,
//           transactionData.type
//         );
//       }

//       // Clear the input fields and reset to default values
//       setTransactionAmount('');
//       setSelectedAccount('');
//       setTransactionType(''); // Reset to an empty string
//       setAlertMessage('');
//     } catch (error) {
//       setAlertMessage(error.message);
//     }
//   };

//   return (
//     <div>
//       <h2>Money Flow</h2>
//       <div>
//         <input
//           type="number"
//           placeholder="Enter amount"
//           value={transactionAmount}
//           onChange={(e) => setTransactionAmount(e.target.value)}
//         />
//         <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
//           <option value="">Select an account</option>
//           {accounts.map((account) => (
//             <option key={account.key} value={account.name}>
//               {account.name}
//             </option>
//           ))}
//         </select>
//         <div>
//           <label>
//             <input
//               type="radio"
//               value="income"
//               checked={transactionType === 'income'}
//               onChange={() => setTransactionType('income')}
//             />
//             Income
//           </label>
//           <label>
//             <input
//               type="radio"
//               value="expense"
//               checked={transactionType === 'expense'}
//               onChange={() => setTransactionType('expense')}
//             />
//             Expense
//           </label>
//         </div>
//         <button onClick={handleTransaction}>Add Transaction</button>
//         {alertMessage && <p>{alertMessage}</p>}
//       </div>
//     </div>
//   );
// };

// export default Transaction;
