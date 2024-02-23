'use client'
import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image'
import { TransactionCount } from '@/app/lib/types';
export const revalidate = 0;

export default function Home() {
  const [contract, setContract] = useState('');
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [sortedTransactions, setSortedTransactions] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactionCounts = async () => {
    console.log(contract)
    if (!contract) {
      setError('Please enter a contract address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get<{ transactionCounts: TransactionCount }>(`/api/getTransactions/${contract}`);

      const total = Object.values(response.data.transactionCounts).reduce((sum, current) => sum + current, 0);
      setTotalTransactions(total);

      const sorted = Object.entries(response.data.transactionCounts).sort((a, b) => b[1] - a[1]);
      setSortedTransactions(sorted);

      setContractReady(true);

    } catch (err) {
      setError('Failed to fetch transaction counts');
    }
    setLoading(false);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      fetchTransactionCounts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Enter Contract Address</h1>
        <input
          type="text"
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Contract Address"
          className="mt-2 text-black w-1/2 h-10 px-3 rounded-lg border-2 border-black focus:outline-none focus:border-blue-500 transition duration-500 ease-in-out bg-white"
        />
        <button
          onClick={fetchTransactionCounts}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-500 ease-in-out"
        >
          Fetch Transactions
        </button>
      </div>
      {loading && <div className="text-center py-5">Loading...</div>}
      {error && <div className="text-center text-red-500 py-5">Error: {error}</div>}
      {contractReady && !loading && !error && (
        <>
          <h1 className="text-2xl font-bold text-center mb-8 text-white">Transactions</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedTransactions.map(([value, count]) => (
              <div key={value} className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center text-black">
                <span className="font-bold">{value}</span>
                <span>{count} transactions</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-white">
            <h2 className="text-lg font-bold">Total Transactions</h2>
            <p className="text-xl">{totalTransactions}</p>
          </div>
        </>
      )}

      <footer className='mt-20'>
        <h1 className="text-2xl font-bold text-center mb-8 text-white">Created by <a href='https://twitter.com/dhigh_eth' target='_blank' className='text-blue-500 hover:underline'>DanielHigh</a></h1>
        <Image
          src="/3600.png"
          width={150}
          height={150}
          alt="DanielHigh Penguin"
          className='mx-auto'
        />
      </footer>
    </div>
  );
}
